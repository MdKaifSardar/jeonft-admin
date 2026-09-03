# ⚡ JEONFT Admin

A full-featured administrative dashboard for managing the JEONFT Web3 platform, with dedicated workflows for user management, wallet configuration, rewards, deposits, withdrawals, and platform operations.

Built with Next.js and TypeScript, the dashboard uses a MongoDB-backed data layer and server-side application logic to manage core platform entities and administrative workflows.

---

## ✨ Overview

**JEONFT Admin** provides an operational interface for managing the core functionality of the JEONFT platform.

The dashboard centralizes administrative workflows including:

* User management
* Deposit management
* Withdrawal management
* Administrative wallet configuration
* Reward creation and management
* Platform-level data operations

The application is organized around dedicated admin authentication, dashboard pages, reusable components, server-side actions, database models, and utility modules.

---

## 🚀 Features

### 🔐 Admin Authentication

* Dedicated admin login interface
* JWT-based authentication
* Secure password handling with bcrypt
* Cookie-based session management
* Protected administrative routes
* Authentication middleware
* Separate authentication and dashboard flows

### 👥 User Management

* View platform users
* Access user information
* Manage user-related platform data
* Review user financial information
* Inspect referral-related data
* Dedicated user management interface

### 💰 Deposit Management

* View deposit activity
* Review deposit records
* Manage deposit-related workflows
* Access deposit information from the administrative dashboard
* Dedicated deposit management component

### 💸 Withdrawal Management

* View withdrawal requests
* Review withdrawal information
* Manage withdrawal workflows
* Dedicated withdrawal management interface
* Administrative processing of withdrawal-related operations

### 👛 Admin Wallet Management

* Configure administrative wallet information
* Manage platform wallet settings
* Dedicated admin wallet interface
* Support for wallet-related platform operations

### 🎁 Reward Management

* Create rewards
* Manage reward information
* Configure reward-related data
* Dedicated reward creation interface
* Platform-level reward administration

### 📊 Administrative Dashboard

* Centralized administration interface
* Dedicated dashboard route
* Modular management components
* Reusable UI architecture
* Loading and notification states

---

## 🧰 Tech Stack

### Frontend

| Technology         | Purpose                    |
| ------------------ | -------------------------- |
| **Next.js 15**     | Full-stack React framework |
| **React 19**       | UI development             |
| **TypeScript**     | Type-safe development      |
| **Tailwind CSS 4** | Styling                    |
| **Framer Motion**  | UI animations              |
| **Lucide React**   | Interface icons            |
| **React Icons**    | Icon library               |
| **React Toastify** | Notifications              |

### Backend & Data

| Technology                 | Purpose                              |
| -------------------------- | ------------------------------------ |
| **Next.js Server Actions** | Server-side application operations   |
| **MongoDB**                | Database                             |
| **Mongoose**               | MongoDB ODM                          |
| **Axios**                  | HTTP communication                   |
| **Express**                | Supporting server-side functionality |

### Authentication & Security

| Technology       | Purpose                          |
| ---------------- | -------------------------------- |
| **JWT**          | Authentication                   |
| **JOSE**         | JWT and cryptographic operations |
| **bcryptjs**     | Password hashing                 |
| **cookies-next** | Cookie management                |

### Infrastructure & Services

| Technology     | Purpose          |
| -------------- | ---------------- |
| **Cloudinary** | Media management |
| **ESLint**     | Code quality     |
| **PostCSS**    | CSS processing   |

---

## 🏗️ Architecture

```text
                    JEONFT Admin
                         │
                         ▼
                Admin Authentication
                         │
                  JWT / Cookies
                         │
                         ▼
                 Protected Dashboard
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
      Users           Finance          Rewards
        │                │                │
        │          ┌─────┴─────┐          │
        │          ▼           ▼          │
        │       Deposits   Withdrawals    │
        │                                  │
        └──────────────┬───────────────────┘
                       ▼
                 Admin Wallet
                       │
                       ▼
                 Server Actions
                       │
                       ▼
                  Mongoose ODM
                       │
                       ▼
                    MongoDB
```

---

## 📁 Project Structure

```text
jeonft-admin/
│
├── public/
│   └── Static assets
│
├── src/
│   ├── app/
│   │   ├── admin-login/
│   │   │   └── Admin authentication
│   │   │
│   │   ├── admin-dashboard/
│   │   │   └── Main administration interface
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── assets/
│   │   └── Application assets
│   │
│   ├── components/
│   │   ├── AdminWallet/
│   │   ├── CreateReward/
│   │   ├── DepositComponent/
│   │   ├── Loader/
│   │   ├── UserList/
│   │   └── withdrawComponent/
│   │
│   ├── constants/
│   │   └── Application constants
│   │
│   ├── lib/
│   │   ├── actions/
│   │   ├── database/
│   │   └── models/
│   │
│   └── utils/
│       └── Shared utilities
│
├── middleware.ts
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── package.json
└── tsconfig.json
```

The repository currently follows this separation, with `src/app` containing dedicated `admin-dashboard` and `admin-login` routes and `src/components` containing the administrative modules for wallets, rewards, users, deposits, and withdrawals.

---

## 🔄 Authentication Flow

```text
Admin
  │
  ▼
Admin Login
  │
  ▼
Credentials Validation
  │
  ▼
Password Verification
  │
  ▼
JWT Session
  │
  ▼
Authentication Cookie
  │
  ▼
Middleware
  │
  ▼
Admin Dashboard
```

Administrative pages are protected through authentication middleware, separating public access from privileged dashboard operations.

---

## 👥 User Management Flow

```text
Admin Dashboard
      │
      ▼
   User List
      │
      ▼
Select User
      │
      ▼
User Information
      │
      ├── Account Data
      ├── Wallet Data
      ├── Financial Data
      └── Platform Data
```

The `UserList` component provides the dedicated interface for administrative user operations.

---

## 💰 Deposit Management

```text
Platform Activity
       │
       ▼
Deposit Records
       │
       ▼
Admin Dashboard
       │
       ▼
Review Deposit
       │
       ▼
Administrative Action
```

The dashboard provides a dedicated deposit management interface for reviewing platform deposit activity.

---

## 💸 Withdrawal Management

```text
Withdrawal Request
        │
        ▼
Withdrawal Records
        │
        ▼
Admin Dashboard
        │
        ▼
Review Request
        │
        ▼
Administrative Processing
```

Withdrawal operations are isolated into their own management component to keep financial workflows separate from other administrative functionality.

---

## 👛 Admin Wallet

The administrative wallet module provides a dedicated interface for managing wallet information used by the platform.

```text
Admin Dashboard
      │
      ▼
Admin Wallet
      │
      ▼
Wallet Configuration
      │
      ▼
Platform Operations
```

---

## 🎁 Reward Management

Rewards can be managed through a dedicated administrative workflow.

```text
Admin Dashboard
      │
      ▼
Create Reward
      │
      ▼
Configure Reward
      │
      ▼
Persist Reward Data
      │
      ▼
Platform Reward System
```

The project includes a dedicated `CreateReward` component for reward-related administration.

---

## 🗄️ Data Layer

The application uses **MongoDB with Mongoose** as its primary persistence layer.

Database operations are organized under:

```text
src/lib/
├── actions/
├── database/
└── models/
```

This keeps database connectivity, data models, and application-level operations separated from the UI layer.

---

## 🔒 Security

The administrative application handles privileged platform operations and therefore requires stronger access controls than a typical public-facing application.

The project uses:

* JWT-based authentication
* JOSE
* bcrypt password hashing
* Cookie-based sessions
* Next.js middleware
* Server-side operations
* Environment-based configuration

For production deployments:

* Keep all secrets outside version control.
* Use strong authentication secrets.
* Restrict administrative access.
* Validate all server-side inputs.
* Protect financial and wallet operations.
* Use HTTPS.
* Keep database credentials server-side.

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm
* MongoDB
* Required environment variables
* Cloudinary configuration if media functionality is enabled

### 1. Clone the repository

```bash
git clone https://github.com/MdKaifSardar/jeonft-admin.git
cd jeonft-admin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

Example:

```env
MONGODB_URL=

NEXT_PUBLIC_JWT_SECRET=

PEPPER=
BCRYPT_SALT_ROUNDS=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> **Never commit production credentials or secrets to the repository.**

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 💻 Available Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Start the production server  |
| `npm run lint`  | Run ESLint                   |

These scripts are defined in the repository's current `package.json`.

---

## 🏭 Production Build

Create an optimized production build:

```bash
npm run build
```

Then start the production server:

```bash
npm run start
```

---

## ☁️ Deployment

The application can be deployed to a Next.js-compatible hosting platform such as Vercel.

Before deployment:

1. Configure production environment variables.
2. Configure the production MongoDB database.
3. Verify admin authentication.
4. Test middleware-protected routes.
5. Verify user management operations.
6. Test deposit and withdrawal workflows.
7. Verify admin wallet configuration.
8. Test reward management.

---

## 📌 Project Highlights

* Dedicated administrative dashboard
* Separate admin authentication flow
* JWT-based access control
* MongoDB + Mongoose data layer
* User management
* Deposit management
* Withdrawal management
* Administrative wallet configuration
* Reward creation and management
* Modular Next.js architecture
* TypeScript-based development
* Responsive UI components
* Server-side application operations

---

## 📄 License

This project is provided for development and portfolio purposes.
