// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import html2canvas from "html2canvas";
import api from "../api";

export default function Dashboard({ transactions }) {
  const [summary, setSummary] = useState({ total_credit: 0, total_debit: 0 });
  const [byCategory, setByCategory] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [monthlySpend, setMonthlySpend] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");

  const chartRef = useRef();

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setSummary({ total_credit: 0, total_debit: 0 });
      setByCategory([]);
      setTopCategories([]);
      setMonthlySpend([]);
      return;
    }

    let credit = 0,
      debit = 0;
    const catMap = {};
    const monthMap = {};

    transactions.forEach((tx) => {
      if (!tx) return;
      const amt = Math.abs(Number(tx.Amount) || 0);
      const date = tx.Date ? new Date(tx.Date) : null;
      const month = date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : null;

      if (selectedCategory !== "All" && tx.Category !== selectedCategory) return;
      if (selectedMonth !== "All" && month !== selectedMonth) return;

      if (tx.Type === "CREDIT") credit += amt;
      else debit += amt;

      if (tx.Category && tx.Category !== "Other") {
        catMap[tx.Category] = (catMap[tx.Category] || 0) + amt;
      }

      if (month) {
        monthMap[month] = (monthMap[month] || 0) + amt;
      }
    });

    setSummary({ total_credit: credit, total_debit: debit });

    const catArray = Object.entries(catMap).map(([name, value]) => ({
      name,
      value,
    }));

    setByCategory(catArray);
    setTopCategories([...catArray].sort((a, b) => b.value - a.value).slice(0, 5));

    const monthArray = Object.entries(monthMap).map(([month, value]) => ({
      month,
      value,
    }));
    setMonthlySpend(monthArray.sort((a, b) => a.month.localeCompare(b.month)));
  }, [transactions, selectedCategory, selectedMonth]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A020F0",
    "#FF4444",
    "#22CC22",
  ];

  const categories = [
    "All",
    ...new Set(transactions.map((tx) => tx.Category).filter(Boolean)),
  ];
  const months = [
    "All",
    ...new Set(
      transactions
        .map((tx) => {
          if (!tx?.Date) return null;
          const d = new Date(tx.Date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        })
        .filter(Boolean)
    ),
  ];

  const handleExportExcel = async () => {
    try {
      const res = await api.post(
        "/api/export",
        { transactions, format: "xlsx" },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense_report.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Excel export failed!");
      console.error(err);
    }
  };

  const handleSaveChartAsJPG = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement("a");
    link.download = "dashboard_chart.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.9);
    link.click();
  };

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-4">📊 Expense Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-green-100 rounded-xl p-6 shadow hover:shadow-lg transition">
          <h3 className="text-lg font-semibold">Total Credited</h3>
          <p className="text-2xl font-bold text-green-700">
            ₹{Number(summary.total_credit || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-red-100 rounded-xl p-6 shadow hover:shadow-lg transition">
          <h3 className="text-lg font-semibold">Total Debited</h3>
          <p className="text-2xl font-bold text-red-700">
            ₹{Number(summary.total_debit || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          className="border px-4 py-2 rounded"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          className="border px-4 py-2 rounded"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {months.map((m, i) => (
            <option key={i} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Charts + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center" ref={chartRef}>
        {/* Donut Chart */}
        <div className="bg-white shadow rounded-xl p-6 col-span-2">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={byCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                dataKey="value"
                paddingAngle={5} // ✅ spacing between slices
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {byCategory.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `₹${val}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Categories */}
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
          <ul className="space-y-2">
            {topCategories.map((cat, idx) => (
              <li
                key={idx}
                className="flex justify-between border-b pb-1 text-gray-700"
              >
                <span>{idx + 1}. {cat.name}</span>
                <span className="font-semibold">₹{cat.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Category-wise Spend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={byCategory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(val) => `₹${val}`} />
            <Bar dataKey="value" fill="#0088FE" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Extra Chart: Monthly Spend Trend */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Spend Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlySpend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(val) => `₹${val}`} />
            <Line type="monotone" dataKey="value" stroke="#FF4444" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleExportExcel}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          ⬇️ Download Excel Report
        </button>
        <button
          onClick={handleSaveChartAsJPG}
          className="bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          📷 Save Charts as JPG
        </button>
      </div>
    </div>
  );
}
