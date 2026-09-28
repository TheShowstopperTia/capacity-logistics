# CAPACITY

CAPACITY is a logistics capacity-matching MVP: match shipments with unused capacity on commercial journeys that are already happening.

## What this version is

This project is the first migration of the uploaded CAPACITY standalone prototype into a Vite + React + TypeScript application.

The existing product behavior is intentionally preserved during this migration: shipper matching, booking, prototype tracking, carrier capacity, carrier portal, profile, saved carriers, responsive UI, mock data, and browser localStorage.

## Important prototype boundaries

This is still a frontend MVP. It does **not** implement a production backend, authentication, real carrier KYC/verification, live GPS, payment processing, insurance, or real-world booking confirmation.

## Run locally

Requirements: Node.js 20+ recommended.

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

For a production build:

```bash
npm run build
npm run preview
```

## Project structure

- `src/App.tsx` — migrated application behavior and pages
- `src/main.tsx` — application entry point
- `src/index.css` — Tailwind entry point plus CAPACITY design tokens/utilities
- `index.html` — Vite HTML shell
- `legacy/CAPACITY(1).html` — original uploaded prototype kept for reference

## Next engineering pass

1. Split `App.tsx` into components, pages, data, hooks, and utilities.
2. Replace the legacy hash router with React Router.
3. Add automated tests for matching, capacity calculations, booking validation, and route flows.
4. Run browser QA across desktop/mobile.
5. Connect a backend only after the frontend MVP is stable.
