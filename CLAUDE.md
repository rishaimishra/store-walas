# CLAUDE.md - Development Guide

## Build & Run Commands
- `npm run dev`: Start development server
- `npm run build`: Build production application
- `npm run start`: Start production server
- `npm run lint`: Run ESLint checks
- `npx prisma generate`: Generate Prisma Client
- `npx prisma db push`: Sync schema to database
- `npx prisma studio`: Open Prisma GUI
- `npx tsx prisma/seed.ts`: Seed database with initial data

## Code Style & Architecture
- **Next.js**: Use App Router and Server Components by default.
- **Server Actions**: Preferred for all data mutations.
- **Multi-Tenancy**: Shared database/schema, isolated by `storeId`.
- **RBAC**: Three roles (`SUPER_ADMIN`, `STORE_OWNER`, `CUSTOMER`).
- **File Structure**: Feature-based modular structure under `src/features`.
- **UI**: Components from `shadcn/ui` in `src/components/ui`.
- **State**: `useCart` (Zustand) for client-side state.
- **Naming**: PascalCase for components, kebab-case for files/directories.

## Routes
- `/`: Global Marketplace Home
- `/search`: Global Product Search & Filtering
- `/[storeSlug]`: Public Storefront Home
- `/[storeSlug]/products/[productSlug]`: Product Detail Page
- `/[storeSlug]/categories/[categorySlug]`: Category-specific products
- `/admin`: Super Admin Panel (Admin dashboard, store approval)
- `/dashboard`: Seller Hub (Store Selection)
- `/dashboard/new`: Create New Store
- `/dashboard/[storeId]`: Store-specific Seller Dashboard (Analytics)
- `/dashboard/[storeId]/products`: Product Management
- `/dashboard/[storeId]/inventory`: Detailed Stock Management
- `/dashboard/[storeId]/orders`: Order Management
- `/dashboard/[storeId]/customers`: Customer Relationship Management
- `/dashboard/[storeId]/settings`: Store Profile Settings
- `/auth/login`: Login Page
- `/auth/register`: Customer Registration
- `/auth/register-store`: Seller/Store Registration
- `/orders`: Customer Order History
- `/orders/[orderId]`: Order Status/Details
- `/orders/confirmation`: Success Page after Checkout
- `/checkout`: Purchase & Shipping Flow
