---
description: "Unit testing standards with Jest — Active when working on test files"
globs: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx"
alwaysApply: false
---

# Unit Testing Standards

## Framework
- **Jest** + **React Testing Library**
- Config: `jest.config.ts`
- Run: `yarn test` (all) or `yarn test --watch` (dev)

## Test File Structure

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  // Setup
  const mockProps: IUserProfileProps = {
    name: 'John Doe',
    email: 'john@example.com',
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Group related tests
  describe('rendering', () => {
    it('should render user name', () => {
      // Arrange
      render(<UserProfile {...mockProps} />);

      // Act — (rendering is the act)

      // Assert
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render email', () => {
      render(<UserProfile {...mockProps} />);
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onSave when save button is clicked', () => {
      // Arrange
      render(<UserProfile {...mockProps} />);

      // Act
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      expect(mockProps.onSave).toHaveBeenCalledTimes(1);
    });
  });
});
```

## AAA Pattern (Arrange-Act-Assert)
Every test must follow this pattern:
1. **Arrange** — Set up test data and render
2. **Act** — Perform the action being tested
3. **Assert** — Check expected outcomes

## Naming Convention
```typescript
// Pattern: should [expected behavior] when [condition]
it('should display error message when form is invalid', () => { });
it('should redirect to login when token expires', () => { });
it('should disable submit button when loading', () => { });
```

## Coverage Targets
| Metric | Target |
|--------|--------|
| Statements | ≥ 80% |
| Branches | ≥ 75% |
| Functions | ≥ 80% |
| Lines | ≥ 80% |

## Mocking Strategies

### Mock Redux Store
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import userReducer from 'store/slices/userSlice';

const createMockStore = (preloadedState = {}) =>
  configureStore({
    reducer: { user: userReducer },
    preloadedState,
  });

const renderWithStore = (ui: React.ReactElement, state = {}) => {
  const store = createMockStore(state);
  return render(<Provider store={store}>{ui}</Provider>);
};
```

### Mock Axios
```typescript
import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.get.mockResolvedValue({ data: mockUserData });
```

### Mock React Router
```typescript
import { MemoryRouter } from 'react-router-dom';

render(
  <MemoryRouter initialEntries={['/users/123']}>
    <Route path="/users/:id">
      <UserDetailPage />
    </Route>
  </MemoryRouter>
);
```

## What NOT To Test
- Third-party library internals
- Implementation details (internal state, private methods)
- Styling/CSS class names
- Constants and type definitions
