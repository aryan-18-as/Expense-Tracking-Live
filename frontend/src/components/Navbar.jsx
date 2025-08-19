import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="text-lg font-bold">Expense Tracker</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Upload</Link>
        <Link to="/mapping" className="hover:underline">Mapping</Link>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/about" className="hover:underline">About</Link>
      </div>
    </nav>
  );
}
