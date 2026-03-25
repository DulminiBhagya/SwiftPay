# 💸 SwiftPay — Personal Wallet System

A full-stack personal wallet application with secure money transfers, built with **Next.js**, **Node.js/Express**, **Sequelize ORM**, and **PostgreSQL**.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Database Migrations](#database-migrations)
- [API Reference](#api-reference)
- [How Database Transactions Work](#how-database-transactions-work)
- [Testing the Rollback](#testing-the-rollback)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Overview

SwiftPay demonstrates two core backend engineering concepts:

1. **Database Migrations** — evolving a database schema safely over time using Sequelize CLI.
2. **Database Transactions** — ensuring money transfers are atomic (all-or-nothing) using `sequelize.transaction()` with `BEGIN / COMMIT / ROLLBACK`.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14 (App Router), Tailwind CSS |
| Backend    | Node.js, Express.js                 |
| ORM        | Sequelize + Sequelize CLI           |
| Database   | PostgreSQL                          |
| Dev Tools  | pgAdmin, Postman, dotenv            |

---

## Project Structure

```
swiftpay/
├── backend/
│   ├── config/
│   │   └── config.json          # Database connection config
│   ├── controllers/
│   │   └── transferController.js  # Transfer logic with DB transaction
│   ├── migrations/
│   │   ├── XXXX-create-users.js
│   │   ├── XXXX-create-wallets.js
│   │   └── XXXX-create-transactions.js
│   ├── models/
│   │   ├── index.js
│   │   ├── user.js
│   │   ├── wallet.js
│   │   └── transaction.js
│   ├── routes/
│   │   └── transfer.js
│   ├── app.js
│   └── package.json
│
└── frontend/
    ├── app/
    │   └── page.jsx             # Send Money form
    ├── tailwind.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+
- [pgAdmin](https://www.pgadmin.org/) (optional, for visual DB inspection)
- npm or yarn

---

### Backend Setup

```bash
# 1. Navigate to backend folder
cd swiftpay/backend

# 2. Install dependencies
npm install

# 3. Create the PostgreSQL database
createdb swiftpay_db

# 4. Configure database credentials
# Edit backend/config/config.json (see Environment Variables section)

# 5. Run all migrations
npx sequelize-cli db:migrate

# 6. Start the server
node app.js
# Server runs on http://localhost:5000
```

---

### Frontend Setup

```bash
# 1. Navigate to frontend folder
cd swiftpay/frontend

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# App runs on http://localhost:3000
```

---

## Database Migrations

Migrations allow you to evolve your database schema in a controlled, versioned way — similar to Git for your database.

### Migration 1 — Users table

Creates the core users table.

```
Columns: id (PK), name, email (unique), password, createdAt, updatedAt
```

### Migration 2 — Wallets table

Creates wallets linked to users via a Foreign Key.

```
Columns: id (PK), userId (FK → Users.id), balance, createdAt, updatedAt
```

### Migration 3 — Transactions table

Tracks every money transfer between users.

```
Columns: id (PK), senderId (FK → Users.id), receiverId (FK → Users.id), amount, type, createdAt, updatedAt
```

### Run Migrations

```bash
# Apply all pending migrations
npx sequelize-cli db:migrate

# Undo the last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Generate a new migration file
npx sequelize-cli migration:generate --name your-migration-name
```

---

## API Reference

### `POST /api/transfer`

Transfers money from one user to another.

**Request Body:**

```json
{
  "senderEmail": "alice@example.com",
  "receiverEmail": "bob@example.com",
  "amount": 500.00
}
```

**Success Response (`200`):**

```json
{
  "message": "Transfer successful!"
}
```

**Error Responses:**

| Status | Message                    | Cause                         |
|--------|----------------------------|-------------------------------|
| `400`  | `Insufficient balance`     | Sender has less than amount   |
| `404`  | `User not found`           | Invalid sender/receiver email |
| `500`  | `Transfer failed`          | Server error — auto rollback  |

---

## How Database Transactions Work

The transfer logic uses `sequelize.transaction()` to wrap all 4 steps into a single atomic operation:

```
Step 1 → Check sender has enough balance
Step 2 → Deduct amount from sender's wallet
Step 3 → Add amount to receiver's wallet
Step 4 → Create a record in the Transactions table
```

If **any step fails**, the entire operation is **rolled back** — no money moves, no partial state is saved.

```js
const t = await sequelize.transaction();

try {
  // Steps 1–4, each passing { transaction: t }
  await t.commit();   // ✅ All good → save changes
} catch (error) {
  await t.rollback(); // ❌ Something failed → undo everything
}
```

> **Key rule:** Every database operation inside the transfer must receive `{ transaction: t }` as an option. Without this, that operation runs outside the transaction and will **not** be rolled back on failure.

---

## Testing the Rollback

To verify that an error mid-transfer correctly rolls back all changes:

1. Open `backend/controllers/transferController.js`
2. After Step 3 (credit receiver), add this line:

```js
throw new Error('Simulated crash!');
```

3. Send a transfer request via Postman or the frontend
4. Open pgAdmin and inspect the `Wallets` table
5. The sender's balance should be **unchanged** — the rollback worked ✅
6. Remove the `throw` line when done testing

---

## Environment Variables

Create a `backend/config/config.json` with your PostgreSQL credentials:

```json
{
  "development": {
    "username": "postgres",
    "password": "your_password_here",
    "database": "swiftpay_db",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```

> For production, use environment variables via a `.env` file and the `dotenv` package instead of hardcoding credentials.

---

## Scripts

### Backend

| Command                                        | Description                     |
|------------------------------------------------|---------------------------------|
| `node app.js`                                  | Start the Express server        |
| `npx sequelize-cli db:migrate`                 | Run all pending migrations      |
| `npx sequelize-cli db:migrate:undo`            | Undo the last migration         |
| `npx sequelize-cli migration:generate --name X` | Create a new migration file     |

### Frontend

| Command         | Description               |
|-----------------|---------------------------|
| `npm run dev`   | Start Next.js dev server  |
| `npm run build` | Build for production      |
| `npm start`     | Run production build      |

---

## Concepts Learned

- ✅ Sequelize CLI migrations — creating and evolving DB schemas
- ✅ Foreign key relationships between tables
- ✅ Atomic database transactions (`BEGIN / COMMIT / ROLLBACK`)
- ✅ REST API design with Express.js
- ✅ Connecting a Next.js frontend to a Node.js backend
- ✅ Tailwind CSS for rapid UI development

---

*Built as a learning project to understand full-stack development with database migrations and transaction safety.*