# Multi-Store Clothing Marketplace MVP

A production-ready SaaS foundation for building multi-store ecommerce marketplaces using Next.js 15, Prisma, PostgreSQL, and Better Auth.

## Features

- **Multi-Tenancy**: Support for multiple independent stores with dynamic routing (`/[storeSlug]`).
- **Super Admin Panel**: Manage stores, users, and platform-wide analytics.
- **Store Owner Panel**: Comprehensive dashboard for managing products, categories, and orders.
- **Customer Experience**: Branded storefronts, global marketplace home, product details, and search.
- **Authentication**: Secure role-based access control using Better Auth.
- **Cart & Checkout**: Zustand-powered persistent cart and full checkout flow.
- **Order Management**: Transactional system for customers and store owners.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS, shadcn/ui.
- **Backend**: Next.js Server Actions, Prisma ORM.
- **Database**: PostgreSQL (Neon/Vercel ready).
- **Auth**: Better Auth.
- **State**: Zustand (Cart), TanStack Query (Server State).

## Getting Started

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file with:
   ```env
   DATABASE_URL="your-postgresql-url"
   BETTER_AUTH_SECRET="your-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

3. **Database Sync**:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/app`: Application routes and layouts.
- `src/features`: Domain-specific logic (auth, stores, products, orders).
- `src/components`: UI components (shadcn + shared).
- `src/lib`: Core utilities (db client, auth config).
- `src/hooks`: Custom React hooks.

## Roadmap & Scalability

- [ ] Real Payment Integration (Stripe/Paypal).
- [ ] S3/Cloudinary Image Uploads.
- [ ] Inventory Management & Low Stock Alerts.
- [ ] Multi-vendor Commission System.
- [ ] Advanced SEO & Dynamic Sitemaps.
