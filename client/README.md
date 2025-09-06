# Day2Day Expense (Monolith)

Tech: Express + TypeORM (Postgres) + JWT + React (Vite + TS) + Tailwind + DaisyUI

## Setup
1. Create a `.env` in project root:
```
NODE_ENV=development
PORT=5175
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=day2day_expense
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
```
2. Ensure Postgres has `uuid-ossp` extension: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## Dev
- Backend dev: `npm run dev`
- Client dev: `cd client && npm run dev` (served at http://localhost:5173, proxies /api to backend)

## Build & Start (Monolith)
- `npm run build`
- `npm start` (serves API and static client from `dist-client/`)

## Database
- Run migrations (optional; schema auto-managed by TypeORM entities + migration included):
```
npm run typeorm -- migrate
```

## API Overview
- `POST /api/auth/register { email, password } -> { token }`
- `POST /api/auth/login { email, password } -> { token }`
- `GET /api/auth/me` (Bearer token)
- `POST /api/salary { year, month, salary }`
- `POST /api/expenses { year, month, category, amount, date, note? }`
- `GET /api/expenses?year=YYYY&month=M`
- `GET /api/months`
- `GET /api/summary?year=YYYY&month=M`
- `DELETE /api/expenses/:id`
