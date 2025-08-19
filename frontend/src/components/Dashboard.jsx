import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseContext from "../context/ExpenseContext";

export default function Dashboard() {
  const { expenses } = useContext(ExpenseContext);
  const navigate = useNavigate();

  const total = expenses.reduce((acc, e) => acc + e.amount, 0);

  const grouped = expenses.reduce((acc, e) => {
    const cat = e.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <p className="text-lg mb-6">Total Expenses: ₹{total}</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {Object.entries(grouped).map(([cat, amt]) => (
          <div
            key={cat}
            className="bg-white shadow rounded-lg p-4 flex justify-between"
          >
            <span>{cat}</span>
            <span>₹{amt}</span>
          </div>
        ))}
      </div>

      {/* Dummy dashboard image */}
      <img
        src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=80"
        alt="Dashboard Preview"
        className="mx-auto rounded-lg shadow mb-6 max-w-2xl"
      />

      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
      >
        Upload More Data
      </button>
    </div>
  );
}
