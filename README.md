# ROR India Web

React + Vite + Tailwind frontend for [ROR India](https://github.com/). Talks to the Rails backend JSON API at `/api/v1`.

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router 6

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

App runs at http://localhost:5173

In development, Vite proxies `/api` → `http://localhost:3000`.

## Rails backend

From the `ror_india` repo:

```bash
bin/rails s
```

Ensure CORS is enabled for `http://localhost:5173` (see `config/initializers/cors.rb`).

## Pages migrated so far

- `/` — job search + job cards
- `/jobs/:id` — job detail
- `/companies` — company directory
- `/companies/:id` — company + open roles

Auth, dashboards, blogging, ActiveAdmin, and recruiter flows still live in Rails for now.
