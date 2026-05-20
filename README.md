# Smart Leads Dashboard

A professional SaaS CRM lead management dashboard built with React + TypeScript + TailwindCSS + Vite.

## Setup

```bash
npm install
npm run dev
```

## Backend

Expects backend at `http://localhost:5000/api`.

## Features

- JWT auth with protected routes
- Role-based UI (admin/sales)
- Lead CRUD (create, read, update, delete)
- Search with 500ms debounce
- Filter by status, source
- Sort by latest/oldest
- Pagination
- CSV export
- Dark mode (persisted to localStorage)
- Responsive (mobile / tablet / desktop)

## Project Structure

```
src/
  components/   — Navbar, LeadTable, FilterBar, AddLeadModal, StatsCards, Pagination, ThemeToggle, Loader, EmptyState, ProtectedRoute
  context/      — AuthContext
  pages/        — Login, Dashboard
  services/     — api.ts (axios)
  types/        — lead.ts, user.ts
  utils/        — exportCSV.ts
```
