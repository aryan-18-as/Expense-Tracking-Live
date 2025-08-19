// src/pages/Upload.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon } from "lucide-react";
import api from "../api";

export default function Upload({ setTransactions, setUnknowns }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF/CSV/XLSX file");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTransactions(res.data.transactions || []);
      setUnknowns(res.data.unknowns || []);
      navigate("/mapping");
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "Upload failed";
      alert("Upload failed: " + msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-bold">💰 Expense Tracker</h1>
          <p className="text-sm opacity-80">
            Smart way to manage your money
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex justify-center mt-10">
        <img
          src="https://img.freepik.com/free-vector/financial-data-concept-illustration_114360-796.jpg"
          alt="Upload Illustration"
          className="w-64 h-64 object-contain"
        />
      </div>

      {/* Upload Card */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Upload Bank Statement
          </h2>

          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition">
            <UploadIcon className="w-10 h-10 text-blue-500 mb-2" />
            <span className="text-gray-600">
              {file ? file.name : "Click or drag & drop to upload"}
            </span>
            <input
              type="file"
              accept=".pdf,.csv,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg shadow-lg hover:scale-105 transition"
            >
              {loading ? "Uploading..." : "Upload & Categorize"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4 mt-10 border-t">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} Expense Tracker | Built by ❤️ Aryan Saxena
        </p>
      </footer>
    </div>
  );
}
