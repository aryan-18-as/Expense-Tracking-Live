// src/App.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import Mapping from "./pages/Mapping";
import Dashboard from "./pages/Dashboard";
import UnknownTransactions from "./components/UnknownTransactions"; // ✅ new page import

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [unknowns, setUnknowns] = useState([]);

  return (
    <Routes>
      {/* Upload Page */}
      <Route
        path="/"
        element={
          <Upload
            setTransactions={setTransactions}
            setUnknowns={setUnknowns}
          />
        }
      />

      {/* Unknown Transactions Page */}
      <Route
        path="/unknowns"
        element={
          <UnknownTransactions
            unknowns={unknowns}
            setUnknowns={setUnknowns}
            transactions={transactions}
            setTransactions={setTransactions}
          />
        }
      />

      {/* Mapping Page */}
      <Route
        path="/mapping"
        element={
          <Mapping
            transactions={transactions}
            unknowns={unknowns}
            setTransactions={setTransactions}
          />
        }
      />

      {/* Dashboard Page */}
      <Route
        path="/dashboard"
        element={<Dashboard transactions={transactions} />}
      />
    </Routes>
  );
}
