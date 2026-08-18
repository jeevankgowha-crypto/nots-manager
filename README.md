# Lakshmi Foods | Full-Stack Food Subscription & Catering Platform

Lakshmi Foods is a premium, mobile-first web application designed for a home-style food business in Bengaluru, India. It includes a user-friendly online ordering store, a subscription planning portal, a catering manager, and a secure administration dashboard.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Lucide icons, Framer Motion
* **Backend**: Node.js, NestJS REST API, Swagger API Docs (OpenAPI)
* **Database**: PostgreSQL, Prisma ORM
* **Payments**: Razorpay Gateway (Simulated checkout fallback)
* **Notifications**: WhatsApp Click-to-Chat templates, Meta WhatsApp API hooks
* **Deployment**: Docker, Vercel

---

## 📂 Project Directory Structure

```
c:\exam\
├── docker-compose.yml           # Local PostgreSQL container service
├── README.md                    # System setup & architecture guide
├── frontend/                    # Next.js 15 client dashboard & landing store
│   ├── package.json
│   ├── vercel.json              # Vercel hosting rules
│   ├── tailwind.config.ts
│   └── src/
│       └── app/
│           ├── layout.tsx       # Root metadata, Poppins & Local SEO schemas
│           ├── globals.css      # Design tokens (Green theme, soft shadows)
│           ├── page.tsx         # Main Landing Page
│           ├── menu/            # Ordering system & WhatsApp Cart Drawer
│           └── dashboard/       # Customer portal (OTP login & tracking)
└── backend/                     # NestJS REST API Server
    ├── Dockerfile               # Multi-stage production container
    ├── package.json
    ├── nest-cli.json
    ├── prisma/
    │   ├── schema.prisma        # PostgreSQL schemas
    │   └── seed.js              # Initial Menu/User/Coupon data seeding
    └── src/
        ├── main.ts              # CORS, validation pipelines, and Swagger setup
        ├── app.module.ts
        ├── auth/                # JWT Passport, Password hash & SMS OTP codes
        ├── menu/                # Menu CRUD & veg/seasonal indicators
        ├── orders/              # Checkout, Invoice builders & WhatsApp links
        ├── subscriptions/       # Weekly/monthly plans & pausing rules
        ├── catering/            # Lead tracking & PDF quotation metrics
        ├── coupons/             # Flat/Percentage coupon codes
        ├── inventory/           # Stock management & low-level alerts
        ├── reports/             # Revenue statistics & 5% GST calculations
        └── settings/            # Operating hours & holiday settings
```

---

## ⚡ Local Setup Instructions

Follow these steps to run the complete workspace locally:

### 1. Database Launch (Docker)
Ensure Docker Desktop is running, then launch the database service:
```bash
docker-compose up -d
```
This boots up a PostgreSQL server on port `5432` with username `postgres`, password `password`, and database `lakshmi_foods`.

### 2. Backend Server Setup
Navigate into the `backend/` directory and configure credentials:
```bash
cd backend
```
1. Create a `.env` file containing:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/lakshmi_foods?schema=public"
   JWT_SECRET="lakshmi_foods_secret_key"
   PORT=4000
   ```
2. Generate Prisma Client and apply migrations:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
3. Seed the database with sample menu items, coupons, active plans, and admin accounts:
   ```bash
   node prisma/seed.js
   ```
4. Start the NestJS REST API server in watch mode:
   ```bash
   npm run start:dev
   ```
   * The API runs on: `http://localhost:4000`
   * Interactive Swagger OpenAPI docs are available at: `http://localhost:4000/api/docs`

### 3. Frontend Web Setup
Navigate into the `frontend/` directory and run the Next.js dev server:
```bash
cd ../frontend
npm run dev
```
* The web application runs on: `http://localhost:3000`

---

## 🔑 Default Accounts (Seeded)

For testing dashboards and modules, use these seeded logins:

### Admin Dashboard Access
* **URL**: `/admin/dashboard`
* **Email**: `admin@lakshmifoods.in`
* **Password**: `admin123`
* **2FA Code**: `123456` (Simulated code bypass)

### Customer Portal Login
* **URL**: `/dashboard`
* **Phone Number**: `9742528734`
* **OTP Code**: `123456` (Simulated code bypass)

---

## 📋 API Route Documentation

Interactive API documents are accessible on `/api/docs` via Swagger. Major REST routes:

### Authentication (`/auth`)
* `POST /auth/register` - Create user profile
* `POST /auth/login` - Login with credentials (returns JWT token)
* `POST /auth/otp/request` - Send verification code simulation
* `POST /auth/otp/verify` - Check code and login/register
* `GET /auth/me` - Get profile of authenticated user

### Food Menu (`/menu`)
* `GET /menu` - Retrieve active menu card items
* `POST /menu` - Add menu item (Admin only)
* `PUT /menu/:id` - Edit menu details & availability toggles (Admin only)
* `DELETE /menu/:id` - Remove item from listing (Admin only)

### Subscriptions (`/subscriptions`)
* `GET /subscriptions/plans` - View subscription catalog
* `POST /subscriptions/plans` - Create new plans (Admin only)
* `POST /subscriptions` - Buy meal plan subscription
* `GET /subscriptions/my` - Fetch client subscriptions
* `PUT /subscriptions/:id/status` - Pause/cancel active plans

### Catering Leads (`/catering`)
* `POST /catering/leads` - Request event catering details
* `GET /catering/leads` - Review list of leads (Admin only)
* `PUT /catering/leads/:id/quote` - Add pricing quote to leads (Admin only)
* `GET /catering/leads/:id/pdf` - Fetch custom PDF invoice metrics (Admin only)
