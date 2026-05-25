# Frontend Architecture & Components

**Loop Atom Frontend** — Beautiful, responsive Next.js app celebrating daily habit wins.

## Overview

Loop Atom frontend is a **Next.js 15 App Router** application with **React 19**, built for performance, type safety, and delightful UX that celebrates consistency.

![Frontend Stack - Next.js, React, TypeScript, TailwindCSS](https://via.placeholder.com/1200x400?text=Frontend%3A+Next.js+15+%7C+React+19+%7C+TypeScript)

### Technology Stack

| Technology        | Purpose                                  |
| ----------------- | ---------------------------------------- |
| **Next.js 15**    | App Router, SSR, optimized bundles       |
| **React 19**      | Component framework with latest features |
| **TypeScript**    | Type-safe development                    |
| **TailwindCSS**   | Utility-first styling                    |
| **shadcn/ui**     | High-quality component library           |
| **Zustand**       | Lightweight client state                 |
| **React Query**   | Server state management & caching        |
| **Framer Motion** | Smooth animations & transitions          |
| **Axios**         | HTTP client with CSRF integration        |

## App Structure

### Authentication Routes

Protected by redirect middleware - users cannot access without login.

| Route              | Component         | Features                              |
| ------------------ | ----------------- | ------------------------------------- |
| `/login`           | Login form        | Email/password auth, error handling   |
| `/register`        | Registration form | Validation, email verification prompt |
| `/forgot-password` | Recovery form     | Password reset request                |
| `/reset-password`  | Reset form        | Complete password change              |

### Application Routes (Protected)

![App Routes - Dashboard, Habits, Todos, Settings](https://via.placeholder.com/1200x400?text=App+Routes%3A+Dashboard+%7C+Habits+%7C+Todos+%7C+Settings)

| Route          | Purpose              | Key Features                  |
| -------------- | -------------------- | ----------------------------- |
| `/`            | Landing page         | Hero, features, CTA           |
| `/dashboard`   | Performance overview | Metrics, charts, activity     |
| `/habits`      | Habit management     | List, create, view details    |
| `/habits/[id]` | Habit detail view    | Heatmap, logs, inline editing |
| `/todos`       | Task board           | CRUD, reorder, planning       |
| `/settings`    | User profile         | Info update, password change  |
| `/about`       | Product info         | Team, mission, roadmap        |

## Core Components

### 🏠 Layout Components

**Root Layout** (`src/app/layout.tsx`)

- Providers setup (Auth, Theme, Query Client)
- Global styles and fonts
- Metadata and SEO

**App Layout** (`src/app/(app)/layout.tsx`)

- Authenticated shell
- Navigation sidebar/header
- Toast notifications
- Theme toggle

### 📊 Dashboard Components

![Dashboard Components - Metrics, Charts, Heatmap](https://via.placeholder.com/1200x400?text=Dashboard%3A+Metrics%2C+Charts%2C+Trends)

| Component             | Purpose                                   |
| --------------------- | ----------------------------------------- |
| **MetricCard**        | Display single metric (streaks, XP, etc.) |
| **PerformanceCharts** | Recharts graphs (line, bar)               |
| **Heatmap**           | Month-at-glance activity grid             |
| **ActivitySummary**   | Key stats and trends                      |

### 🎯 Habit Components

| Component               | Purpose                               |
| ----------------------- | ------------------------------------- |
| **HabitCard**           | Habit summary with quick-tap complete |
| **CreateHabitDialog**   | Form to add new habit                 |
| **CompleteDialog**      | Log completion with mood tracking     |
| **HabitMonthHeatmap**   | Calendar view of monthly activity     |
| **HabitLogsTimeline**   | Timeline of all completions           |
| **TargetReachedDialog** | Achievement unlock feedback           |

### ✅ Todo Components

| Component             | Purpose                  |
| --------------------- | ------------------------ |
| **TodoList**          | Render all user todos    |
| **TodoItem**          | Single todo with actions |
| **TodoCreateForm**    | Add new todo             |
| **TodoReorderDialog** | Drag-and-drop reordering |

### 🎮 Achievement Components

| Component            | Purpose                 |
| -------------------- | ----------------------- |
| **AchievementPopup** | Unlock notification     |
| **AchievementList**  | Browse all achievements |
| **LevelProgressBar** | XP and level display    |

### 🔐 Auth Components

| Component             | Purpose                       |
| --------------------- | ----------------------------- |
| **AuthShell**         | Layout wrapper for auth pages |
| **LoginForm**         | Email/password login          |
| **RegisterForm**      | Account creation              |
| **PasswordResetForm** | Password recovery flow        |

### 🎨 UI Components (shadcn/ui)

Located in `src/components/ui/`:

- Button, Input, Dialog
- Card, Tabs, Select
- Badge, Progress, Toast
- And more...

## State Management

### Zustand Stores

**Auth Store** (`src/stores/auth.ts`)

```typescript
- user: User | null
- isAuthenticated: boolean
- setUser(user)
- logout()
- updateUser(fields)
```

**Theme Store** (`src/stores/theme.ts`)

```typescript
- theme: 'dark' | 'gaming' | 'fantasy'
- setTheme(theme)
```

**Achievements Store** (`src/stores/achievements.ts`)

```typescript
- queue: Achievement[]
- addAchievement(achievement)
- popAchievement()
```

### React Query Hooks

**Custom Hooks** in `src/hooks/`:

| Hook                | Purpose                       |
| ------------------- | ----------------------------- |
| `useHabits()`       | Fetch & manage user habits    |
| `useTodos()`        | Fetch & manage user todos     |
| `useDashboard()`    | Fetch dashboard metrics       |
| `useAchievements()` | Check and unlock achievements |

Features:

- Automatic caching & background refetch
- Invalidation on mutations
- Loading/error states
- Pagination support

## Data Flow

```
User Action
    ↓
React Component Event Handler
    ↓
Call React Query Hook
    ↓
Hook calls API Client (src/lib/api.ts)
    ↓
API Client adds:
  - CSRF Token
  - JWT (from httpOnly cookie)
  - Correlation ID
    ↓
Backend Validates & Responds
    ↓
Hook caches response
    ↓
Component re-renders with new data
```

## API Client Integration

**File**: `src/lib/api.ts`

```typescript
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Include cookies
});

// Automatic CSRF token injection
apiClient.interceptors.request.use((config) => {
  const token = getCsrfToken(); // From server
  if (token && isWriteOperation(config)) {
    config.headers["X-CSRF-Token"] = token;
  }
  return config;
});

// Error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      // Show rate limit toast
    }
    // Handle other errors
  },
);
```

## Performance Optimizations

### Bundle Size

- Tree-shaking unused code
- Code-splitting at route boundaries
- Dynamic imports for heavy components

### Images & Media

- Next.js Image component for optimization
- WebP format with fallback
- Lazy loading for offscreen images

### State Caching

- React Query manages server state
- Zustand for lightweight client state
- No unnecessary re-renders

### Database Queries

- Backend caching with Redis
- Dashboard 5-min cache
- Pagination for large lists

## Styling Strategy

### TailwindCSS

- Utility-first approach
- Custom color themes (dark, gaming, fantasy)
- Responsive design (mobile-first)

### Dark Mode

- Uses `next-themes` for persistence
- CSS variables for theme colors
- Automatic light/dark preference detection

### Animations

- Framer Motion for complex animations
- CSS transitions for simple effects
- Confetti on achievement unlock

## Getting Started (Development)

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local

# Start dev server
npm run dev

# Visit http://localhost:3000
```

### Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Testing & Quality

- **TypeScript**: Full type coverage
- **ESLint**: Code style enforcement
- **Next.js Lint**: Framework-specific rules
- **Component Tests**: Unit tests for complex components (expanding)

## Key Features Implemented

✅ User authentication with email verification  
✅ Habit creation, completion, and logging  
✅ Calendar heatmap visualization  
✅ Todo CRUD and reordering  
✅ Dashboard with metrics and charts  
✅ Achievement system with auto-unlock  
✅ Multiple themes (dark, gaming, fantasy)  
✅ Real-time notifications and feedback  
✅ Mobile responsive design  
✅ Offline support (coming soon)

## Future Improvements

- [ ] E2E tests with Playwright
- [ ] Performance monitoring (Web Vitals)
- [ ] Offline support with service workers
- [ ] Social features (sharing, leaderboards)
- [ ] Advanced analytics and insights
- [ ] Mobile app via React Native
- Calendar-aware task context

### Dashboard experience

- Streak and completion metrics
- Visual performance components (cards, charts, heatmaps)
- Data refresh through React Query cache invalidation

### Achievement and feedback experience

- Achievement check trigger and popup queue
- Toast feedback for success/error flows
- Global handling for rate-limit responses (429)

## Component Inventory (high-level)

### Layout and shell

- `src/app/layout.tsx`
- `src/app/(app)/layout.tsx`
- `src/components/shell/*`

### Habit components

- `src/components/habits/CreateHabitDialog.tsx`
- `src/components/habits/CompleteDialog.tsx`
- `src/components/habits/HabitCard.tsx`
- `src/components/habits/HabitMonthHeatmap.tsx`
- `src/components/habits/TargetReachedDialog.tsx`

### Dashboard components

- `src/components/dashboard/MetricCard.tsx`
- `src/components/dashboard/Heatmap.tsx`
- `src/components/dashboard/PerformanceCharts.tsx`

### Todo components

- `src/components/todos/*`

### Auth components

- `src/components/auth/AuthShell.tsx`

### Shared UI

- `src/components/ui/*`

## State and Data Flow

- API client in `src/lib/api.ts` with cookie-based auth and CSRF token handling
- React Query hooks in `src/hooks/*`
- Local stores in `src/stores/*` (auth, achievements, theme)

## Basic Frontend Architecture

1. Page loads route segment.
2. Route calls React Query hooks.
3. Hooks call shared Axios instance.
4. Backend responds with typed payloads.
5. UI updates and cache invalidates where needed.

## Frontend Quality Notes

- Strong use of typed hooks and centralized API client.
- Good composability between page, feature, and shared UI layers.
- Recommended next step: add route-level integration tests for critical flows.
