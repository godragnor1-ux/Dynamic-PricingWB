# Dynamic Pricing Web App

A full-stack e-commerce application that demonstrates **real-time dynamic pricing**. Product prices automatically adapt based on supply (current inventory) and demand (product views and successful purchases) using database-level logic.

## 🚀 Features
- **Dynamic Pricing Engine**: MySQL Stored Procedures and Triggers automatically recalculate prices based on view count, sold count, and stock quantity.
- **Real-Time Price Updates**: Prices are capped dynamically with minimum and maximum thresholds (up to a 50% surge limit and 20% max discount).
- **Interactive UI**: A modern React frontend displaying real-time price fluctuations, inventory status, and a sleek checkout confirmation modal.
- **RESTful API**: Node.js & Express backend serving products and processing checkout transactions.

## 🛠 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express, cors, mysql2
- **Database**: MySQL

## 💻 Running Locally

### 1. Database Setup
Make sure you have MySQL running. Execute the provided SQL scripts to create the `DEdbms` database, tables, stored procedures, triggers, and seed the data.

### 2. Start the Backend
The backend runs on **port 5001**.
```bash
cd backend
npm install
node server.js
```
*API Base URL: `http://localhost:5001`*

### 3. Start the Frontend
The frontend uses Vite and runs on **port 5174** (or `5173` depending on availability).
```bash
cd frontend
npm install
npm run dev
```
*Frontend URL: `http://localhost:5174/`*

## 📈 Pricing Algorithm
The system utilizes a balanced dynamic pricing formula:
- **+3% price increase** for every 5 items sold.
- **+0.1% price increase** for every 10 views.
- **-0.5% price discount** for every unit remaining in stock.
- All prices are in Indian Rupees (₹).
