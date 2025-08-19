// src/pages/Mapping.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Mapping({ transactions, unknowns, setTransactions }) {
  const [localUnknowns, setLocalUnknowns] = useState(unknowns || []);
  const [selectedCategories, setSelectedCategories] = useState({});
  const navigate = useNavigate();

  const handleChange = (name, category) => {
    setSelectedCategories((prev) => ({ ...prev, [name]: category }));
  };

  const handleSave = async () => {
    const mapping = {};
    Object.entries(selectedCategories).forEach(([name, category]) => {
      if (category) mapping[name] = category;
    });

    try {
      await api.post("/api/update-mapping", { mapping });
      alert("✅ Mapping saved successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to save mapping");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-bold">🔖 Categorization</h1>
          <p className="text-sm opacity-80">
            Review categorized & uncategorized transactions
          </p>
        </div>
      </header>

      <main className="container mx-auto flex-grow px-4 py-6 space-y-10">
        {/* ✅ Already Categorized */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ✅ Categorized Transactions
          </h2>
          <div className="bg-white shadow rounded-lg p-4 max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="py-2 px-3 text-left">Description</th>
                  <th className="py-2 px-3 text-center">Amount</th>
                  <th className="py-2 px-3 text-center">Category</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter((t) => t.Category && t.Category !== "Other")
                  .map((t, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{t.Description}</td>
                      <td
                        className={`py-2 px-3 text-center ${
                          t.Type === "DEBIT"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {t.Type === "DEBIT" ? "-" : "+"}₹{t.Amount}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {t.Category}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ❓ Unknown Transactions */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ❓ Uncategorized Transactions
          </h2>
          {localUnknowns.length === 0 ? (
            <p className="text-gray-500">🎉 No unknowns left!</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {localUnknowns.map((u, i) => (
                <div
                  key={i}
                  className="bg-white shadow-lg rounded-xl p-4 flex flex-col"
                >
                  <h3 className="font-medium text-gray-800 mb-2">
                    {u.Name}
                  </h3>
                  <p
                    className={`text-sm mb-3 ${
                      u.Amount < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {u.Amount < 0 ? "-" : "+"}₹{Math.abs(u.Amount)}
                  </p>

                  <select
                    className="border rounded-md px-3 py-2 text-sm"
                    value={selectedCategories[u.Name] || ""}
                    onChange={(e) =>
                      handleChange(u.Name, e.target.value)
                    }
                  >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills</option>
                    <option value="Travel">Travel</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Health">Health</option>
                    <option value="Family">Family</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Salary">Salary</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md"
          >
            Save & Continue →
          </button>
        </div>
      </main>
    </div>
 
  );
}