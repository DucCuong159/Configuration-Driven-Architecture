---
description: "Code review checklist — Toggle when reviewing code"
globs: 
alwaysApply: false
---

# Code Review Checklist

## Severity Levels
- 🔴 **Blocker** — Must fix before merge (security, crash, data loss)
- 🟠 **Major** — Should fix before merge (logic error, performance)
- 🟡 **Minor** — Can fix later (naming, style, best practice)
- ⚪ **Nit** — Optional improvement (personal preference)

## Review Categories

### 1. Architecture Compliance 🏗️
- [ ] Respects Clean Architecture layer boundaries
- [ ] No forbidden dependencies (see `03-architecture.md`)
- [ ] New code placed in correct layer
- [ ] No business logic in presentation layer
- [ ] No API calls directly in components

### 2. TypeScript Quality 📝
- [ ] No `any` types
- [ ] Proper interfaces/types defined
- [ ] Explicit return types on public functions
- [ ] No unnecessary type assertions (`as`)
- [ ] Enums/constants instead of magic values

### 3. Security 🔒
- [ ] No hardcoded secrets, tokens, or credentials
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Input validation present
- [ ] No `eval()` or `Function()` constructor
- [ ] Sensitive data not logged

### 4. Performance ⚡
- [ ] No unnecessary re-renders (check deps arrays)
- [ ] Expensive computations use `useMemo`
- [ ] Event handlers use `useCallback` when passed as props
- [ ] Large lists use virtualization if applicable
- [ ] No N+1 API calls

### 5. Error Handling 🛡️
- [ ] API errors handled gracefully
- [ ] User-facing error messages are helpful
- [ ] Loading states present
- [ ] Empty states handled
- [ ] Network failure scenarios covered

### 6. Naming & Readability 📖
- [ ] Variable/function names are descriptive
- [ ] Follows naming conventions (see `02-coding-standards.md`)
- [ ] Functions are focused (single responsibility)
- [ ] No overly complex logic (cognitive complexity)
- [ ] Comments explain "why", not "what"

### 7. Testing ✅
- [ ] New code has corresponding tests
- [ ] Tests cover happy path and error cases
- [ ] Test names describe behavior clearly
- [ ] No test implementation details (testing behavior)
- [ ] Mock cleanup in `beforeEach`/`afterEach`

### 8. Internationalization 🌍
- [ ] No hardcoded user-facing strings
- [ ] Translation keys follow naming convention
- [ ] Date/number formatting uses locale

### 9. Git Hygiene 🧹
- [ ] Commit messages follow Conventional Commits
- [ ] Each commit is atomic and focused
- [ ] No unrelated changes mixed in
- [ ] No debug code (`console.log`, commented code)
- [ ] No large files (images, data dumps)

## Review Comment Template
```
[SEVERITY] Category: Description

Example:
[🟠 Major] Security: User input not sanitized before rendering.
Consider using DOMPurify to sanitize HTML content.

[🟡 Minor] Naming: `data` is too generic.
Rename to `userData` or `userResponse` for clarity.
```
