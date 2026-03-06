# CartNest Frontend

## Overview

CartNest frontend is a **modern React (Vite) application** for a multi-vendor marketplace where customers can browse products, add items to cart, and securely complete purchases.

The frontend communicates with the **CartNest backend API** to handle authentication, product management, payments, and order tracking.

It is optimized for performance, modular design, and smooth user experience.

---

# Live Demo

Frontend deployed on **Vercel**.

```
https://your-cartnest-frontend.vercel.app
```

Backend API:

```
https://your-backend-api.onrender.com
```

---

# Tech Stack

Core technologies used:

- React (Vite)
- React Router
- Axios
- Firebase Authentication
- Tailwind CSS
- Cloudinary (image uploads)
- Razorpay Checkout
- Framer Motion (UI animations)
- Recharts (dashboard analytics)

---

# Project Structure

```
frontend
│
├── public
│
├── src
│
├── components
│   ├── Navbar
│   ├── ProductCard
│   ├── SearchBar
│   └── UI components
│
├── pages
│   ├── Home
│   ├── Product
│   ├── Cart
│   ├── Checkout
│   ├── Login
│   ├── Signup
│   ├── SellerSignup
│   ├── SellerDashboard
│   └── AdminDashboard
│
├── context
│   └── AuthContext
│
├── services
│   ├── api.js
│   ├── cloudinary.js
│
├── config
│   └── firebase.js
│
├── App.jsx
├── main.jsx
└── index.css
```

---

# Features

## Authentication

Authentication handled using **Firebase**.

Supported login methods:

- Email + Password
- Google Login

Flow:

```
User login
↓
Firebase authentication
↓
ID token generated
↓
Token sent to backend
↓
Backend verifies user session
```

---

# Marketplace Features

Customers can:

- Browse products
- Search products
- View product details
- Add products to cart
- Checkout with Razorpay
- Track orders
- Manage account details

---

# Seller Features

Sellers can:

- Register a seller account
- Upload product listings
- Manage product inventory
- Track sales
- Update order status

---

# Admin Features

Admins can:

- Verify seller products
- Manage product categories
- View platform analytics
- Monitor orders
- Respond to contact queries

---

# Image Upload System

Product images are uploaded using **Cloudinary**.

Flow:

```
User selects image
↓
Frontend requests upload signature
↓
Image uploaded to Cloudinary
↓
Cloudinary returns public_id + url
↓
Product saved in database
```

Images are stored as:

```
cartnest/products/
cartnest/sellers/
cartnest/banners/
```

---

# Payment System

Payments are handled through **Razorpay Checkout**.

Checkout flow:

```
User clicks checkout
↓
Frontend requests order creation
↓
Backend creates Razorpay order
↓
Razorpay checkout opens
↓
User completes payment
↓
Frontend sends payment verification
↓
Backend verifies signature
```

---

# Environment Variables

Create `.env` file in the frontend root.

Example:

```
VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=

VITE_RAZORPAY_KEY_ID=

VITE_SITE_NAME=CartNest
```

---

# Installation

Clone repository:

```
git clone https://github.com/yourusername/cartnest.git
```

Navigate to frontend folder:

```
cd frontend
```

Install dependencies:

```
npm install
```

Start development server:

```
npm run dev
```

Application will run at:

```
http://localhost:5173
```

---

# Build for Production

Create production build:

```
npm run build
```

Preview build locally:

```
npm run preview
```

---

# Deployment (Vercel)

The frontend is deployed using **Vercel**.

Steps:

1. Push repository to GitHub
2. Import project into Vercel
3. Set environment variables
4. Deploy

Vercel automatically builds the Vite application.

---

# UI/UX Design

The frontend focuses on modern UI patterns:

- Responsive layouts
- Smooth animations
- Skeleton loaders
- Clean product cards
- Seller dashboards
- Analytics charts

---

# Future Improvements

Potential enhancements:

- PWA support
- Advanced search filters
- Product recommendations
- Seller payout dashboards
- Push notifications

---

# License

This project is built for learning and portfolio demonstration.
