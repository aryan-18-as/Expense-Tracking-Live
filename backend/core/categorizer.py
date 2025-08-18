# core/categorizer.py

import re
import pandas as pd

CATEGORY_RULES = {
    "Food": [
        "swiggy", "zomato", "dominos", "pizza", "burger",
        "restaurant", "hotel", "tiffin", "dhaba", "food", "tea", "cake", "pan" , "roll" , "misthan"
    ],
    "Groceries": [
        "bigbasket", "blinkit", "grofers", "dmart", "grocery", "supermarket", "kirana", "namkeen", "dairy"
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "ajio", "snapdeal", "shop", "traders"
    ],
    "Bills": [
        "electricity", "water", "gas", "recharge", "dth", "postpaid", "bill", "myjio"
    ],
    "Travel": [
        "uber", "ola", "irctc", "makemytrip", "yatra", "redbus", "flight", "train", "bus"
    ],
    "Entertainment": [
        "bookmyshow", "spotify", "netflix", "prime", "hotstar"
    ],
    "Family" : [
        "papa" , "di" , "bhaiya" , "mummy"
    ] , 
    "Health": [
        "pharmacy", "apollo", "1mg", "practo", "doctor", "hospital", "medicine"
    ],
    "Salary": [
        "salary", "credited by", "payout", "income"
    ],
    "Transfer": [
        "upi", "imps", "neft", "rtgs", "fund transfer", "google pay", "gpay"
    ],
    "Stationery": [
        "stationery", "photocopy", "PRINTERS", "xerox", "students gallery" , "printers"
    ],
    "Other": []
}


def categorize_transactions(df: pd.DataFrame):
    """Categorize transactions + group unknowns by unique description"""
    if "Description" not in df.columns:
        raise KeyError("Description column not found in statement")

    df["Category"] = "Other"
    unknowns = []

    for idx, row in df.iterrows():
        desc = str(row.get("Description", "")).lower().strip()
        matched = False

        # 🔍 Try rule-based matching
        for category, keywords in CATEGORY_RULES.items():
            for kw in keywords:
                if re.search(rf"\b{kw}\b", desc):
                    df.at[idx, "Category"] = category
                    matched = True
                    break
            if matched:
                break

        # 📝 Collect unknowns if no category matched
        if not matched:
            amount = row.get("Amount", 0)
            if row.get("Type") == "DEBIT":
                amount = -abs(amount)
            else:
                amount = abs(amount)

            unknowns.append({
                "Name": row.get("Description", "N/A").strip(),
                "UPI": row.get("UPI", "N/A") if "UPI" in row else "N/A",
                "Amount": amount
            })

    # ✅ Group by unique Name
    if unknowns:
        unknowns_df = pd.DataFrame(unknowns)
        unknowns_df = unknowns_df.groupby("Name", as_index=False).agg({
            "UPI": "first",
            "Amount": "sum"
        })
        unknowns = unknowns_df.to_dict(orient="records")

    print("📝 Final Unknowns Preview", unknowns[:10])
    return df, unknowns
