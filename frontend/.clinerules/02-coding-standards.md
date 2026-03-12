---
description: "Coding standards and principles — Always active"
globs: 
alwaysApply: true
---

# Coding Standards

## Core Principles
1. **Clean Code** — Code should be readable and self-documenting
2. **SOLID** — Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
3. **DRY** — Don't Repeat Yourself
4. **KISS** — Keep It Simple, Stupid
5. **YAGNI** — You Aren't Gonna Need It

## TypeScript Rules

### Strict Typing
- Enable `strict: true` in `tsconfig.json`
- **Never** use `any` — use `unknown` if type is uncertain, then narrow
- Define explicit return types for all public functions
- Use `interface` for object shapes, `type` for unions/intersections

```typescript
// ✅ Good
interface IUserData {
  id: string;
  name: string;
  email: string;
}

function getUserById(id: string): IUserData | null {
  // implementation
}

// ❌ Bad
function getUserById(id: any): any {
  // implementation
}
```

### Enums and Constants
- Prefer `const enum` or string literal unions over regular `enum`
- Group related constants in dedicated files under `src/constants/`

```typescript
// ✅ Preferred
type UserRole = 'admin' | 'editor' | 'viewer';

// ✅ Also acceptable
const enum UserRole {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}
```

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | `camelCase` | `userName`, `isActive` |
| Functions | `camelCase` | `getUserData`, `handleClick` |
| Components | `PascalCase` | `UserProfile`, `DataTable` |
| Interfaces | `IPascalCase` | `IUserData`, `IApiResponse` |
| Types | `PascalCase` | `UserRole`, `ApiError` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| SCSS variables | `kebab-case` with `$` | `$primary-color`, `$font-size-lg` |
| CSS class names | `camelCase` (SCSS modules) | `.userProfile`, `.headerTitle` |
| Files (component) | `PascalCase.tsx` | `UserProfile.tsx` |
| Files (utility) | `camelCase.ts` | `formatDate.ts` |
| Files (test) | `*.test.ts(x)` | `UserProfile.test.tsx` |
| Directories | `camelCase` | `userManagement/` |

## Import Ordering
Organize imports in this exact order, separated by blank lines:

```typescript
// 1. React and framework imports
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// 2. Third-party libraries
import { useSelector } from 'react-redux';
import axios from 'axios';

// 3. Internal modules (absolute paths)
import { UserService } from 'application/services/UserService';
import { IUserData } from 'types/user';

// 4. Components
import { Button } from 'components/common/Button';
import { UserAvatar } from 'components/UserAvatar';

// 5. Hooks
import { useAuth } from 'hooks/useAuth';

// 6. Utils, constants, types
import { formatDate } from 'utils/formatDate';
import { API_ENDPOINTS } from 'constants/api';

// 7. Styles
import styles from './UserProfile.module.scss';
```

## ESLint & Prettier
- All code must pass ESLint without errors or warnings
- Run `yarn lint` before committing
- Prettier handles formatting — do not manually format
- Use `yarn lint:fix` for auto-fix
- Configuration files: `.eslintrc.json`, `.prettierrc`

## Function Guidelines
- Keep functions under **30 lines** (excluding comments)
- Max **3 parameters** — use an options object for more
- One function, one responsibility
- Use early returns to reduce nesting

```typescript
// ✅ Good — early return
function processUser(user: IUserData | null): string {
  if (!user) return 'Unknown';
  if (!user.name) return 'Anonymous';
  return user.name.trim();
}

// ❌ Bad — deep nesting
function processUser(user: IUserData | null): string {
  if (user) {
    if (user.name) {
      return user.name.trim();
    } else {
      return 'Anonymous';
    }
  } else {
    return 'Unknown';
  }
}
```

## Error Handling
- Always handle errors explicitly — never swallow exceptions
- Use typed errors with descriptive messages
- Log errors at the boundary layer, not everywhere
- See `14-security.md` for security-related error handling
