# System Patterns

## Architecture
- **Clean Architecture**: Domain → Application → Infrastructure → Presentation
- **Unidirectional data flow**: Component → Action → Reducer → State → Component

## Key Design Patterns

### Repository Pattern
- Domain defines interfaces (`IUserRepository`)
- Infrastructure implements them (`UserRepository`)
- Application layer uses interfaces (dependency inversion)

### Service Pattern
- Business logic lives in Application layer services
- Services orchestrate repository calls and transformations
- DTOs for data transfer between layers

### Redux Toolkit State Management
- One slice per feature domain
- `createAsyncThunk` for API calls
- `createSelector` for memoized derived state
- Typed hooks (`useAppDispatch`, `useAppSelector`)

## Component Patterns

### Functional Components
- All components are functional with hooks
- `React.memo` for pure display components
- Custom hooks for reusable logic

### File Structure
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.scss
├── ComponentName.test.tsx
└── index.ts
```

### Styling
- SCSS Modules for component-level styles
- Global variables in `src/styles/_variables.scss`
- MUI for complex UI components (buttons, dialogs, tables)
- PrimeReact TreeTable for tree-structured data
