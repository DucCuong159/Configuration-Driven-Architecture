---
description: "Project context and tech stack overview — Always active"
globs: 
alwaysApply: true
---

# Project Context

## Project Overview
- **Type:** Samsung Enterprise Web Application
- **Architecture:** Clean Architecture (Domain → Application → Infrastructure → Presentation)
- **Repository:** Single repo (monolith)

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React (CRA) | 18.2 |
| Language | TypeScript | Strict mode |
| State Management | Redux Toolkit | Latest |
| Styling | SCSS Modules | Manual styling |
| Routing | React Router | 5.3.4 |
| UI Libraries | MUI + PrimeReact TreeTable | Latest |
| HTTP Client | Axios | Latest |
| Testing | Jest + React Testing Library | Latest |
| Bundler | Webpack | 4 (migrating to 5) |
| Linting | ESLint + Prettier | Latest |

## Project Structure

```
src/
├── domain/          # Business entities, interfaces, value objects
├── application/     # Use cases, services, DTOs
├── infrastructure/  # API clients, repositories, external services
├── presentation/    # React components, pages, hooks
│   ├── components/  # Reusable UI components
│   ├── pages/       # Page-level components
│   ├── hooks/       # Custom React hooks
│   ├── layouts/     # Layout components
│   └── routes/      # Route definitions
├── store/           # Redux store, slices, selectors
├── assets/          # Images, fonts, icons
├── styles/          # Global SCSS, variables, mixins
├── utils/           # Utility functions
├── constants/       # App constants, enums
├── types/           # Shared TypeScript types/interfaces
└── i18n/            # Internationalization files
```

## Key Dependencies
- **No Tailwind CSS** — Use SCSS modules only
- **No CSS-in-JS** — Use SCSS for all styling
- **React Router v5** — Not v6 (different API)
- **Class components** are legacy — Use functional components with hooks
- **PrimeReact** — Only for TreeTable component

## Naming Conventions Summary
- **Files:** `PascalCase` for components, `camelCase` for utilities
- **Components:** `PascalCase` (e.g., `UserProfile.tsx`)
- **Hooks:** `camelCase` with `use` prefix (e.g., `useAuth.ts`)
- **SCSS:** `PascalCase.module.scss` matching component name
- **Constants:** `UPPER_SNAKE_CASE`
- **Interfaces/Types:** `PascalCase` with `I` prefix for interfaces (e.g., `IUserData`)
