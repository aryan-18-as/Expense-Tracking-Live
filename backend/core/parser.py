# core/parser.py

import pandas as pd
import pdfplumber
import re

def parse_pdf(file):
    """Parse bank statement PDF into structured DataFrame"""
    text = ""
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"

    rows = []
    for line in text.splitlines():
        # Match transactions like: Aug 15, 2025 Paid to XYZ DEBIT ₹100
        match = re.match(
            r"([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}).*?(?:Paid to|Received from)\s+(.*?)\s+(DEBIT|CREDIT)\s*₹?([\d,]+)",
            line,
            re.IGNORECASE
        )
        if match:
            date, desc, ttype, amount = match.groups()
            amount_val = float(amount.replace(",", ""))
            if ttype.upper() == "DEBIT":
                amount_val = -amount_val  # debit = negative
            else:
                amount_val = +amount_val  # credit = positive

            rows.append({
                "Date": pd.to_datetime(date, errors="coerce"),
                "Description": desc.strip(),
                "Amount": amount_val,
                "Type": ttype.upper()
            })

    df = pd.DataFrame(rows)

    # Group by description → sum amounts
    if not df.empty:
        df = df.groupby(["Date", "Description", "Type"], as_index=False)["Amount"].sum()

    return df


def parse_csv(file):
    """Parse CSV or Excel into standardized DataFrame"""
    if file.filename.lower().endswith(".csv"):
        df = pd.read_csv(file)
    else:
        df = pd.read_excel(file)

    df.columns = [c.strip().capitalize() for c in df.columns]

    if "Amount" in df.columns:
        df["Amount"] = pd.to_numeric(df["Amount"], errors="coerce").fillna(0)

    return df
