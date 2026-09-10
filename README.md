# ROR India Web

Professional React + Vite + Tailwind frontend for ROR India.

## Features

- Jobs & companies browse/search
- Sign in / Sign up (candidate or recruiter)
- Dashboard, saved jobs, applications
- Save jobs, apply, follow companies
- Session auth via Rails `/api/v1` (Vite proxy)

## Design system

See `design-system/ror-india/MASTER.md` (ui-ux-pro-max).

## Run

```bash
# Terminal 1 — Rails
cd ../ror_india && bin/rails s

# Terminal 2 — React
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173
