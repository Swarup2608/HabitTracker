# Tracker — Gamified Habit Tracker

A premium, animated, gamified habit tracker. Next.js 15 + Express + MongoDB + Redis.

## Quick start

```bash
# 1. Backend
cd backend
cp .env.example .env        # paste your Mongo + Redis URIs
npm install
npm run seed                # optional: mock data
npm run dev                 # http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

## Stack

| Layer    | Tech                                              |
|----------|---------------------------------------------------|
| Frontend | Next.js 15 App Router · TS · Tailwind · shadcn/ui · Framer Motion · Recharts · Zustand · React Query |
| Backend  | Node + Express · TS · Mongoose · ioredis · JWT (access + refresh rotation) · Zod · Helmet · bcrypt |
| DB       | MongoDB Atlas                                     |
| Cache    | Redis Cloud (sessions, rate-limit, analytics)     |

## Project structure

```
tracker/
├── backend/
│   └── src/
│       ├── config/        env, db, redis
│       ├── models/        Mongoose schemas
│       ├── routes/        REST routes
│       ├── controllers/   handlers
│       ├── services/      token, analytics
│       ├── middleware/    auth, error, rate-limit, validate
│       ├── validators/    zod schemas
│       └── utils/
└── frontend/
    └── src/
        ├── app/           App Router pages
        ├── components/    UI primitives + features
        ├── lib/           api client, utils
        ├── hooks/
        ├── stores/        Zustand
        └── providers/
```

## API surface

| Method | Path                          | Auth | Notes                       |
|--------|-------------------------------|------|-----------------------------|
| POST   | /api/auth/register            | —    |                             |
| POST   | /api/auth/login               | —    | rate-limited                |
| POST   | /api/auth/logout              | —    | clears refresh cookie       |
| POST   | /api/auth/refresh             | —    | rotates refresh token       |
| POST   | /api/auth/forgot-password     | —    |                             |
| POST   | /api/auth/reset-password      | —    |                             |
| GET    | /api/users/me                 | ✓    |                             |
| PATCH  | /api/users/me                 | ✓    |                             |
| GET    | /api/habits                   | ✓    |                             |
| POST   | /api/habits                   | ✓    |                             |
| PATCH  | /api/habits/:id               | ✓    |                             |
| DELETE | /api/habits/:id               | ✓    |                             |
| POST   | /api/habits/:id/complete      | ✓    | logs today, awards XP       |
| GET    | /api/habits/:id/logs          | ✓    | paginated                   |
| GET    | /api/todos                    | ✓    |                             |
| POST   | /api/todos                    | ✓    |                             |
| PATCH  | /api/todos/:id                | ✓    |                             |
| DELETE | /api/todos/:id                | ✓    |                             |
| GET    | /api/dashboard                | ✓    | aggregated, redis-cached    |

## Notes

- Refresh tokens are stored in Redis (`refresh:<userId>:<jti>`) with rotation on use.
- Rate limit uses Redis sliding window on auth + write endpoints.
- Dashboard aggregations are cached for 60s per user.
