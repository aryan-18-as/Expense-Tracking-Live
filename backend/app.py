from flask import Flask, request, send_file, Response
from flask_cors import CORS
from flask_compress import Compress
import pandas as pd
import io, json, logging
from datetime import datetime

# --- Your existing core modules ---
from core.parser import parse_pdf, parse_csv   # ✅ fixed import
from core.categorizer import categorize_transactions
from core.mapping import update_mapping, DEFAULT_CATEGORIES

# ✅ Suppress pdfminer warnings
logging.getLogger("pdfminer").setLevel(logging.ERROR)

app = Flask(__name__)

# Allow big uploads (e.g., large PDFs)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50MB

# CORS + compression for large JSON payloads
CORS(app, resources={r"/*": {"origins": "*"}})
Compress(app)

# ---------- Standardization helpers ----------
COLUMN_ALIASES = {
    "transaction details": "Description",
    "narration": "Description",
    "details": "Description",
    "description": "Description",

    "date": "Date",
    "txn date": "Date",
    "transaction date": "Date",

    "amount": "Amount",
    "amt": "Amount",
    "transaction amount": "Amount",

    "type": "Type",
    "dr/cr": "Type",
    "transaction type": "Type",
}


def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Force to: Date, Description, Type, Amount (tolerant to many source headers)."""
    original_cols = list(df.columns)
    print("📌 Raw Columns from file =>", original_cols)

    # Map aliases
    rename_map = {}
    for col in df.columns:
        key = str(col).strip().lower()
        rename_map[col] = COLUMN_ALIASES.get(key, col)
    df = df.rename(columns=rename_map)

    # Ensure required columns exist
    for col in ["Date", "Description", "Type", "Amount"]:
        if col not in df.columns:
            df[col] = None

    # Clean types
    try:
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    except Exception:
        pass

    df["Amount"] = pd.to_numeric(df["Amount"], errors="coerce").fillna(0)

    # Normalize Type to DEBIT/CREDIT
    df["Type"] = df["Type"].astype(str).str.upper()
    df.loc[df["Type"].str.startswith("D", na=False), "Type"] = "DEBIT"
    df.loc[df["Type"].str.startswith("C", na=False), "Type"] = "CREDIT"
    # Fallback: if empty, assume DEBIT (safer for spends)
    df["Type"] = df["Type"].replace({"NONE": "DEBIT", "NAN": "DEBIT"})

    df = df[["Date", "Description", "Type", "Amount"]]
    print("✅ After Standardization =>", list(df.columns))
    return df


def json_response(payload: dict, status: int = 200) -> Response:
    """Safe JSON response for large payloads + compression."""
    return Response(
        json.dumps(payload, default=str),
        status=status,
        mimetype="application/json",
    )


# -------------------- Routes --------------------
def home():
    return {"message": "Backend is running successfully 🚀"}


@app.route("/api/health")
def health():
    return json_response({"status": "ok", "time": datetime.now().isoformat()})


@app.route("/api/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return json_response({"error": "No file uploaded"}, 400)

    f = request.files["file"]

    try:
        # Parse by file type
        name = (f.filename or "").lower()
        if name.endswith(".pdf"):
            df = parse_pdf(f)   # ✅ updated parser handles debit/credit
        elif name.endswith((".csv", ".xlsx")):
            df = parse_csv(f)
        else:
            return json_response({"error": "Only PDF/CSV/XLSX supported"}, 400)

        # Standardize & categorize
        df = standardize_columns(df)
        df, unknowns = categorize_transactions(df)

        # ✅ Only uncategorized go for mapping
        final_unknowns = [u for u in unknowns if not u.get("Category")]

        print("📝 Final Unknowns Preview", final_unknowns)
        print(f"🚀 Sending {len(df)} transactions, {len(final_unknowns)} unknown groups")

        return json_response({
            "categories": DEFAULT_CATEGORIES,
            "unknowns": final_unknowns,
            "transactions": df.to_dict(orient="records"),
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return json_response({"error": f"Parse failed: {str(e)}"}, 500)


@app.route("/api/update-mapping", methods=["POST"])
def update_map():
    data = request.get_json(force=True, silent=True) or {}
    mp = data.get("mapping", {})
    update_mapping(mp)
    return json_response({"message": "Mapping saved", "count": len(mp)})


@app.route("/api/dashboard", methods=["POST"])
def dashboard():
    data = request.get_json(force=True, silent=True) or {}
    tx = data.get("transactions", [])
    if not tx:
        return json_response({"error": "No transactions provided"}, 400)

    df = standardize_columns(pd.DataFrame(tx))
    df, _ = categorize_transactions(df)

    total_credit = float(df.loc[df["Type"] == "CREDIT", "Amount"].sum())
    total_debit = float(df.loc[df["Type"] == "DEBIT", "Amount"].sum())
    balance_left = round(total_credit - total_debit, 2)

    by_category = (
        df.groupby("Category")["Amount"]
        .sum()
        .sort_values(ascending=False)
        .round(2)
        .to_dict()
    )

    return json_response({
        "summary": {
            "total_credit": round(total_credit, 2),
            "total_debit": round(total_debit, 2),
            "balance_left": balance_left,
        },
        "by_category": by_category,
        "transactions": df.to_dict(orient="records"),
    })


@app.route("/api/export", methods=["POST"])
def export_report():
    data = request.get_json(force=True, silent=True) or {}
    tx = data.get("transactions", [])
    fmt = (data.get("format") or "xlsx").lower()
    if not tx:
        return json_response({"error": "No transactions provided"}, 400)

    df = standardize_columns(pd.DataFrame(tx))
    df, _ = categorize_transactions(df)

    total_credit = float(df.loc[df["Type"] == "CREDIT", "Amount"].sum())
    total_debit = float(df.loc[df["Type"] == "DEBIT", "Amount"].sum())
    balance_left = round(total_credit - total_debit, 2)

    summary_df = pd.DataFrame(
        {"Metric": ["Total Credited", "Total Debited", "Balance Left"],
         "Value": [round(total_credit, 2), round(total_debit, 2), balance_left]}
    )

    by_category = (
        df.groupby("Category")["Amount"].sum().sort_values(ascending=False).reset_index()
    )

    df["_Month"] = pd.to_datetime(df["Date"]).dt.to_period("M").astype(str)
    monthly_spend = (
        df[df["Type"] == "DEBIT"]
        .groupby("_Month")["Amount"].sum().reset_index().rename(columns={"Amount": "Monthly Spend"})
    )

    if fmt == "csv":
        buf = io.StringIO()
        df.drop(columns=["_Month"], errors="ignore").to_csv(buf, index=False)
        mem = io.BytesIO(buf.getvalue().encode("utf-8"))
        filename = f"expense_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return send_file(mem, as_attachment=True, download_name=filename, mimetype="text/csv")

    mem = io.BytesIO()
    with pd.ExcelWriter(mem, engine="openpyxl") as writer:
        df.drop(columns=["_Month"], errors="ignore").to_excel(writer, index=False, sheet_name="Transactions")
        summary_df.to_excel(writer, index=False, sheet_name="Summary")
        by_category.to_excel(writer, index=False, sheet_name="ByCategory")
        monthly_spend.to_excel(writer, index=False, sheet_name="Monthly")
    mem.seek(0)
    filename = f"expense_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return send_file(
        mem,
        as_attachment=True,
        download_name=filename,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


if __name__ == "__main__":
    # Use 0.0.0.0 so Vite can reach it
    app.run(host="0.0.0.0", port=5000, debug=True)

