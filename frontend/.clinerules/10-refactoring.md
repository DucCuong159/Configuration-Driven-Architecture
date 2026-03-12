---
description: "Refactoring guidelines — Toggle when refactoring code"
globs: 
alwaysApply: false
---

# Refactoring Guidelines

## Golden Rules
1. **Never refactor and add features in the same PR**
2. **Behavior must be preserved** — no functional changes
3. **Tests must pass before AND after** refactoring
4. **Incremental changes** — small commits, easy to review

## Code Smells to Identify

### High Priority
| Smell | Indicator | Action |
|-------|-----------|--------|
| Long function | > 30 lines | Extract helper functions |
| Large component | > 150 lines | Split into sub-components |
| Deep nesting | > 3 levels | Use early returns, extract |
| Duplicate code | Same logic in 2+ places | Extract shared utility |
| God class/module | File does too many things | Split by responsibility |

### Medium Priority
| Smell | Indicator | Action |
|-------|-----------|--------|
| Magic numbers | Unexplained numeric values | Extract to named constants |
| Long parameter list | > 3 parameters | Use options object |
| Feature envy | Function uses other module's data heavily | Move to correct module |
| Primitive obsession | Using primitives instead of types | Create value objects |

## Safe Refactoring Patterns

### Extract Component
```typescript
// Before — large component
const UserPage = () => {
  return (
    <div>
      {/* 50 lines of header */}
      {/* 80 lines of form */}
      {/* 40 lines of footer */}
    </div>
  );
};

// After — extracted sub-components
const UserPage = () => {
  return (
    <div>
      <UserPageHeader />
      <UserForm />
      <UserPageFooter />
    </div>
  );
};
```

### Extract Custom Hook
```typescript
// Before — logic mixed with UI
const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetchUsers().then(setUsers).catch(setError).finally(() => setLoading(false));
  }, []);
  
  // ... render
};

// After — logic extracted to hook
const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetchUsers().then(setUsers).catch(setError).finally(() => setLoading(false));
  }, []);
  
  return { users, loading, error };
};

const UserPage = () => {
  const { users, loading, error } = useUsers();
  // ... render
};
```

### Replace Conditional with Mapping
```typescript
// Before
const getStatusLabel = (status: string) => {
  if (status === 'active') return 'Active';
  if (status === 'inactive') return 'Inactive';
  if (status === 'pending') return 'Pending Review';
  return 'Unknown';
};

// After
const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending Review',
};

const getStatusLabel = (status: string): string =>
  STATUS_LABELS[status] ?? 'Unknown';
```

## Checklist Before Refactoring PR
- [ ] All existing tests pass
- [ ] No behavior changes (only structural improvements)
- [ ] Each commit is a single refactoring step
- [ ] Commit messages: `refactor(scope): description`
- [ ] PR description explains WHY the refactoring is needed
