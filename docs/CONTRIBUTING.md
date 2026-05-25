# Contributing to Loop Atom

Thank you for your interest in contributing to **Loop Atom**! We appreciate contributions of all kinds: bug reports, feature suggestions, documentation improvements, and code.

![Contributing - Code, Docs, Testing, Ideas](https://via.placeholder.com/1200x400?text=Contributing%3A+Code+%7C+Docs+%7C+Testing+%7C+Ideas)

## Code of Conduct

Please be respectful and constructive in all interactions. We're building a welcoming community.

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/yourusername/loop-atom.git
cd loop-atom
```

### 2. Set Up Development Environment

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with local MongoDB and Redis URIs
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or: bug/issue-description
# or: docs/improvement-description
```

---

## Development Guidelines

### Code Style

**TypeScript**

- Use strict mode (no `any` types)
- Define explicit types for function parameters and returns
- Use interfaces over types for public APIs
- Keep functions under 50 lines when possible

**Comments**

- Remove AI-generated obvious comments
- Add comments only for complex logic or non-obvious decisions
- Keep comments brief and human-written

**Naming**

- Use descriptive names: `getCurrentStreak()` not `getStreak()`
- Use consistent prefixes: `use*` for hooks, `with*` for HOCs
- Use domain language: `habitCompletion` not `log`

### Backend Changes

**Adding an Endpoint**

```typescript
// 1. Add validation schema
export const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  // ...
});

// 2. Add controller
export async function create(req: Request, res: Response) {
  // Use asyncHandler wrapper for automatic error handling
  // Validation happens automatically via validate middleware
}

// 3. Add route
router.post("/", validate(createHabitSchema, "body"), create);

// 4. Add tests
describe("POST /habits", () => {
  test("should create habit with valid data", async () => {
    // Test implementation
  });
});
```

**API Conventions**

- Use RESTful methods: GET, POST, PATCH, DELETE
- Return appropriate status codes: 201 for create, 204 for delete
- Wrap responses: `{ data: T, meta?: Metadata }`
- Include error correlation IDs for debugging

### Frontend Changes

**Adding a Component**

```typescript
// Use clear, specific names
interface HabitCardProps {
  habit: Habit;
  onComplete: (logId: string) => Promise<void>;
  isLoading?: boolean;
}

export function HabitCard({ habit, onComplete, isLoading }: HabitCardProps) {
  // Keep components focused on one responsibility
  // Extract complex logic to custom hooks
  // Use React Query for data fetching
}
```

**Adding a Hook**

```typescript
export function useHabitStats(habitId: string) {
  // Use React Query for server state
  return useQuery({
    queryKey: ["habits", habitId, "stats"],
    queryFn: async () => (await api.get(`/habits/${habitId}/stats`)).data,
    staleTime: 5 * 60 * 1000,
  });
}
```

---

## Testing

### Before Submitting

Run linting and type checking:

```bash
# Backend
npm run lint
npm run type-check

# Frontend
npm run lint
npm run type-check
```

Add tests for:

- New API endpoints
- Complex business logic (achievement unlocking, streak calc)
- Custom hooks
- Error scenarios

### Test Templates

**API Endpoint Test**

```typescript
describe("POST /habits/:id/complete", () => {
  test("should complete habit successfully", async () => {
    const response = await request(app)
      .post(`/habits/${habit._id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.log).toBeDefined();
    expect(response.body.log.dayKey).toBe(getTodayKey());
  });

  test("should prevent double-completion", async () => {
    // Complete once
    await request(app)
      .post(`/habits/${habit._id}/complete`)
      .set("Authorization", `Bearer ${token}`);

    // Try to complete again
    const response = await request(app)
      .post(`/habits/${habit._id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .expect(409);

    expect(response.body.error).toContain("already completed");
  });
});
```

**Hook Test**

```typescript
describe("useHabitStats", () => {
  test("should fetch habit statistics", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useHabitStats("habit-1"),
    );

    await waitForNextUpdate();

    expect(result.current.data).toBeDefined();
    expect(result.current.data.currentStreak).toBeGreaterThanOrEqual(0);
  });
});
```

---

## Commit Messages

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "feat: add achievement unlock notification

- Show toast when achievement is unlocked
- Add animation to celebration modal
- Invalidate achievement cache on unlock"

# Good
git commit -m "fix: prevent double-completion of habit

- Add unique constraint on (habit, dayKey)
- Return 409 Conflict if already completed
- Add test for concurrent completion attempts"

# Good
git commit -m "docs: add authentication flow explanation"

# Avoid
git commit -m "update stuff"
git commit -m "fix bugs"
git commit -m "WIP"
```

**Commit Message Format**

```
<type>: <subject (50 chars)>

<body (explain what and why, not how)>

<footer (reference issues, breaking changes)>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Pull Request Process

### Before Submitting

1. **Update from main**

   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run tests**

   ```bash
   cd backend && npm test
   cd ../frontend && npm test
   ```

3. **Check types and linting**
   ```bash
   npm run type-check && npm run lint
   ```

### PR Title & Description

**Title Format**

```
[Backend|Frontend] Brief description of change
```

**Description Template**

```markdown
## Description

Brief explanation of what this PR does

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Related Issues

Closes #123

## Testing

How to test these changes:

1. ...
2. ...

## Screenshots (if UI change)

[Add screenshots or GIFs]

## Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

- At least one approval required
- All conversations must be resolved
- CI must pass
- Code coverage must not decrease

---

## Documentation

Documentation is just as important as code. Update docs when:

- Adding new features
- Changing API behavior
- Modifying database schema
- Updating deployment procedures

**Documentation Files**

- `README.md` - Overview and quick start
- `CONTRIBUTING.md` - This file
- `SECURITY.md` - Security policies
- `docs/API.md` - API documentation
- `docs/ARCHITECTURE.md` - System design
- `docs/DATABASE.md` - Database schema

---

## Reporting Bugs

### Security Issues

Please see [SECURITY.md](./SECURITY.md) for responsible disclosure.

### Other Issues

Use GitHub Issues with:

1. **Description**: What is the bug?
2. **Steps to Reproduce**: How to trigger it?
3. **Expected Behavior**: What should happen?
4. **Actual Behavior**: What actually happens?
5. **Environment**: Node version, MongoDB version, etc.
6. **Screenshots**: If UI-related

---

## Feature Requests

Propose features in GitHub Discussions or Issues with:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: Your idea
3. **Alternatives Considered**: Other approaches
4. **Impact**: How many users would benefit?

---

## Release Process

The maintainers follow semantic versioning:

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features
- **Patch** (0.0.X): Bug fixes

---

## Questions?

- GitHub Discussions for questions
- GitHub Issues for bugs
- Email for private concerns

---

**Thank you for contributing!** 🎉

Every contribution helps make Loop Atom better for everyone.
