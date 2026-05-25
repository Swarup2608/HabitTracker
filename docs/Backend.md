# Backend API Documentation

**Loop Atom Backend** — Production-grade Express + TypeScript service powering tiny, consistent habits.

## Overview

Loop Atom backend is an **Express + TypeScript** service with **MongoDB** for persistence and **Redis** for rate-limiting/cache support.

![Backend Architecture - Express, MongoDB, Redis stack](https://via.placeholder.com/1200x400?text=Backend+Architecture%3A+Express+%7C+MongoDB+%7C+Redis)

**Base URL** (local):

- `http://localhost:4000/api`

**Core Middleware:**

- Helmet security headers and CSP
- CORS allowlist with credential support
- Cookie parser
- CSRF protection
- Endpoint-scoped rate limiting
- Audit middleware
- Centralized error handling

## Health and Utility

| Method | Path        | Auth | Notes                             |
| ------ | ----------- | ---- | --------------------------------- |
| GET    | /health     | —    | Service health check              |
| GET    | /csrf-token | —    | CSRF token for frontend mutations |

## Auth APIs (`/auth`)

![Authentication Flow - JWT, Refresh Token, Account Lockout](https://via.placeholder.com/1200x400?text=Auth+Flow%3A+JWT+%7C+Refresh+Rotation+%7C+Lockout)

| Method | Path                      | Auth | Notes                                        |
| ------ | ------------------------- | ---- | -------------------------------------------- |
| POST   | /auth/register            | —    | Create user account, send verification email |
| POST   | /auth/login               | —    | Authenticate user, rate-limited (5/min)      |
| POST   | /auth/verify-email        | —    | Verify email with token                      |
| POST   | /auth/resend-verification | —    | Resend verification email                    |
| POST   | /auth/refresh             | —    | Rotate refresh token                         |
| POST   | /auth/logout              | —    | Clear session                                |
| POST   | /auth/forgot-password     | —    | Request password reset                       |
| POST   | /auth/reset-password      | —    | Complete password reset                      |

## User APIs (`/users`)

All routes require authentication.

| Method | Path               | Auth | Notes               |
| ------ | ------------------ | ---- | ------------------- |
| GET    | /users/me          | ✓    | Get current profile |
| PATCH  | /users/me          | ✓    | Update profile      |
| POST   | /users/me/password | ✓    | Change password     |

## Habit APIs (`/habits`)

![Habit Management - Create, Track, Complete, View Logs](https://via.placeholder.com/1200x400?text=Habit+Management%3A+Create%2C+Track%2C+Complete+%26+Analyze)

All routes require authentication. Rate limit: 30 requests/minute per user.

| Method | Path                    | Auth | Notes                       |
| ------ | ----------------------- | ---- | --------------------------- |
| GET    | /habits                 | ✓    | List user habits            |
| POST   | /habits                 | ✓    | Create new habit            |
| GET    | /habits/:id             | ✓    | Get habit details           |
| PATCH  | /habits/:id             | ✓    | Update habit settings       |
| DELETE | /habits/:id             | ✓    | Delete habit                |
| POST   | /habits/:id/complete    | ✓    | Complete or backfill day    |
| GET    | /habits/:id/calendar    | ✓    | Month calendar/heatmap data |
| GET    | /habits/:id/logs        | ✓    | Paginated completion logs   |
| PATCH  | /habits/:id/logs/:logId | ✓    | Update log entry            |
| DELETE | /habits/:id/logs/:logId | ✓    | Delete log entry            |

## Todo APIs (`/todos`)

All routes require authentication. Rate limit: 50 requests/minute per user.

| Method | Path           | Auth | Notes           |
| ------ | -------------- | ---- | --------------- |
| GET    | /todos         | ✓    | List user todos |
| POST   | /todos         | ✓    | Create new todo |
| PATCH  | /todos/:id     | ✓    | Update todo     |
| DELETE | /todos/:id     | ✓    | Delete todo     |
| POST   | /todos/reorder | ✓    | Reorder todos   |

## Dashboard APIs (`/dashboard`)

All routes require authentication.

| Method | Path       | Auth | Notes                              |
| ------ | ---------- | ---- | ---------------------------------- |
| GET    | /dashboard | ✓    | Summary metrics (cached 5 minutes) |

## Achievements APIs (`/achievements`)

![Gamification - XP, Levels, Achievements, Challenges](https://via.placeholder.com/1200x400?text=Gamification%3A+XP%2C+Levels%2C+Achievements)

All routes require authentication.

| Method | Path                              | Auth | Notes                          |
| ------ | --------------------------------- | ---- | ------------------------------ |
| GET    | /achievements/list                | ✓    | User achievements              |
| POST   | /achievements/check               | ✓    | Evaluate & unlock achievements |
| GET    | /achievements/challenges/current  | ✓    | Current monthly challenge      |
| POST   | /achievements/challenges/complete | ✓    | Mark challenge task complete   |
| GET    | /achievements/challenges/history  | ✓    | Monthly challenge history      |

## Error Handling & Rate Limiting

- **Validation Errors**: 400 Bad Request with detailed field errors
- **Auth Errors**: 401 Unauthorized with recovery options
- **Rate Limit**: 429 Too Many Requests (use Retry-After header)
- **Server Errors**: 500 Internal Server Error with correlation ID

**Rate Limiting Defaults**:

- Auth endpoints: 3-5 per minute
- Write endpoints: 20-50 per minute
- Read endpoints: 100+ per minute
- Global fallback: 1000 per minute

See [SECURITY.md](./SECURITY.md) for detailed rate limit configuration.

## Operational Notes

```bash
# Development
npm run dev        # Start with auto-reload
npm run build      # Compile TypeScript
npm run lint       # Run ESLint

# Database
npm run seed       # Seed sample data
npm run deleteAll:users # Clear all users (dev only)
```
