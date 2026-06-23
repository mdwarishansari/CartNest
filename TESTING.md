# CartNest Testing Guide

This document describes the testing architecture, tooling, and commands used to validate CartNest.

## Testing Architecture

CartNest uses a three-layer testing strategy:

1. **Unit tests** — Pure business logic and middleware validation (Jest)
2. **Integration tests** — Express API routes with MongoDB Memory Server replica set (Jest + Supertest)
3. **End-to-end tests** — Public and protected UI flows (Playwright)

```
client/                     server/
├── src/utils/__tests__     ├── tests/unit/
├── src/components/...      ├── tests/integration/
└── e2e/                    └── tests/helpers/
```

## Jest Setup (Server)

- Config: `server/jest.config.js`
- Setup: `server/tests/setup.js`
- Database helper: `server/tests/helpers/db.js` (MongoMemoryReplSet for transaction support)
- Firebase Admin is mocked in auth integration tests

### Commands

```bash
cd server
npm test
npm run test:watch
npm run test:coverage
```

### Latest Server Coverage (utils + authorize middleware)

| Metric | Result |
|--------|--------|
| Statements | 95.65% |
| Functions | 94.73% |
| Lines | 97.11% |
| Branches | 69.44% |

## React Testing Library Setup (Client)

- Config: `client/jest.config.cjs`
- Setup: `client/src/setupTests.js`
- Babel: `client/babel.config.cjs`

### Commands

```bash
cd client
npm test
npm run test:watch
npm run test:coverage
```

### Latest Client Utility Coverage

| Metric | Result |
|--------|--------|
| Statements | 85.29% |
| Functions | 100% |
| Lines | 100% |
| Branches | 71.73% |

## Playwright Setup

- Config: `client/playwright.config.js`
- Specs: `client/e2e/*.spec.js`
- Preview server starts automatically on port `4173`

### Commands

```bash
cd client
npx playwright install chromium   # first run only
npm run test:e2e
```

## Lighthouse Audit

Run against the production preview build:

```bash
cd client
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
npm run lighthouse
```

Results are written to `client/lighthouse-report.json`.

## Test Inventory

| Layer | Files | Tests |
|-------|-------|-------|
| Server unit | 11 | 26 |
| Server integration | 5 | 14 |
| Client unit | 4 | 6 |
| Playwright E2E | 2 | 7 |
| **Total** | **22** | **53** |

## What Is Covered

- Authentication validation, JWT helpers, RBAC middleware
- Cart calculations, order totals, commission math, discount math
- Order status transitions and cancellation rules
- Razorpay signature verification helper
- Auth, product, cart, order, admin, and verifier API flows
- Protected route behavior
- Public storefront navigation and auth redirects

## CI Recommendation

```bash
cd server && npm install && npm run lint && npm run test:coverage
cd ../client && npm install && npm run lint && npm run build && npm test && npm run test:e2e
```
