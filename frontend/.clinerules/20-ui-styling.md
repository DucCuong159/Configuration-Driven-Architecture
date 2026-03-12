---
description: "UI styling rules with SCSS and MUI — Active when working on components, pages, or SCSS files"
globs: "src/components/**,src/pages/**,**/*.scss"
alwaysApply: false
---

# UI & Styling Rules

## SCSS Module Pattern

### File Naming
- Component styles: `ComponentName.module.scss`
- Global styles: `src/styles/global.scss`
- Variables: `src/styles/_variables.scss`
- Mixins: `src/styles/_mixins.scss`

### Usage
```typescript
import styles from './UserProfile.module.scss';

<div className={styles.container}>
  <h1 className={styles.title}>Profile</h1>
</div>
```

### Multiple Classes
```typescript
import clsx from 'clsx';

<div className={clsx(styles.card, {
  [styles.active]: isActive,
  [styles.disabled]: isDisabled,
})}>
```

## Design Tokens (Variables)

```scss
// src/styles/_variables.scss

// Colors — Samsung Blue palette
$primary: #1428A0;
$primary-light: #4B5CD6;
$primary-dark: #0D1B6E;
$secondary: #00A4B4;
$error: #D32F2F;
$warning: #FFA000;
$success: #388E3C;
$info: #1976D2;

// Neutral
$gray-50: #FAFAFA;
$gray-100: #F5F5F5;
$gray-200: #EEEEEE;
$gray-300: #E0E0E0;
$gray-400: #BDBDBD;
$gray-500: #9E9E9E;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;

// Text
$text-primary: $gray-900;
$text-secondary: $gray-600;
$text-disabled: $gray-400;

// Background
$bg-primary: #FFFFFF;
$bg-secondary: $gray-50;
$bg-elevated: #FFFFFF;

// Spacing (8px grid)
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-xxl: 48px;

// Typography
$font-family: 'SamsungOne', 'Roboto', sans-serif;
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-md: 16px;
$font-size-lg: 20px;
$font-size-xl: 24px;
$font-size-xxl: 32px;

// Border Radius
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-full: 50%;

// Shadows
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

// Breakpoints
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1400px;

// Z-index
$z-dropdown: 100;
$z-sticky: 200;
$z-modal-backdrop: 300;
$z-modal: 400;
$z-tooltip: 500;
$z-toast: 600;
```

## Mixins

```scss
// src/styles/_mixins.scss

// Responsive breakpoints
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' { @media (min-width: $breakpoint-sm) { @content; } }
  @if $breakpoint == 'md' { @media (min-width: $breakpoint-md) { @content; } }
  @if $breakpoint == 'lg' { @media (min-width: $breakpoint-lg) { @content; } }
  @if $breakpoint == 'xl' { @media (min-width: $breakpoint-xl) { @content; } }
}

// Flex center
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Truncate text
@mixin text-truncate($lines: 1) {
  @if $lines == 1 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

## MUI Theme Customization

```typescript
// src/styles/muiTheme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#1428A0' },
    secondary: { main: '#00A4B4' },
    error: { main: '#D32F2F' },
  },
  typography: {
    fontFamily: "'SamsungOne', 'Roboto', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // No uppercase
          borderRadius: 8,
        },
      },
    },
  },
});
```

## Rules
- **SCSS Modules only** — Never use global CSS for components
- **Use variables** — Never hardcode colors, spacing, or font sizes
- **Mobile-first** — Write base styles for mobile, use `@include respond-to` for larger
- **8px grid** — All spacing should be multiples of 8px
- **No `!important`** — Fix specificity instead
- **BEM-like naming** in SCSS modules — `.container`, `.container__header`, `.container--active`
- **MUI + SCSS** — Use MUI for behavior, SCSS for custom styling
