---
description: "Forbidden patterns and anti-patterns — Always active"
globs: 
alwaysApply: true
---

# Forbidden Patterns

## TypeScript Forbidden

### ❌ `any` Type
```typescript
// ❌ BANNED
function processData(data: any): any { }
const result: any = getData();

// ✅ Use proper types
function processData(data: unknown): IProcessedData { }
function processData(data: IUserData): IProcessedData { }
```

### ❌ Non-null Assertion (`!`)
```typescript
// ❌ BANNED — Hides potential null bugs
const name = user!.name;
document.getElementById('root')!.innerHTML;

// ✅ Use optional chaining + nullish coalescing
const name = user?.name ?? 'Unknown';
const root = document.getElementById('root');
if (root) { /* safe to use */ }
```

### ❌ Type Assertions for Laziness
```typescript
// ❌ BANNED — Don't force types
const user = response.data as IUser;

// ✅ Validate the data
function isUser(data: unknown): data is IUser {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

## React Forbidden

### ❌ `console.log` in Production
```typescript
// ❌ BANNED — Remove all console.log before commit
console.log('user data:', userData);
console.log('debug:', response);

// ✅ Use proper logging service
import { logger } from 'utils/logger';
logger.info('User data loaded', { userId: userData.id });
```

### ❌ Inline Styles
```typescript
// ❌ BANNED
<div style={{ color: 'red', padding: '10px' }}>

// ✅ Use SCSS modules
<div className={styles.errorMessage}>
```

### ❌ Index as Key
```typescript
// ❌ BANNED — Causes rendering bugs
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// ✅ Use unique identifier
{items.map((item) => (
  <Item key={item.id} data={item} />
))}
```

### ❌ Direct DOM Manipulation
```typescript
// ❌ BANNED
document.getElementById('myDiv').style.display = 'none';
document.querySelector('.title').textContent = 'New Title';

// ✅ Use React state
const [isVisible, setIsVisible] = useState(true);
{isVisible && <div>Content</div>}
```

## Code Quality Forbidden

### ❌ Magic Numbers/Strings
```typescript
// ❌ BANNED
if (retryCount > 3) { }
if (status === 'active') { }
setTimeout(callback, 5000);

// ✅ Use named constants
const MAX_RETRY_COUNT = 3;
const USER_STATUS = { ACTIVE: 'active' } as const;
const ANIMATION_DELAY_MS = 5000;

if (retryCount > MAX_RETRY_COUNT) { }
if (status === USER_STATUS.ACTIVE) { }
setTimeout(callback, ANIMATION_DELAY_MS);
```

### ❌ Commented-Out Code
```typescript
// ❌ BANNED — Delete, don't comment
// const oldFeature = () => { ... };
// if (useNewUI) { ... }

// ✅ Use Git history to recover old code
```

### ❌ Circular Imports
```typescript
// ❌ BANNED — File A imports B, B imports A
// fileA.ts
import { funcB } from './fileB';
// fileB.ts
import { funcA } from './fileA';  // CIRCULAR!

// ✅ Extract shared code to a third file
// shared.ts — shared between A and B
```

### ❌ Nested Ternaries
```typescript
// ❌ BANNED
const label = isAdmin ? 'Admin' : isEditor ? 'Editor' : isPending ? 'Pending' : 'User';

// ✅ Use mapping or function
const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  pending: 'Pending',
};
const label = ROLE_LABELS[role] ?? 'User';
```

### ❌ `eval()` and `Function()` Constructor
```typescript
// ❌ ABSOLUTELY BANNED — Security vulnerability
eval(userInput);
new Function(userInput)();
```

## Summary Table

| Pattern | Status | Alternative |
|---------|--------|-------------|
| `any` type | 🚫 Banned | `unknown`, proper types |
| `console.log` | 🚫 Banned | Logger service |
| Inline styles | 🚫 Banned | SCSS modules |
| Magic numbers | 🚫 Banned | Named constants |
| Index as key | 🚫 Banned | Unique ID |
| Commented code | 🚫 Banned | Git history |
| Nested ternaries | 🚫 Banned | Mapping/function |
| `eval()` | 🚫 Banned | Never use |
| Direct DOM | 🚫 Banned | React state |
| Circular imports | 🚫 Banned | Extract shared |
| Non-null `!` | 🚫 Banned | Optional chaining |
