<p align="center">
  <h1>⚛️ CartNest — Frontend</h1>
  <em>React SPA for the CartNest multi-vendor marketplace</em>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Pages & Routes](#-pages--routes)
- [State Management](#-state-management)
- [Services Layer](#-services-layer)
- [Components](#-components)
- [Styling](#-styling)
- [Scripts](#-scripts)

---

## 🎯 Overview

The CartNest frontend is a modern **React 19 SPA** powered by **Vite 7** that delivers:

- **Responsive UI** — Mobile-first design with Tailwind CSS 4
- **Smooth Animations** — Framer Motion transitions throughout
- **Role-Based Routing** — Protected routes for customers, sellers, admins, and verifiers
- **Real-Time Cart** — Context-based cart state synced with the backend
- **Secure Authentication** — Firebase Auth with seamless JWT session management
- **Payment Integration** — Razorpay checkout flow
- **Rich Dashboard Charts** — Recharts for seller/admin analytics

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | React 19 | UI library |
| Build Tool | Vite 7 | Fast dev server + bundler |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Routing | React Router DOM 7 | Client-side routing |
| Animations | Framer Motion 12 | Page transitions + micro-interactions |
| Charts | Recharts 3 | Dashboard analytics |
| Icons | Lucide React + React Icons | Icon libraries |
| HTTP Client | Axios | API communication |
| Auth | Firebase Client SDK | Email/password authentication |
| Notifications | React Hot Toast | Toast notifications |
| UI Components | Headless UI | Accessible UI primitives |

---

## 🏗️ Architecture

```
src/
├── App.jsx              # Router + Providers (Auth, Cart)
├── main.jsx             # ReactDOM entry point
├── index.css            # Global styles + Tailwind + animations
│
├── config/
│   └── firebase.js      # Firebase Client SDK configuration
│
├── context/             # React Context (global state)
│   ├── AuthContext.jsx   # User auth state + Firebase listener
│   └── CartContext.jsx   # Cart state + CRUD operations
│
├── services/            # API service layer
│   ├── api.js           # Axios instance (base URL, interceptors)
│   └── index.js         # Service modules (auth, user, product, cart, etc.)
│
├── components/
│   ├── layout/          # App-level layout components
│   │   ├── Navbar.jsx   # Responsive nav with role-based links
│   │   ├── Footer.jsx   # Site footer
│   │   └── ProtectedRoute.jsx  # Route guard (auth + role check)
│   └── ui/              # Reusable UI components
│       ├── ProductCard.jsx  # Product card with hover image cycling
│       └── Spinner.jsx      # Loading spinner + skeleton loaders
│
└── pages/               # Route pages
    ├── Home.jsx          # Hero, categories, featured products
    ├── Search.jsx        # Product search + filtering
    ├── ProductDetail.jsx # Product detail with image gallery
    ├── Cart.jsx          # Shopping cart page
    ├── Checkout.jsx      # Address + Razorpay payment
    ├── Orders.jsx        # Order history
    ├── Account.jsx       # Profile + address management
    ├── Contact.jsx       # Contact form
    ├── auth/
    │   ├── Login.jsx     # Email/password login
    │   └── Signup.jsx    # Customer registration
    ├── seller/
    │   ├── SellerSignup.jsx    # Seller registration flow
    │   └── SellerDashboard.jsx # Seller portal (multi-tab)
    ├── admin/
    │   └── AdminDashboard.jsx  # Admin panel (multi-tab with sidebar)
    └── verifier/
        └── VerifierDashboard.jsx  # Product verification panel
```

---

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
│   └── logo.png              # CartNest logo
├── src/                       # Source code (described above)
├── dist/                      # Production build output
├── index.html                 # Vite HTML entry point
├── vite.config.js             # Vite configuration
│   ├── React plugin
│   ├── Tailwind CSS plugin
│   └── Dev server proxy (/api → localhost:5000)
├── eslint.config.js           # ESLint configuration
├── .env.example               # Environment variable template
└── package.json               # Dependencies and scripts
```

---

## 🚀 Setup & Installation

```bash
cd frontend
cp .env.example .env     # Fill in your API keys
npm install
npm run dev              # Starts on http://localhost:5173
```

> **Note:** In development, Vite proxies `/api` requests to `http://localhost:5000` (backend).

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API base URL (e.g., `http://localhost:5000/api`) |
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `VITE_CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `VITE_CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `VITE_RAZORPAY_KEY_ID` | ✅ | Razorpay key ID (test or live) |
| `VITE_SITE_NAME` | ❌ | Site name (default: `CartNest`) |

---

## 🗺️ Pages & Routes

### Public Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Landing page — hero, categories, featured products |
| `/search` | `Search` | Product search with category, price, and sort filters |
| `/category/:slug` | `Search` | Category-filtered search |
| `/product/:slug` | `ProductDetail` | Product detail page with image gallery |
| `/contact` | `Contact` | Contact form |
| `/auth/login` | `Login` | Email/password login |
| `/auth/signup` | `Signup` | Customer registration |
| `/seller/register` | `SellerSignup` | Seller registration |
| `/seller/signup` | `SellerSignup` | Alternative seller signup URL |

### Protected Routes (Authenticated)

| Path | Component | Roles | Description |
|------|-----------|-------|-------------|
| `/cart` | `Cart` | Any | Shopping cart |
| `/checkout` | `Checkout` | Any | Checkout with Razorpay |
| `/orders` | `Orders` | Any | Order history |
| `/account` | `Account` | Any | Profile management |

### Role-Specific Routes

| Path | Component | Roles | Description |
|------|-----------|-------|-------------|
| `/seller/dashboard` | `SellerDashboard` | seller, admin | Seller portal (multi-tab) |
| `/verifier` | `VerifierDashboard` | verifier, admin | Product verification |
| `/admin` | `AdminDashboard` | admin | Full admin panel |

---

## 🧠 State Management

### AuthContext

Manages user authentication state with Firebase listener:

| Property / Method | Description |
|-------------------|-------------|
| `user` | Current user object (or `null`) |
| `loading` | Auth state loading indicator |
| `isAuthenticated` | `!!user` |
| `isAdmin` / `isSeller` / `isVerifier` | Role booleans |
| `logout()` | Sign out from Firebase + clear JWT |
| `refreshUser()` | Refresh user data and JWT token |

**Flow:** Firebase `onAuthStateChanged` → Send ID token to backend → Receive JWT + user object → Store JWT in `localStorage`.

### CartContext

Syncs cart state with the backend API:

| Property / Method | Description |
|-------------------|-------------|
| `cart` | Cart object with items array |
| `loading` | Cart loading state |
| `cartCount` | Total items in cart |
| `cartTotal` | Total price |
| `addToCart(productId, qty)` | Add item to cart |
| `updateQty(productId, qty)` | Update item quantity |
| `removeItem(productId)` | Remove item from cart |
| `clearCart()` | Clear all items |
| `fetchCart()` | Re-fetch cart from API |

---

## 🔌 Services Layer

The `services/` directory provides a clean API abstraction using Axios:

### `api.js` — Axios Instance

- **Base URL** from `VITE_API_URL`
- **Request interceptor** — Attaches JWT token from `localStorage`
- **Response interceptor** — Unwraps `response.data`, handles 401 auto-logout, standardized error format

### Service Modules (`index.js`)

| Service | Methods | API Prefix |
|---------|---------|------------|
| `authService` | `createSession`, `refreshToken`, `getMe`, `logout` | `/auth` |
| `userService` | `getProfile`, `updateProfile`, address CRUD | `/users` |
| `sellerService` | `register`, `getDashboard`, product CRUD, orders | `/seller` |
| `productService` | `getAll`, `getBySlug`, `deleteImage` | `/products` |
| `categoryService` | CRUD | `/categories` |
| `cartService` | `get`, `add`, `update`, `remove`, `clear` | `/cart` |
| `orderService` | `checkout`, `getAll`, `getById`, `cancel` | `/orders` |
| `paymentService` | `verify` | `/payments` |
| `contactService` | `submit` | `/contact` |
| `cloudinaryService` | `getSignature`, `getFolders` | `/cloudinary` |
| `adminService` | Dashboard, users, products, orders, contacts, payouts | `/admin` |

---

## 🧩 Components

### Layout Components

| Component | Description |
|-----------|-------------|
| `Navbar` | Responsive navigation with role-based menu items, cart count badge, and mobile hamburger menu |
| `Footer` | Site footer with links and branding |
| `ProtectedRoute` | Route guard that checks authentication and optionally restricts by roles |

### UI Components

| Component | Description |
|-----------|-------------|
| `ProductCard` | Product card with hover image cycling, discount badge, shop name, and cart button (customer-only) |
| `Spinner` / `SkeletonList` | Loading indicators and skeleton placeholders |

---

## 🎨 Styling

- **Tailwind CSS 4** — Via `@tailwindcss/vite` plugin (no `tailwind.config.js` needed)
- **Custom CSS** — `index.css` includes:
  - Custom gradient text utilities (`.gradient-text`)
  - Product grid layouts (`.product-grid`)
  - Custom scrollbar hiding (`.scrollbar-hide`)
  - Float/fade animations (`@keyframes float`, `.animate-fade-in`)
  - Staggered entrance animations (`.stagger-children`)
- **Framer Motion** — Used extensively for:
  - Page entrance animations (`initial` → `animate` → `whileInView`)
  - Hover effects (`whileHover`)
  - Product card lift-on-hover
  - Hero section entrance sequences

---

## 📜 Scripts

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

### Vite Configuration Highlights

- **React plugin** — `@vitejs/plugin-react`
- **Tailwind plugin** — `@tailwindcss/vite`
- **Dev proxy** — `/api` → `http://localhost:5000`
- **Host** — `true` (accessible on network)

---

<p align="center">
  Part of the <a href="../README.md"><strong>CartNest</strong></a> project
</p>
