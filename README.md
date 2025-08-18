📌 Project: AI-Powered Expense Tracker
🔹 Problem Statement

Managing personal finances is often confusing when bank statements and UPI records are scattered across different formats (PDFs, Excel, CSV). Manual categorization takes time, makes analysis difficult, and users lose visibility on where their money actually goes.

🔹 Solution

I built an Expense Tracking System that:
✅ Uploads bank statements in any format (PDF, Excel, CSV)
✅ Automatically extracts and categorizes transactions (food, shopping, bills, travel, etc.) using rule-based + keyword mapping
✅ Provides a clean mapping page where unknown merchants can be assigned categories
✅ Generates a smart Dashboard with:

📊 Donut chart → Expenses by category

📈 Monthly spend trend → Track financial habits

📑 Top 5 categories list → Quick insights

📉 Bar chart → Category-wise spend comparison
✅ Allows filters by category & month for flexible insights
✅ Exports full report as Excel
✅ Saves visual dashboard as JPG snapshot

🔹 Tech Stack

Frontend: React (Vite, TailwindCSS, Recharts for visualization)

Backend: Flask (Python, Pandas, pdfplumber for PDF parsing)

Database: In-memory (extendable to PostgreSQL/MySQL)

Deployment: Render (Backend) + Netlify (Frontend)

🔹 Key Features

🗂️ Categorization Engine → Automatically tags expenses like Food, Stationery, Bills, Travel

🎨 Interactive UI/UX → Upload, map, and visualize seamlessly

📤 Downloadable Reports → Excel reports with categorized spends

📷 Export Dashboard → Save insights as an image

⚡ SPA with Filters → Select month & category dynamically

🔹 Impact

This system turns raw bank statements into actionable financial insights — helping users track spending patterns, control unnecessary expenses, and make data-driven personal finance decisions.
