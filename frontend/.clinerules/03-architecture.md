---
description: "Clean Architecture rules and layer boundaries — Always active"
globs: 
alwaysApply: true
---

# Architecture Rules

## Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │  React components, pages, hooks
│  (depends on Application)               │
├─────────────────────────────────────────┤
│           Application Layer             │  Use cases, services, DTOs
│  (depends on Domain)                    │
├─────────────────────────────────────────┤
│          Infrastructure Layer           │  API clients, repositories
│  (depends on Domain)                    │
├─────────────────────────────────────────┤
│             Domain Layer                │  Entities, interfaces, value objects
│  (no dependencies)                      │
└─────────────────────────────────────────┘
```

## Dependency Rules

### ✅ Allowed Dependencies
- **Presentation** → Application, Domain
- **Application** → Domain
- **Infrastructure** → Domain
- **Domain** → Nothing (zero dependencies)

### ❌ Forbidden Dependencies
- Domain → Application, Infrastructure, Presentation
- Application → Infrastructure, Presentation
- Infrastructure → Application, Presentation

### Practical Example

```typescript
// ✅ Good — Presentation depends on Application
// src/presentation/pages/UserPage.tsx
import { UserService } from 'application/services/UserService';

// ✅ Good — Application depends on Domain
// src/application/services/UserService.ts
import { IUser } from 'domain/entities/User';
import { IUserRepository } from 'domain/repositories/IUserRepository';

// ✅ Good — Infrastructure implements Domain interface
// src/infrastructure/repositories/UserRepository.ts
import { IUserRepository } from 'domain/repositories/IUserRepository';

// ❌ Bad — Domain depends on Infrastructure
// src/domain/entities/User.ts
import { axiosInstance } from 'infrastructure/api/axiosInstance'; // FORBIDDEN
```

## Layer Responsibilities

### Domain Layer (`src/domain/`)
- Business entities and value objects
- Repository interfaces (contracts)
- Domain-specific error types
- Business validation rules
- **No frameworks, no libraries, no React**

### Application Layer (`src/application/`)
- Use case implementations
- Service classes that orchestrate business logic
- Data Transfer Objects (DTOs)
- Mappers (Entity ↔ DTO conversion)

### Infrastructure Layer (`src/infrastructure/`)
- API client implementations (Axios)
- Repository implementations
- External service integrations
- Local storage adapters

### Presentation Layer (`src/presentation/`)
- React components and pages
- Custom hooks
- Event handlers
- UI state management

## React Router v5 Conventions

```typescript
// Route definition pattern
import { Switch, Route, Redirect } from 'react-router-dom';

const AppRoutes: React.FC = () => (
  <Switch>
    <Route exact path="/" component={HomePage} />
    <Route path="/users/:id" component={UserDetailPage} />
    <Route path="/users" component={UserListPage} />
    <Redirect to="/" />
  </Switch>
);
```

### Navigation Rules
- Use `useHistory()` hook for programmatic navigation
- Use `<Link>` component for declarative navigation
- Define routes as constants in `src/constants/routes.ts`
- Use `useParams()` and `useLocation()` for route data

```typescript
// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  SETTINGS: '/settings',
} as const;
```

## Module Boundaries
- Each module/feature should have its own directory
- Export through `index.ts` barrel files
- Avoid circular dependencies between modules
- Shared code goes in `src/utils/` or `src/types/`
