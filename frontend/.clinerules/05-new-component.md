---
description: "Component creation standards — Active when working in components or pages"
globs: "src/components/**,src/pages/**"
alwaysApply: false
---

# Component Creation Standards

## File Structure

Every component should follow this structure:

```
ComponentName/
├── ComponentName.tsx           # Main component logic
├── ComponentName.module.scss   # Scoped styles
├── ComponentName.test.tsx      # Unit tests
├── index.ts                    # Barrel export
└── types.ts                    # (optional) Component-specific types
```

## Component Template

```typescript
import React, { memo } from 'react';
import styles from './ComponentName.module.scss';

interface IComponentNameProps {
  /** Description of the prop */
  title: string;
  /** Optional callback */
  onClick?: (id: string) => void;
  /** Children elements */
  children?: React.ReactNode;
}

const ComponentName: React.FC<IComponentNameProps> = ({
  title,
  onClick,
  children,
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  );
};

export default memo(ComponentName);
```

## Rules

### Props
- Define props with `interface` using `I` prefix
- Add JSDoc comments for each prop
- Use `React.FC<IProps>` for typing
- Destructure props in function signature
- Keep props under 7 — split component if more

### Component Design
- **Functional components only** — No class components
- Use `React.memo()` for components that receive stable props
- One component per file
- Keep component under **150 lines** — split if larger
- Extract complex logic into custom hooks

### MUI Integration
```typescript
import { Button, TextField, Box } from '@mui/material';

// ✅ Good — Use MUI components with SCSS overrides
<Button className={styles.submitButton} variant="contained">
  Submit
</Button>

// ❌ Bad — Inline sx prop for complex styles
<Button sx={{ backgroundColor: '#1976d2', padding: '12px 24px', ... }}>
  Submit
</Button>
```

### SCSS Module Pattern
```scss
// ComponentName.module.scss
.container {
  display: flex;
  flex-direction: column;
  padding: $spacing-md;
}

.title {
  font-size: $font-size-lg;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}
```

### Barrel Export
```typescript
// index.ts
export { default } from './ComponentName';
export type { IComponentNameProps } from './ComponentName';
```

### Event Handlers
- Prefix with `handle` inside component: `handleClick`, `handleSubmit`
- Prefix with `on` for prop callbacks: `onClick`, `onSubmit`

```typescript
// ✅ Good
const handleButtonClick = () => {
  onSubmit?.(formData);
};

// ❌ Bad
const click = () => { ... };
```
