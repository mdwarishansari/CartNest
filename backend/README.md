<p align="center">
  <h1>🔧 CartNest — Backend API</h1>
  <em>Express.js REST API powering the CartNest multi-vendor marketplace</em>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Models](#-database-models)
- [Middleware](#-middleware)
- [Utilities](#-utilities)
- [Scripts](#-scripts)

---

## 🎯 Overview

The CartNest backend is a modular **Express.js** REST API that handles:

- **Authentication** — Firebase ID token → JWT session exchange
- **Multi-Vendor Product Management** — CRUD with Cloudinary image uploads and verification workflows
- **Shopping Cart** — Price-snapshotted cart items with Redis-backed stock locking
- **Order Lifecycle** — Checkout → Razorpay payment → Fulfillment → Delivery → Returns
- **Admin Operations** — User management, product moderation, payout tracking
- **Email Notifications** — Verification emails, contact replies via Nodemailer

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js ≥ 18 | Server runtime |
| Framework | Express 4 | HTTP routing and middleware |
| Database | MongoDB (Mongoose 8) | Data persistence |
| Auth | Firebase Admin SDK + JWT | Token verification and session management |
| Payments | Razorpay SDK | Order creation and payment verification |
| File Storage | Cloudinary | Signed image uploads |
| Cache/Locks | Redis (ioredis) | Distributed locking for stock management |
| Email | Nodemailer | SMTP email delivery |
| Validation | express-validator | Request body/params validation |
| Security | Helmet, CORS | HTTP headers and cross-origin policy |
| Logging | Morgan | HTTP request logging |
| Utilities | nanoid, slugify | Order IDs and URL-safe slugs |

---

## 🏗️ Architecture

The backend follows a **modular MVC pattern** where each feature domain is self-contained:

```
Module (e.g., product)
├── product.model.js        # Mongoose schema & indexes
├── product.controller.js   # Route handlers (business logic)
├── product.routes.js       # Express router definitions
└── product.validator.js    # express-validator chains
```

### Request Flow

```
Client Request
  → CORS / Helmet (security)
  → Morgan (logging)
  → Body Parser (JSON/URL-encoded)
  → Cookie Parser
  → Router (module routes)
    → Validator Middleware (express-validator)
    → Auth Middleware (JWT verification)
    → Authorize Middleware (role check)
    → Controller (business logic)
      → Model (MongoDB via Mongoose)
      → External Services (Cloudinary, Razorpay, Firebase, Redis)
  → Error Handler (centralized)
  → JSON Response
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                        # Express app configuration
│   ├── server.js                     # Server startup & service init
│   │
│   ├── config/                       # Service configurations
│   │   ├── db.js                     # MongoDB connection
│   │   ├── firebase.js               # Firebase Admin SDK init
│   │   ├── cloudinary.js             # Cloudinary config
│   │   ├── razorpay.js               # Razorpay instance
│   │   └── redis.js                  # Redis client (ioredis)
│   │
│   ├── middleware/                    # Express middleware
│   │   ├── authenticate.js           # JWT token verification
│   │   ├── authorize.js              # Role-based access control
│   │   ├── validate.js               # express-validator runner
│   │   └── errorHandler.js           # Centralized error response
│   │
│   ├── modules/                      # Feature modules
│   │   ├── auth/                     # Authentication (Firebase ↔ JWT)
│   │   │   ├── auth.controller.js    # session, refreshToken, me, logout
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validator.js
│   │   │
│   │   ├── user/                     # User profiles & addresses
│   │   │   ├── user.model.js         # User schema (email, role, addressBook)
│   │   │   ├── user.controller.js    # getProfile, updateProfile, address CRUD
│   │   │   ├── user.routes.js
│   │   │   └── user.validator.js
│   │   │
│   │   ├── seller/                   # Seller operations
│   │   │   ├── sellerProfile.model.js # Seller schema (shop, metrics, payouts)
│   │   │   ├── seller.controller.js   # register, dashboard, product CRUD, orders
│   │   │   ├── seller.routes.js
│   │   │   └── seller.validator.js
│   │   │
│   │   ├── product/                  # Public product access
│   │   │   ├── product.model.js      # Product schema (images, verification, stock)
│   │   │   ├── product.controller.js # getAll (search/filter), getBySlug
│   │   │   ├── product.routes.js
│   │   │   └── product.validator.js
│   │   │
│   │   ├── category/                 # Product categories
│   │   │   ├── category.model.js
│   │   │   ├── category.controller.js
│   │   │   ├── category.routes.js
│   │   │   └── category.validator.js
│   │   │
│   │   ├── cart/                     # Shopping cart
│   │   │   ├── cart.model.js         # Cart schema (items with priceAtAdd)
│   │   │   ├── cart.controller.js    # get, add, update, remove, clear
│   │   │   ├── cart.routes.js
│   │   │   └── cart.validator.js
│   │   │
│   │   ├── order/                    # Order management
│   │   │   ├── order.model.js        # Order schema (Razorpay, shipping, payouts)
│   │   │   ├── order.controller.js   # checkout, getOrders, cancel
│   │   │   ├── order.routes.js
│   │   │   └── order.validator.js
│   │   │
│   │   ├── payment/                  # Razorpay payments
│   │   │   ├── payment.controller.js # create Razorpay order, verify signature
│   │   │   └── payment.routes.js
│   │   │
│   │   ├── admin/                    # Admin operations
│   │   │   ├── admin.controller.js   # dashboard, users, products, orders, payouts
│   │   │   ├── admin.routes.js
│   │   │   ├── admin.validator.js
│   │   │   └── admin.seed.js         # Auto-seed admin on first start
│   │   │
│   │   ├── contact/                  # Contact form
│   │   │   ├── contactQuery.model.js
│   │   │   ├── contact.controller.js
│   │   │   ├── contact.routes.js
│   │   │   └── contact.validator.js
│   │   │
│   │   └── cloudinary/               # Image upload signatures
│   │       ├── cloudinary.controller.js
│   │       └── cloudinary.routes.js
│   │
│   └── utils/                        # Shared utilities
│       ├── ApiError.js               # Custom error class with status codes
│       ├── asyncHandler.js           # Async middleware wrapper
│       ├── generateToken.js          # JWT token generation
│       ├── redisLock.js              # Distributed lock (stock management)
│       └── slugify.js               # URL-safe slug generator
│
├── .env.example                      # Env variable template
├── package.json
└── README.md                         # ← You are here
```

---

## 🚀 Setup & Installation

```bash
cd backend
cp .env.example .env     # Fill in your API keys and secrets
npm install
npm run dev              # Starts with nodemon on port 5000
```

The server will:
1. Connect to MongoDB
2. Initialize Firebase Admin SDK
3. Configure Cloudinary
4. Initialize Razorpay
5. Connect to Redis (graceful — won't crash if unavailable)
6. Seed an admin user if none exists
7. Start listening on `PORT` (default: 5000)

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | ✅ | `development` or `production` |
| `PORT` | ❌ | Server port (default: `5000`) |
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | ❌ | Token expiry (default: `7d`) |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | ✅ | Firebase service account private key |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | ❌ | Razorpay webhook secret |
| `REDIS_URL` | ❌ | Redis connection URL |
| `SMTP_HOST` | ✅ | SMTP server host (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | ✅ | SMTP port (e.g., `587`) |
| `SMTP_USER` | ✅ | SMTP username/email |
| `SMTP_PASS` | ✅ | SMTP password / App Password |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS |
| `BACKEND_URL` | ❌ | Backend URL (for logs) |
| `ADMIN_SEED_EMAIL` | ❌ | Email for auto-seeded admin |
| `ADMIN_SEED_NAME` | ❌ | Name for auto-seeded admin |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/session` | ❌ | Exchange Firebase ID token for JWT |
| `POST` | `/api/auth/refresh-token` | ✅ | Refresh JWT token |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `POST` | `/api/auth/logout` | ✅ | Logout (clear session) |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users/profile` | ✅ | Get user profile |
| `PUT` | `/api/users/profile` | ✅ | Update profile |
| `POST` | `/api/users/address` | ✅ | Add address |
| `PUT` | `/api/users/address/:id` | ✅ | Update address |
| `DELETE` | `/api/users/address/:id` | ✅ | Delete address |

### Seller
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/api/seller/register` | ✅ | customer | Register as seller |
| `GET` | `/api/seller/dashboard` | ✅ | seller | Dashboard stats |
| `GET` | `/api/seller/products` | ✅ | seller | List seller's products |
| `POST` | `/api/seller/product` | ✅ | seller | Create product |
| `PUT` | `/api/seller/product/:id` | ✅ | seller | Update product |
| `DELETE` | `/api/seller/product/:id` | ✅ | seller | Delete product |
| `GET` | `/api/seller/orders` | ✅ | seller | List seller's orders |
| `PUT` | `/api/seller/order/:id/status` | ✅ | seller | Update order status |
| `PUT` | `/api/seller/profile` | ✅ | seller | Update shop profile |

### Products (Public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | ❌ | List products (search, filter, sort, paginate) |
| `GET` | `/api/products/:slug` | ❌ | Get product by slug |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/cart` | ✅ | Get user's cart |
| `POST` | `/api/cart` | ✅ | Add item to cart |
| `PUT` | `/api/cart` | ✅ | Update item quantity |
| `DELETE` | `/api/cart/:productId` | ✅ | Remove item |
| `DELETE` | `/api/cart/clear` | ✅ | Clear entire cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders/checkout` | ✅ | Create order from cart |
| `GET` | `/api/orders` | ✅ | List user's orders |
| `GET` | `/api/orders/:id` | ✅ | Get order details |
| `POST` | `/api/orders/:id/cancel` | ✅ | Cancel order |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payments/verify` | ✅ | Verify Razorpay payment signature |

### Admin
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/api/admin/dashboard` | ✅ | admin | Platform statistics |
| `GET` | `/api/admin/users` | ✅ | admin | List all users |
| `DELETE` | `/api/admin/users/:id` | ✅ | admin | Delete user |
| `GET` | `/api/admin/products` | ✅ | admin | List all products |
| `PUT` | `/api/admin/products/:id/verify` | ✅ | admin | Verify/reject product |
| `GET` | `/api/admin/orders` | ✅ | admin | List all orders |
| `PUT` | `/api/admin/orders/:id/status` | ✅ | admin | Update order status |
| `POST` | `/api/admin/verifier` | ✅ | admin | Create verifier account |
| `GET` | `/api/admin/contacts` | ✅ | admin | List contact queries |
| `PUT` | `/api/admin/contacts/:id/status` | ✅ | admin | Update contact status |
| `POST` | `/api/admin/contacts/:id/reply` | ✅ | admin | Reply to contact |
| `DELETE` | `/api/admin/contacts/:id` | ✅ | admin | Delete contact |
| `GET` | `/api/admin/seller-earnings` | ✅ | admin | View seller earnings |
| `PUT` | `/api/admin/seller/:id/payout` | ✅ | admin | Mark payout as paid |

---

## 🗄️ Database Models

### User
| Field | Type | Description |
|-------|------|-------------|
| `email` | String (unique) | User email |
| `name` | String | Display name |
| `role` | Enum | `customer`, `seller`, `admin`, `verifier` |
| `firebaseUid` | String (sparse) | Firebase UID |
| `isSeller` | Boolean | Whether user has seller profile |
| `sellerProfileId` | ObjectId → SellerProfile | Reference to seller profile |
| `phone` | String | Phone number |
| `addressBook` | [Address] | Array of saved addresses |

### SellerProfile
| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId → User | Owner reference |
| `shopName` | String | Shop display name |
| `shopSlug` | String (unique) | URL-safe shop identifier |
| `logo` | { public_id, url } | Cloudinary shop logo |
| `description` | String | Shop description |
| `metrics` | Object | totalSales, totalOrders, commission, netEarnings, currentBalance |
| `payoutStatus` | Enum | `pending`, `paid` |

### Product
| Field | Type | Description |
|-------|------|-------------|
| `sellerId` | ObjectId → SellerProfile | Seller reference |
| `title` | String | Product title |
| `slug` | String (unique) | URL-safe identifier |
| `price` | Number | Selling price |
| `mrp` | Number | Maximum retail price |
| `stock` | Number | Available quantity |
| `reserved` | Number | Reserved during checkout |
| `images` | [{ public_id, url, alt }] | Product images (Cloudinary) |
| `verified` | Boolean | Verification status |
| `verificationState` | Enum | `pending`, `verified`, `rejected` |
| `categoryId` | ObjectId → Category | Category reference |

### Order
| Field | Type | Description |
|-------|------|-------------|
| `orderId` | String (unique) | `CN-XXXXXXXXXX` format |
| `userId` | ObjectId → User | Customer reference |
| `items` | [OrderItem] | Products with snapshots |
| `totalAmount` | Number | Order total |
| `paymentStatus` | Enum | `pending`, `paid`, `failed`, `refunded` |
| `orderStatus` | Enum | `pending` → `placed` → `processing` → `shipped` → `delivered` |
| `razorpay` | Object | order_id, payment_id, signature |
| `shippingAddress` | Object | Delivery address snapshot |

### Cart
| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId → User (unique) | One cart per user |
| `items` | [{ productId, qty, priceAtAdd, sellerId }] | Cart items |

---

## 🔒 Middleware

| Middleware | File | Description |
|-----------|------|-------------|
| `authenticate` | `authenticate.js` | Verifies JWT from `Authorization: Bearer <token>` header |
| `authorize(...roles)` | `authorize.js` | Restricts access to specified roles |
| `validate` | `validate.js` | Runs express-validator chains and returns 400 on failures |
| `errorHandler` | `errorHandler.js` | Centralized error response with proper status codes |

---

## 🧰 Utilities

| Utility | File | Description |
|---------|------|-------------|
| `ApiError` | `ApiError.js` | Custom error class with factory methods (`badRequest`, `notFound`, `unauthorized`, `forbidden`) |
| `asyncHandler` | `asyncHandler.js` | Wraps async route handlers to catch promise rejections |
| `generateToken` | `generateToken.js` | Create JWT tokens with configurable expiry |
| `redisLock` | `redisLock.js` | Acquire/release distributed Redis locks for stock management |
| `slugify` | `slugify.js` | Generate unique URL-safe slugs with collision handling |

---

## 📜 Scripts

```bash
npm run dev          # Start with nodemon (development)
npm start            # Start with node (production)
npm run seed:admin   # Seed initial admin user
npm run lint         # Run ESLint
```

---

<p align="center">
  Part of the <a href="../README.md"><strong>CartNest</strong></a> project
</p>
