ShopKart — MERN eCommerce Platform

ShopKart is a full-stack eCommerce web application built using the MERN stack with Buyer and Seller roles. Buyers can browse and purchase products, while sellers manage their own listings through a dedicated dashboard. The UI is inspired by Flipkart/Amazon-style layouts with a clean and minimal design.

---

## 🚀 Features

- Buyer & Seller authentication (JWT)
- Seller dashboard for product management
- Category-based product browsing
- Filtering and sorting system
- Cart and checkout flow
- Order tracking for buyers and sellers
- Fully responsive UI with smooth animations

---

## 🧱 Tech Stack

Frontend: React, React Router, Axios, Bootstrap  
Backend: Node.js, Express.js, MongoDB, JWT  
Database: MongoDB (shop)

---

## 📂 Project Structure

ShopKart/
├── backend/
├── frontend/
└── README.md

cd backend
npm install
npm start
Create .env file:

MONGO_URI=your_connection_string
JWT_SECRET=your_secret_key
Frontend Setup
cd frontend
npm install
npm start
Add proxy inside frontend/package.json:

"proxy": "http://localhost:5000"
🔗 API Endpoints
/api/users
/api/products
/api/orders

🎯 Highlights
Flipkart/Amazon-inspired UI

Role-based access (Buyer & Seller)

Clean and scalable architecture

👩‍💻 Author

Developed by Pragathi
Computer Science & Business Systems
Full Stack Developer

⭐ Show Your Support

If you like this project:

Star the repository ⭐

Fork the project 🍴

Share with others 🚀
