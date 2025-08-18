import pandas as pd
import re

def standardize_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardize columns of parsed statement into:
    Date | Description | Type | Amount
    """

    # Lowercase all column names for matching
    cols = [c.lower() for c in df.columns]

    # Map possible column names
    col_map = {}
    for c in df.columns:
        cl = c.lower()
        if "date" in cl:
            col_map["Date"] = c
        elif "description" in cl or "details" in cl or "narration" in cl:
            col_map["Description"] = c
        elif "amount" in cl and "credit" not in cl and "debit" not in cl:
            col_map["Amount"] = c
        elif "type" in cl:
            col_map["Type"] = c
        elif "debit" in cl and "amount" in cl:
            col_map["Amount"] = c
            col_map["Type"] = "DEBIT"
        elif "credit" in cl and "amount" in cl:
            col_map["Amount"] = c
            col_map["Type"] = "CREDIT"

    # Build new DF
    new_df = pd.DataFrame()

    # Date
    if "Date" in col_map:
        new_df["Date"] = pd.to_datetime(df[col_map["Date"]], errors="coerce")
    else:
        new_df["Date"] = pd.NaT

    # Description
    new_df["Description"] = df[col_map.get("Description", df.columns[0])].astype(str)

    # Amount
    new_df["Amount"] = pd.to_numeric(df[col_map.get("Amount", df.columns[-1])], errors="coerce").fillna(0)

    # Type
    if "Type" in col_map and col_map["Type"] in df.columns:
        new_df["Type"] = df[col_map["Type"]].astype(str)
    elif col_map.get("Type") == "DEBIT":
        new_df["Type"] = "DEBIT"
    elif col_map.get("Type") == "CREDIT":
        new_df["Type"] = "CREDIT"
    else:
        # Guess type: if amount < 0 → Debit else Credit
        new_df["Type"] = new_df["Amount"].apply(lambda x: "DEBIT" if x > 0 else "CREDIT")

    return new_df
