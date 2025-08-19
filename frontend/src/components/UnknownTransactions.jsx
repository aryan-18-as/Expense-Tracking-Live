import React, { useEffect, useState } from "react";

export default function UnknownTransactions() {
  const [unknowns, setUnknowns] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/upload", {  // ✅ API hit
      method: "POST",
      body: new FormData(document.querySelector("#uploadForm")), // agar file upload karni hai
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔍 API Response:", data);
        setUnknowns(data.unknowns || []);   // ✅ only unknowns
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Categorize Unknown Transactions</h2>

      {unknowns.length === 0 ? (
        <p className="text-gray-500">✅ No unknown transactions found</p>
      ) : (
        unknowns.map((tx, idx) => (
          <div key={idx} className="border p-3 my-2 rounded-lg shadow">
            <p><b>Name:</b> {tx.Name || "N/A"}</p>
            <p><b>UPI:</b> {tx.UPI || "N/A"}</p>
            <p><b>Amount:</b> ₹{tx.Amount}</p>
            <select className="border rounded p-1 mt-2">
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>
          </div>
        ))
      )}
    </div>
  );
}
