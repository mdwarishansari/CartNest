# CartNest Backend

Live - https://cartnest-backend.onrender.com

## Overview

CartNest backend powers a **multi-vendor marketplace platform** where small sellers can list products and customers can purchase them securely.

It provides:

- Authentication via Firebase
- Product management for sellers
- Admin verification system
- Cart and order management
- Secure Razorpay payments
- Cloudinary image storage
- Email notifications via SMTP
- Redis caching and stock locks
- RESTful API for frontend

The backend is built with **Node.js + Express + MongoDB** following modular architecture.

---

# Tech Stack

Core technologies used:

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Firebase Admin SDK
- Cloudinary
- Razorpay
- Redis
- Nodemailer (SMTP)
- JWT (optional session token)

---

# Project Structure

```
backend
│
├── src
│
├── modules
│   ├── user
│   ├── seller
│   ├── product
│   ├── payment
│
├── utils
│
├── app.js
├── server.js
│
├── .env
├── .env.example
│
└── package.json
```

Each module contains:

```
controller
service
model
routes
```

This keeps the project scalable and maintainable.

---

# Features

## Authentication

Handled using **Firebase Authentication**.

Supported login methods:

- Email + Password
- Google Login

Flow:

```
Frontend login → Firebase
        ↓
ID token generated
        ↓
Backend verifies using Firebase Admin SDK
```

---

## Seller System

Users can register as sellers.

Each seller has:

```
seller profile
shop name
shop logo
shop slug
sales metrics
```

Sellers can:

- Add products
- Manage products
- View orders
- Update order status

---

## Product Management

Products include:

```
title
description
price
MRP
category
stock
images
verification state
```

Images are uploaded to **Cloudinary**.

Products require **admin verification** before appearing in the marketplace.

---

## Cart System

Each user has a cart containing:

```
product
quantity
price snapshot
seller reference
```

Cart operations:

- add item
- update quantity
- remove item

---

## Order & Payment System

Payments are processed using **Razorpay**.

Checkout flow:

```
User checkout
↓
Backend reserves stock
↓
Backend creates Razorpay order
↓
Frontend opens Razorpay checkout
↓
Payment success
↓
Backend verifies payment signature
↓
Order confirmed
```

---

## Stock Protection

To prevent overselling:

- MongoDB atomic updates
- Redis distributed locks

Example stock update:

```js
await Product.findOneAndUpdate(
  { _id: productId, stock: { $gte: qty } },
  { $inc: { stock: -qty, reserved: qty } },
);
```

---

## Email Notifications

Emails are sent using SMTP.

Used for:

- password reset
- order confirmation
- admin notifications
- contact form replies

SMTP uses **Gmail App Password** for development.

---

## Contact System

Users can submit queries.

Admins can view and respond through admin panel.

No realtime socket system is used.

---

# API Endpoints

## Authentication

```
POST /api/auth/session
GET  /api/auth/me
```

---

## Users

```
GET  /api/users/:email
PUT  /api/users/:email
POST /api/users/:email/address
```

---

## Seller

```
POST /api/seller/register
GET  /api/seller/:id/dashboard
POST /api/seller/:id/product
PUT  /api/seller/:id/product/:pid
GET  /api/seller/:id/products
```

---

## Products

```
GET /api/products
GET /api/products/:slug
```

---

## Cart

```
GET    /api/cart
POST   /api/cart
PUT    /api/cart
DELETE /api/cart/:productId
```

---

## Orders

```
POST /api/orders/checkout
POST /api/payments/verify
```

---

## Admin

```
GET  /api/admin/products
GET  /api/admin/orders
POST /api/admin/category
POST /api/admin/verifier
```

---

## Contact

```
POST /api/contact
GET  /api/admin/contact-queries
POST /api/contact/:id/reply
```

---

# Environment Variables

Create a `.env` file.

Example:

```
NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

REDIS_URL=redis://localhost:6379

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

---

# Running the Backend

Install dependencies:

```
npm install
```

Start development server:

```
npm run dev
```

Or:

```
node src/server.js
```

Server runs on:

```
http://localhost:5000
```

---

# Deployment

Recommended hosting:

```
Render
Railway
AWS
```

Steps:

1. Push code to GitHub
2. Connect repo to hosting platform
3. Add environment variables
4. Deploy backend
5. Update `FRONTEND_URL`

---

# Security Practices

- Sensitive keys stored in `.env`
- Firebase token verification
- Razorpay signature verification
- Cloudinary API secret restricted to backend
- Input validation for API routes

---

# Future Improvements

Possible upgrades:

- Redis caching layer
- Background job queue
- Seller payout automation
- Advanced analytics dashboard
- Image optimization pipeline

---

# License

This project is for educational and portfolio purposes.
