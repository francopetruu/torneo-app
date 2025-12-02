# Testing Guide

This guide explains the testing setup and how to write and run tests for the Beach Football Tournament application.

## Testing Stack

- **Vitest** - Test runner (fast, Vite-native)
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment for tests

## Test Structure

```
apps/
├── client/
│   └── src/
│       ├── test/
│       │   ├── setup.ts          # Test setup and mocks
│       │   ├── utils.tsx         # Custom render with providers
│       │   ├── mocks/            # Mock utilities
│       │   └── integration/      # Integration tests
│       ├── lib/
│       │   └── utils.test.ts     # Unit tests
│       ├── hooks/
│       │   └── *.test.ts         # Hook tests
│       └── components/
│           └── **/*.test.tsx     # Component tests
└── admin/
    └── src/
        └── [same structure]
```

## Running Tests

### Run all tests

```bash
npm run test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with UI

```bash
npm run test:ui
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Run tests for specific app

```bash
cd apps/client
npm run test

cd apps/admin
npm run test
```

## Writing Tests

### Unit Tests (Utilities)

```typescript
import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });
});
```

### Hook Tests

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useStandings } from "./useStandings";

// Mock Supabase
vi.mock("@/lib/supabase");

describe("useStandings", () => {
  it("should fetch standings", async () => {
    const { result } = renderHook(() => useStandings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.standings).toBeDefined();
  });
});
```

### Component Tests

```typescript
import { render, screen } from "../../test/utils";
import StandingsTable from "./standings-table";

// Mock hooks
vi.mock("@/hooks/useStandings");

describe("StandingsTable", () => {
  it("should render loading state", () => {
    (useStandings as any).mockReturnValue({
      loading: true,
      standings: [],
      error: null,
    });

    render(<StandingsTable />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
import { supabase } from "@/lib/supabase";

// Mock Supabase
vi.mock("@/lib/supabase");

describe("Standings Integration", () => {
  it("should fetch from database", async () => {
    const { data, error } = await supabase.from("standings").select("*");

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

## Test Coverage

### Coverage Targets

- **Critical paths**: 80% minimum
- **Utility functions**: 100%
- **Hooks**: 80% minimum
- **Components**: 70% minimum

### View Coverage Report

```bash
npm run test:coverage
```

Open `coverage/index.html` in your browser to view the detailed report.

## Mocking

### Mock Supabase

```typescript
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      }),
    }),
  },
}));
```

### Mock React Router

```typescript
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});
```

### Mock Hooks

```typescript
vi.mock("@/hooks/useStandings", () => ({
  useStandings: vi.fn(),
}));
```

## Best Practices

1. **Test behavior, not implementation**
   - Test what users see and do
   - Avoid testing internal state

2. **Use descriptive test names**

   ```typescript
   it("should display error message when fetch fails", () => {});
   ```

3. **Arrange-Act-Assert pattern**

   ```typescript
   it("should update score", () => {
     // Arrange
     const initialScore = 0;

     // Act
     const newScore = updateScore(initialScore, 1);

     // Assert
     expect(newScore).toBe(1);
   });
   ```

4. **Mock external dependencies**
   - Always mock Supabase
   - Mock React Router hooks
   - Mock custom hooks when testing components

5. **Test edge cases**
   - Empty states
   - Error states
   - Loading states
   - Boundary conditions

6. **Keep tests isolated**
   - Each test should be independent
   - Use `beforeEach` to reset mocks
   - Don't rely on test execution order

## Common Patterns

### Testing Async Operations

```typescript
it("should handle async data", async () => {
  const { result } = renderHook(() => useData());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).toBeDefined();
});
```

### Testing User Interactions

```typescript
import userEvent from "@testing-library/user-event";

it("should handle button click", async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();

  render(<Button onClick={handleClick}>Click me</Button>);

  await user.click(screen.getByText("Click me"));
  expect(handleClick).toHaveBeenCalled();
});
```

### Testing Form Validation

```typescript
it("should validate form fields", async () => {
  const user = userEvent.setup();

  render(<Form />);

  const submitButton = screen.getByRole("button", { name: /submit/i });
  await user.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
```

## CI/CD Integration

Tests run automatically in CI/CD pipeline:

- **On PR**: All tests must pass
- **On Push**: Tests run for main/develop branches
- **Coverage**: Uploaded to Codecov (if configured)

## Troubleshooting

### Tests failing in CI but passing locally

- Check Node.js version matches CI
- Verify environment variables are set
- Check for timing issues (use `waitFor`)

### Mock not working

- Ensure `vi.mock()` is called before imports
- Check mock path matches import path
- Verify mock return values match expected structure

### Coverage not generating

- Run `npm run test:coverage`
- Check `vitest.config.ts` coverage settings
- Verify coverage provider is installed

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
