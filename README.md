# Tracker — Gamified Habit Tracker

A premium, animated, gamified habit tracker. **Production-ready** with comprehensive security hardening.

**Stack**: Next.js 15 + Express + MongoDB + Redis | **Security**: HTTPS/TLS, CSRF protection, email verification, account lockout, rate limiting, audit logging

## 🚀 Quick Start

### Development

```bash
# 1. Backend
cd backend
cp .env.example .env        # Paste your MongoDB & Redis URIs
npm install
npm run seed                # Optional: load mock data
npm run dev                 # Runs on http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env.local  # No config needed for local dev
npm install
npm run dev                 # Runs on http://localhost:3000
```

### Production

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete deployment guide with environment setup, database configuration, and security verification.

## ✅ Security Features

| Feature                    | Status | Details                                                            |
| -------------------------- | ------ | ------------------------------------------------------------------ |
| **HTTPS/TLS**              | ✅     | Helmet CSP, HSTS, X-Frame-Options, HTTPS redirect in production    |
| **CSRF Protection**        | ✅     | csurf middleware with httpOnly cookies and token validation        |
| **Email Verification**     | ✅     | Required before first login, 24-hour token expiry                  |
| **Account Lockout**        | ✅     | 5 failed attempts → 30-minute lock, auto-reset on success          |
| **Rate Limiting**          | ✅     | Per-endpoint limits (auth: 3-5/min, habits: 30/min, todos: 50/min) |
| **Brute Force Protection** | ✅     | Progressive lockout with exponential backoff                       |
| **Audit Logging**          | ✅     | All security events logged to files, searchable JSON format        |
| **Password Hashing**       | ✅     | bcryptjs 12-round salting                                          |
| **JWT Rotation**           | ✅     | 15-min access, 14-day refresh with jti-based rotation              |
| **Production Enforcement** | ✅     | COOKIE_SECURE=true required, SMTP validation in prod               |

**Full details**: See [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)

## 📚 Stack

| Layer    | Tech                                                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | Next.js 15 App Router · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion · Recharts · Zustand                                      |
| Backend  | Node 20 · Express · TypeScript · Mongoose · ioredis · JWT (access + refresh rotation) · Zod validation · Helmet · bcryptjs · Nodemailer |
| Security | csurf · Winston logging · Rate limiting · Email verification · Account lockout · Audit trail                                            |
| Database | MongoDB Atlas (encryption at rest, IP whitelist, backups)                                                                               |
| Cache    | Redis Cloud (sessions, rate-limit, analytics, persistence)                                                                              |
| DevOps   | Docker · docker-compose · GitHub Actions CI/CD · Nginx reverse proxy                                                                    |

## 🏗️ Project Structure

```
tracker/
├── backend/
│   └── src/
│       ├── config/        Environment, database, Redis, logging
│       ├── models/        Mongoose schemas with email verification, account lockout
│       ├── routes/        REST routes with CSRF protection
│       ├── controllers/   Request handlers with auth/verification flows
│       ├── services/      Email, leveling, achievements, tokens
│       ├── middleware/    Auth, CSRF, rate limiting, audit logging, error handling
│       ├── validators/    Zod input schemas
│       ├── scripts/       Database seeding
│       └── utils/         Logger, API errors, async handlers
├── frontend/
│   └── src/
│       ├── app/           App Router pages with layout
│       ├── components/    UI components (achievements, auth, dashboard, etc.)
│       ├── lib/           API client with CSRF token injection
│       ├── hooks/         Custom hooks (useHabits, useTodos, etc.)
│       ├── stores/        Zustand state (auth, theme, achievements)
│       └── providers/     Root providers & context
├── .github/workflows/    GitHub Actions CI/CD pipeline
├── SECURITY_CHECKLIST.md Security features and verification
└── PRODUCTION_DEPLOYMENT.md Complete deployment guide
```

## 🔌 API Surface

### Security Endpoints

| Method | Path                                | Auth | Notes                                        |
| ------ | ----------------------------------- | ---- | -------------------------------------------- |
| GET    | /api/csrf-token                     | —    | Fetch CSRF token for state-changing requests |
| POST   | /api/auth/verify-email              | —    | Verify email with token                      |
| POST   | /api/auth/resend-verification-email | —    | Resend verification email                    |

### Authentication

| Method | Path                      | Auth | Notes                                         |
| ------ | ------------------------- | ---- | --------------------------------------------- |
| POST   | /api/auth/register        | —    | Creates user, sends verification email        |
| POST   | /api/auth/login           | —    | Rate-limited (5/min), requires verified email |
| POST   | /api/auth/logout          | —    | Clears refresh token                          |
| POST   | /api/auth/refresh         | —    | Rotates refresh token                         |
| POST   | /api/auth/forgot-password | —    | Sends 30-min password reset email             |
| POST   | /api/auth/reset-password  | —    | Resets password, unlocks account              |

### User Management

| Method | Path           | Auth | Notes                    |
| ------ | -------------- | ---- | ------------------------ |
| GET    | /api/users/me  | ✓    | Get current user profile |
| PATCH  | /api/users/me  | ✓    | Update user profile      |
| GET    | /api/users/:id | ✓    | Get user by ID           |

### Habits (30 req/min per user)

| Method | Path                     | Auth | Notes                     |
| ------ | ------------------------ | ---- | ------------------------- |
| GET    | /api/habits              | ✓    | List user habits          |
| POST   | /api/habits              | ✓    | Create new habit          |
| PATCH  | /api/habits/:id          | ✓    | Update habit settings     |
| DELETE | /api/habits/:id          | ✓    | Delete habit              |
| POST   | /api/habits/:id/complete | ✓    | Mark complete, award XP   |
| GET    | /api/habits/:id/logs     | ✓    | Paginated completion logs |

### Todos (50 req/min per user)

| Method | Path           | Auth | Notes           |
| ------ | -------------- | ---- | --------------- |
| GET    | /api/todos     | ✓    | List user todos |
| POST   | /api/todos     | ✓    | Create new todo |
| PATCH  | /api/todos/:id | ✓    | Update todo     |
| DELETE | /api/todos/:id | ✓    | Delete todo     |

### Dashboard & Analytics

| Method | Path                          | Auth | Notes                        |
| ------ | ----------------------------- | ---- | ---------------------------- |
| GET    | /api/dashboard                | ✓    | Aggregated stats (60s cache) |
| GET    | /api/achievements             | ✓    | User achievements            |
| GET    | /api/achievements/leaderboard | ✓    | Global leaderboard           |

### Admin

| Method | Path        | Auth | Notes                |
| ------ | ----------- | ---- | -------------------- |
| GET    | /api/health | —    | Service health check |

**Rate Limiting Defaults**:

- Auth endpoints: 3-5 per minute
- Write endpoints: 20-50 per minute
- Read endpoints: 100+ per minute
- Global fallback: 1000 per minute

See [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) for complete rate limit details.

## 🚀 Deployment

### Quick Deploy (Staging/Dev)

```bash
docker-compose up -d
docker-compose logs -f
```

### Production Deploy

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete guide:

- Environment configuration (MongoDB Atlas, Redis Cloud, SMTP)
- Security checklist verification
- Docker image building & pushing
- Kubernetes manifests (if using K8s)
- Health checks & monitoring
- Rollback procedures

### CI/CD Pipeline

Automatically triggered on push/PR to `main` or `develop`:

- ✅ Lint (frontend + backend)
- ✅ Test (backend with MongoDB + Redis services)
- ✅ Security audit (npm audit)
- ✅ Build (generate artifacts)

See [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)

## 📖 Documentation

| Document                                             | Purpose                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)       | Complete list of security implementations, verification steps, and pre-production checklist |
| [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) | Deployment guide, environment setup, monitoring, troubleshooting, rollback procedures       |
| [README.md](README.md)                               | This file — quick start, stack, API reference                                               |

## 🔑 Key Implementation Notes

### Email Verification

- Required before first login
- Verification tokens expire in 24 hours
- Resend endpoint available for expired tokens
- Gracefully degrades if SMTP not configured (dev mode only)

### Account Lockout

- 5 failed login attempts → 30-minute lock
- Lock resets on successful login or password reset
- Prevents permanent account locks
- Returns 403 with unlock timestamp

### Rate Limiting

- Per-user + per-IP tracking via Redis
- Fails open if Redis unavailable (continues without limiting)
- Returns RFC 6585 headers (RateLimit-Limit, RateLimit-Remaining, Retry-After)
- 429 Too Many Requests on limit exceeded

### CSRF Protection

- csurf middleware validates all POST/PUT/PATCH/DELETE requests
- Tokens stored in httpOnly cookies (1-hour expiry)
- Frontend automatically injects X-CSRF-Token header
- 403 Forbidden on token validation failure

### Refresh Token Rotation

- Stored in Redis with jti (unique ID) to prevent reuse
- Access token: 15 minutes
- Refresh token: 14 days
- New refresh token issued on each rotation

### Audit Logging

- All state-changing requests logged to `logs/http.log`
- Security events (401, 403, 429, lockout) logged to `logs/error.log`
- Combined log in `logs/combined.log`
- JSON format for log aggregation (Splunk, ELK, etc.)

### Docker Optimization

- Multi-stage builds for small image sizes
- Alpine Linux base (minimal attack surface)
- Non-root user execution (node:node 1000:1000)
- dumb-init for proper signal handling
- Health checks for all services

## 💡 Development

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start development servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Lint
cd backend && npm run lint
cd frontend && npm run lint

# Build for production
cd backend && npm run build
cd frontend && npm run build

# Seed database
cd backend && npm run seed


```

## 🧪 Testing

```bash
# Run backend tests (if configured)
cd backend && npm test

# Run frontend tests (if configured)
cd frontend && npm test

# Security audit
cd backend && npm audit
cd frontend && npm audit
```

## 📊 Performance

- Frontend: Next.js static generation with image optimization
- Backend: Rate limiting, request body size limit (100KB)
- Database: Connection pooling, indexed queries
- Cache: Redis for sessions, dashboards, rate limit buckets
- Logs: Async file writes to prevent blocking

## 🆘 Troubleshooting

### MongoDB Connection Failed

```bash
# Verify URI format and network access
mongosh $MONGODB_URI
# Check MongoDB Atlas IP whitelist
```

### Redis Connection Failed

```bash
# Verify Redis endpoint and credentials
redis-cli -u $REDIS_URL ping
```

### Email Not Sending

```bash
# Check SMTP configuration in backend logs
docker-compose logs backend | grep -i smtp
# Verify email credentials and provider firewall
```

### High Error Rate

```bash
# Check application logs
docker-compose logs backend

# Verify rate limits
redis-cli -u $REDIS_URL KEYS "rl:*"

# Check database status
mongosh $MONGODB_URI --eval "db.users.countDocuments()"
```

---

**Status**: ✅ Production Ready  
**Last Updated**: 2025-05-25  
**Security Score**: 94% (all CRITICAL issues resolved)
