<p align="center">
  <img src="frontend/public/logo.png" alt="CartNest Logo" width="120" />
</p>

<h1 align="center">🛒 CartNest</h1>

<p align="center">
  <strong>A Full-Stack Multi-Vendor E-Commerce Marketplace</strong>
  <br />
  <em>Empowering local sellers with a modern, secure platform</em>
</p>
<p align="center">
  <a href="https://cartnest-shop.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🌐 Live Demo-Visit Now-0A66C2?style=for-the-badge" alt="Live Demo"/>
  </a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwidcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-3395FF?logo=razorpay&logoColor=white" alt="Razorpay" />
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [User Roles](#-user-roles)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**CartNest** is a lightweight yet feature-rich multi-vendor marketplace that allows local sellers to list products, manage inventory, and receive orders — while customers enjoy a seamless shopping experience with secure Razorpay payments.

The platform supports **four distinct user roles** (Customer, Seller, Admin, Verifier) with role-based access control, product verification workflows, commission tracking, and comprehensive dashboards for each role.

---

## ✨ Key Features

### 🛍️ Customer Experience

- **Product Browsing** — Search, filter by category/price/sort, and view detailed product pages
- **Shopping Cart** — Add to cart, update quantities, and price-at-add snapshot
- **Secure Checkout** — Razorpay payment gateway with address management
- **Order Tracking** — View order history, status updates, and cancel orders
- **Account Management** — Profile editing, address book with default address

### 🏪 Seller Portal

- **Shop Dashboard** — Revenue stats, order counts, and performance charts (Recharts)
- **Product Management** — Create, edit, delete products with multi-image upload (Cloudinary)
- **Order Fulfillment** — View incoming orders and update statuses (processing → shipped → delivered)
- **Shop Profile** — Customize shop name, description, and logo
- **10% Commission Model** — Transparent commission with net earnings tracking

### 🔒 Admin Panel

- **Admin Dashboard** — Platform-wide stats: users, orders, revenue, products
- **Product Verification** — Approve/reject seller-submitted products
- **User Management** — View all users, delete accounts (cascades Firebase + DB)
- **Order Oversight** — Full order management across all sellers
- **Seller Payouts** — Track seller earnings, commissions, and mark payouts as paid
- **Contact Management** — View, reply, and manage customer inquiries
- **Verifier Account Creation** — Create verifier accounts for product moderation

### ✅ Verifier Dashboard

- **Product Review** — Dedicated interface to verify/reject pending products
- **Account Management** — Profile and statistics overview

### 🔧 Technical Highlights

- **Firebase Authentication** — Secure sign-up/login with email verification
- **Cloudinary CDN** — Signed image uploads for products and shop logos
- **Redis Caching** — Optimized stock locking with distributed locks
- **Role-Based Auth** — JWT tokens with middleware-enforced access control
- **Responsive Design** — Mobile-first UI with Framer Motion animations
- **API Security** — Helmet, CORS, express-validator, and async error handling

---

## 🛠️ Tech Stack

| Layer        | Technology                                                              |
| ------------ | ----------------------------------------------------------------------- |
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Framer Motion, Recharts, Lucide Icons |
| **Backend**  | Node.js, Express 4, Mongoose 8                                          |
| **Database** | MongoDB Atlas                                                           |
| **Auth**     | Firebase Authentication (Client) + Firebase Admin SDK (Server) + JWT    |
| **Payments** | Razorpay (Order creation + Payment verification + Webhook support)      |
| **Storage**  | Cloudinary (Signed uploads for product images & shop logos)             |
| **Cache**    | Redis / Upstash (Distributed locking for stock management)              |
| **Email**    | Nodemailer (SMTP — Gmail App Passwords or SendGrid)                     |
| **Styling**  | Tailwind CSS 4 + custom CSS animations + Framer Motion                  |

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  Pages   │  │Components│  │ Services │  │  Contexts    │  │
│  │(8 public │  │(Layout,  │  │(API layer│  │(AuthContext, │  │
│  │ + role   │  │ UI)      │  │ Axios)   │  │ CartContext) │  │
│  │ dashbds) │  │          │  │          │  │              │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
└───────────────────────┬──────────────────────────────────────┘
                        │  HTTPS (JWT + Firebase ID Tokens)
┌───────────────────────▼──────────────────────────────────────┐
│                     SERVER (Express)                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Middleware: Helmet, CORS, Auth, Authorize, Validate    │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌────────┐ ┌─────────────┐   │
│  │ Auth  │ │ User  │ │Product│ │  Cart  │ │  Order      │   │
│  │Module │ │Module │ │Module │ │ Module │ │  Module     │   │
│  ├───────┤ ├───────┤ ├───────┤ ├────────┤ ├─────────────┤   │
│  │ Seller│ │ Admin │ │Payment│ │Contact │ │ Cloudinary  │   │
│  │Module │ │Module │ │Module │ │Module  │ │  Module     │   │
│  └───────┘ └───────┘ └───────┘ └────────┘ └─────────────┘   │
└───────┬──────────────┬────────────────┬──────────────────────┘
        │              │                │
   ┌────▼────┐   ┌─────▼─────┐   ┌─────▼────┐
   │ MongoDB │   │   Redis   │   │Cloudinary│
   │  Atlas  │   │(Upstash)  │   │   CDN    │
   └─────────┘   └───────────┘   └──────────┘
```

---

## 📁 Project Structure

```
CartNest/
├── backend/                   # Express API server
│   ├── src/
│   │   ├── app.js             # Express app setup (CORS, middleware, routes)
│   │   ├── server.js          # Server entry point (service initialization)
│   │   ├── config/            # DB, Firebase, Cloudinary, Razorpay, Redis configs
│   │   ├── middleware/        # authenticate, authorize, validate, errorHandler
│   │   ├── modules/           # Feature modules (MVC per module)
│   │   │   ├── auth/          # Firebase session → JWT token exchange
│   │   │   ├── user/          # Profile, address book CRUD
│   │   │   ├── seller/        # Seller registration, dashboard, product CRUD
│   │   │   ├── product/       # Public product listing + search
│   │   │   ├── category/      # Category CRUD
│   │   │   ├── cart/          # Cart CRUD with price snapshots
│   │   │   ├── order/         # Checkout, order lifecycle, cancellation
│   │   │   ├── payment/       # Razorpay order creation + verification
│   │   │   ├── admin/         # Admin dashboard, user/product/order management
│   │   │   ├── contact/       # Contact form submissions
│   │   │   └── cloudinary/    # Signed upload signatures
│   │   └── utils/             # ApiError, asyncHandler, generateToken, slugify
│   ├── .env.example           # Backend env template
│   └── package.json
│
├── frontend/                  # React SPA (Vite)
│   ├── src/
│   │   ├── App.jsx            # Router + Layout + Providers
│   │   ├── main.jsx           # Entry point
│   │   ├── index.css          # Global styles + Tailwind + animations
│   │   ├── config/            # Firebase client config
│   │   ├── context/           # AuthContext, CartContext
│   │   ├── services/          # API service layer (Axios)
│   │   │   ├── api.js         # Axios instance + interceptors
│   │   │   └── index.js       # All service modules
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Footer, ProtectedRoute
│   │   │   └── ui/            # ProductCard, Spinner
│   │   └── pages/
│   │       ├── Home.jsx       # Hero, categories, featured products
│   │       ├── Search.jsx     # Product search with filters
│   │       ├── ProductDetail.jsx
│   │       ├── Cart.jsx
│   │       ├── Checkout.jsx   # Address + Razorpay payment
│   │       ├── Orders.jsx
│   │       ├── Account.jsx
│   │       ├── Contact.jsx
│   │       ├── auth/          # Login, Signup
│   │       ├── seller/        # SellerSignup, SellerDashboard
│   │       ├── admin/         # AdminDashboard
│   │       └── verifier/      # VerifierDashboard
│   ├── .env.example           # Frontend env template
│   └── package.json
│
├── DEPLOYMENT.md              # Production deployment guide
├── .gitignore
└── README.md                  # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB** — [MongoDB Atlas](https://cloud.mongodb.com) (free tier works)
- **Firebase** — [Firebase Console](https://console.firebase.google.com) (Authentication enabled)
- **Cloudinary** — [Cloudinary Dashboard](https://console.cloudinary.com)
- **Razorpay** — [Razorpay Dashboard](https://dashboard.razorpay.com) (test keys for development)
- **Redis** _(optional)_ — [Upstash](https://upstash.com) or local Redis

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/CartNest.git
cd CartNest

# Install backend dependencies
cd backend
cp .env.example .env     # Fill in your keys
npm install

# Install frontend dependencies
cd ../frontend
cp .env.example .env     # Fill in your keys
npm install
```

### Running Locally

```bash
# Terminal 1 — Start backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Start frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Environment Variables

See the detailed `.env.example` files in each directory:

| File                                             | Description                                                     |
| ------------------------------------------------ | --------------------------------------------------------------- |
| [`backend/.env.example`](backend/.env.example)   | MongoDB, JWT, Firebase Admin, Cloudinary, Razorpay, Redis, SMTP |
| [`frontend/.env.example`](frontend/.env.example) | API URL, Firebase Client, Cloudinary, Razorpay key              |

---

## 📜 Scripts

### Backend

| Script      | Command              | Description                      |
| ----------- | -------------------- | -------------------------------- |
| Development | `npm run dev`        | Start with nodemon (auto-reload) |
| Production  | `npm start`          | Start with node                  |
| Seed Admin  | `npm run seed:admin` | Create initial admin user        |
| Lint        | `npm run lint`       | Run ESLint                       |

### Frontend

| Script      | Command           | Description                      |
| ----------- | ----------------- | -------------------------------- |
| Development | `npm run dev`     | Start Vite dev server            |
| Build       | `npm run build`   | Production build                 |
| Preview     | `npm run preview` | Preview production build locally |
| Lint        | `npm run lint`    | Run ESLint                       |

---

## 👥 User Roles

| Role         | Access                                                 | Description                       |
| ------------ | ------------------------------------------------------ | --------------------------------- |
| **Customer** | Public pages, Cart, Checkout, Orders, Account          | Default role after signup         |
| **Seller**   | Seller Dashboard, Product CRUD, Order management       | Registered via seller signup flow |
| **Admin**    | Full admin panel, user/product/order/payout management | Seeded via `npm run seed:admin`   |
| **Verifier** | Product verification dashboard                         | Created by admin                  |

---

## 🌐 API Endpoints

| Module     | Prefix            | Key Operations                                                     |
| ---------- | ----------------- | ------------------------------------------------------------------ |
| Auth       | `/api/auth`       | `POST /session`, `POST /refresh-token`, `GET /me`, `POST /logout`  |
| Users      | `/api/users`      | `GET/PUT /profile`, `POST/PUT/DELETE /address`                     |
| Seller     | `/api/seller`     | `POST /register`, `GET /dashboard`, CRUD `/product`, `GET /orders` |
| Products   | `/api/products`   | `GET /` (with search/filter), `GET /:slug`                         |
| Categories | `/api/categories` | CRUD operations                                                    |
| Cart       | `/api/cart`       | `GET /`, `POST /`, `PUT /`, `DELETE /:id`, `DELETE /clear`         |
| Orders     | `/api/orders`     | `POST /checkout`, `GET /`, `GET /:id`, `POST /:id/cancel`          |
| Payments   | `/api/payments`   | `POST /verify` (Razorpay signature verification)                   |
| Contact    | `/api/contact`    | `POST /` (submit inquiry)                                          |
| Cloudinary | `/api/cloudinary` | `GET /sign` (signed upload params)                                 |
| Admin      | `/api/admin`      | Dashboard, users, products, orders, contacts, payouts              |
| Health     | `/api/health`     | `GET /` (server status check)                                      |

---

## 🚢 Deployment

- **MongoDB Atlas** — Cloud database setup
- **Render** — Backend deployment
- **Vercel** — Frontend deployment

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with ❤️ by <strong>Md Warish Ansari</strong>
</p>
