---
description: "New feature implementation workflow — Toggle when implementing features"
globs: 
alwaysApply: false
---

# New Feature Workflow

## Phase 1: Analysis
- [ ] Read and understand the requirements/user story
- [ ] Identify affected Clean Architecture layers
- [ ] List existing files that need modification
- [ ] Identify new files to create
- [ ] Check for similar existing patterns in codebase

## Phase 2: Design
- [ ] Define TypeScript interfaces/types for new data
- [ ] Plan the data flow (UI → Store → API → Server)
- [ ] Identify reusable components
- [ ] Plan state management approach (local vs Redux)
- [ ] Consider error handling and edge cases

## Phase 3: Implementation Order
Follow this order to respect dependency rules:

1. **Domain Layer** — Entities, interfaces, value objects
2. **Application Layer** — Services, DTOs, mappers
3. **Infrastructure Layer** — API clients, repositories
4. **Store** — Redux slices, selectors, thunks
5. **Presentation Layer** — Components, pages, hooks
6. **Styles** — SCSS modules
7. **Routes** — Add new routes if needed

## Phase 4: File Scaffolding

### For a feature named `[FeatureName]`:

```
src/
├── domain/
│   ├── entities/[FeatureName].ts          # Entity interface
│   └── repositories/I[FeatureName]Repository.ts  # Repository contract
├── application/
│   ├── services/[FeatureName]Service.ts   # Business logic
│   └── dtos/[FeatureName]Dto.ts           # API ↔ Entity mapping
├── infrastructure/
│   └── repositories/[FeatureName]Repository.ts   # API implementation
├── store/
│   └── slices/[featureName]Slice.ts       # Redux slice
├── presentation/
│   ├── pages/[FeatureName]Page/
│   │   ├── [FeatureName]Page.tsx
│   │   ├── [FeatureName]Page.module.scss
│   │   └── index.ts
│   └── components/[FeatureName]/
│       ├── [FeatureName]Component.tsx
│       ├── [FeatureName]Component.module.scss
│       └── index.ts
```

## Phase 5: Testing
- [ ] Write unit tests for service/business logic
- [ ] Write unit tests for Redux slice (reducers, selectors)
- [ ] Write component tests for UI
- [ ] Test error scenarios and edge cases
- [ ] Verify no regression in existing features

## Phase 6: Documentation
- [ ] Add JSDoc to public functions and interfaces
- [ ] Update README if architecture changes
- [ ] Add inline comments for complex logic only
- [ ] Create/update Confluence page if needed

## Checklist Before PR
- [ ] All tests pass (`yarn test`)
- [ ] No lint errors (`yarn lint`)
- [ ] No TypeScript errors (`yarn tsc --noEmit`)
- [ ] Code follows naming conventions
- [ ] No hardcoded strings (use i18n)
- [ ] No `console.log` in code
- [ ] No `any` types
- [ ] Commit messages follow Conventional Commits
