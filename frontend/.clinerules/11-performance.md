---
description: "React performance optimization — Active when working on source files"
globs: "src/**"
alwaysApply: false
---

# Performance Optimization

## React Rendering Rules

### React.memo
Use `React.memo` for components that:
- Receive stable props from parent
- Are rendered inside lists
- Are computationally expensive to render

```typescript
// ✅ Good — Pure display component
const UserCard: React.FC<IUserCardProps> = memo(({ name, avatar }) => (
  <div className={styles.card}>
    <img src={avatar} alt={name} />
    <span>{name}</span>
  </div>
));

// ❌ Don't memo — Component with frequently changing props
const Timer: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  // Props change every second, memo is useless
};
```

### useMemo
Use for **expensive computations** only:

```typescript
// ✅ Good — Filtering large dataset
const filteredUsers = useMemo(
  () => users.filter(u => u.role === selectedRole),
  [users, selectedRole]
);

// ❌ Bad — Simple computation, no need for memo
const fullName = useMemo(
  () => `${firstName} ${lastName}`,
  [firstName, lastName]
);
```

### useCallback
Use when passing functions as props to memoized children:

```typescript
// ✅ Good — Prevents UserList re-render
const handleUserClick = useCallback((id: string) => {
  dispatch(selectUser(id));
}, [dispatch]);

return <UserList onClick={handleUserClick} />;
```

## Lazy Loading

### Route-based Code Splitting
```typescript
import React, { lazy, Suspense } from 'react';

const UserPage = lazy(() => import('pages/UserPage'));
const SettingsPage = lazy(() => import('pages/SettingsPage'));

const Routes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Switch>
      <Route path="/users" component={UserPage} />
      <Route path="/settings" component={SettingsPage} />
    </Switch>
  </Suspense>
);
```

### Component-level Lazy Loading
```typescript
// Heavy components (charts, editors, tables)
const HeavyChart = lazy(() => import('components/HeavyChart'));
```

## Redux Selector Optimization

```typescript
import { createSelector } from '@reduxjs/toolkit';

// ✅ Good — Memoized selector
export const selectActiveUsers = createSelector(
  [(state: RootState) => state.user.list],
  (users) => users.filter(u => u.isActive)
);

// ❌ Bad — Creates new array reference every time
export const selectActiveUsers = (state: RootState) =>
  state.user.list.filter(u => u.isActive);
```

## API Call Optimization
- Cancel requests on component unmount (Axios CancelToken)
- Debounce search inputs (300ms minimum)
- Avoid unnecessary API calls with proper dependency arrays

```typescript
useEffect(() => {
  const source = axios.CancelToken.source();
  
  fetchData({ cancelToken: source.token });
  
  return () => source.cancel('Component unmounted');
}, [id]);
```

## Bundle Analysis
- Run `yarn analyze` to check bundle size
- Keep initial bundle < 200KB (gzipped)
- Lazy load routes and heavy dependencies
- Check for duplicate packages in bundle

## Performance Checklist
- [ ] No unnecessary re-renders (React DevTools Profiler)
- [ ] Large lists use windowing/virtualization
- [ ] Images are optimized and lazy-loaded
- [ ] API responses are cached when appropriate
- [ ] No memory leaks (cleanup effects, cancel requests)
