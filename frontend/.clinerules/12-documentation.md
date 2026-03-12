---
description: "Documentation standards — Toggle when writing documentation"
globs: 
alwaysApply: false
---

# Documentation Standards

## JSDoc Comments

### When to Write JSDoc
- All public functions and methods
- All exported interfaces and types
- Complex utility functions
- Non-obvious business logic

### Format
```typescript
/**
 * Fetches user data by ID and transforms to DTO.
 * Returns null if user not found (404).
 *
 * @param id - Unique user identifier
 * @param options - Optional fetch configuration
 * @returns User DTO or null if not found
 * @throws {ApiError} When server returns 5xx
 *
 * @example
 * const user = await getUserById('abc-123');
 * if (user) {
 *   console.log(user.name);
 * }
 */
async function getUserById(
  id: string,
  options?: IFetchOptions
): Promise<IUserDto | null> {
  // implementation
}
```

### Interface JSDoc
```typescript
/**
 * Represents a user in the system.
 * Used across presentation and application layers.
 */
interface IUserData {
  /** Unique identifier (UUID format) */
  id: string;
  /** Display name, max 100 characters */
  name: string;
  /** Email address, must be valid format */
  email: string;
  /** Account creation timestamp (ISO 8601) */
  createdAt: string;
}
```

## Inline Comments

### ✅ DO — Explain "Why"
```typescript
// Skip validation for admin users as per business rule BR-042
if (user.role === 'admin') return true;

// Using setTimeout to wait for animation to complete
// before removing DOM element (MUI transition: 300ms)
setTimeout(() => removeElement(), 350);
```

### ❌ DON'T — Explain "What"
```typescript
// Get user name  ← obvious from code
const userName = user.name;

// Loop through users  ← obvious from code
users.forEach(user => { ... });
```

## README Updates
Update README.md when:
- New environment variables added
- New scripts added to `package.json`
- Setup steps change
- Dependencies with special setup added

## Confluence Page Structure
```
Project Name/
├── Architecture Overview
├── Setup Guide
├── API Documentation/
│   ├── User API
│   └── Settings API
├── Design Documents/
│   ├── [Feature] Detail Design
│   └── [Feature] Sequence Diagrams
├── Deployment Guide
└── Troubleshooting
```

## Changelog
Maintain `CHANGELOG.md` in the root:

```markdown
# Changelog

## [1.2.0] - 2025-01-15
### Added
- User profile page with avatar upload
- Export to CSV functionality

### Changed
- Updated MUI from v5.14 to v5.15

### Fixed
- Fix crash when user data is null (#456)
```
