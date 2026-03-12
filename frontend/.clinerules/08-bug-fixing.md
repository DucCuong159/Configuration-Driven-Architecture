---
description: "Bug fixing workflow — Toggle when fixing bugs"
globs: 
alwaysApply: false
---

# Bug Fixing Workflow

## Step 1: Reproduce
- [ ] Understand the bug report (steps, expected vs actual)
- [ ] Reproduce the bug locally
- [ ] Identify the exact conditions that trigger it
- [ ] Note the browser/environment details

## Step 2: Root Cause Analysis
- [ ] Read error messages and stack traces carefully
- [ ] Use browser DevTools (Console, Network, React DevTools)
- [ ] Add temporary `console.log` for debugging (remove before commit)
- [ ] Trace data flow: Component → Hook → Redux → API
- [ ] Check recent changes that might have caused it (`git log`, `git blame`)
- [ ] Document the root cause

## Step 3: Fix
- [ ] Make **minimal changes** — only fix the bug, nothing else
- [ ] Follow existing code patterns
- [ ] Handle edge cases related to the bug
- [ ] Do NOT refactor unrelated code in the same PR

## Step 4: Regression Test
- [ ] Write a test that **fails before** the fix and **passes after**
- [ ] Run full test suite: `yarn test`
- [ ] Test related features manually for regressions
- [ ] Test in different browsers if UI-related

## Step 5: Documentation
- [ ] Write clear commit message: `fix(scope): description (#issue)`
- [ ] Add inline comment if the fix is non-obvious
- [ ] Update bug ticket with root cause and solution

## Commit Message Format
```
fix(user-profile): prevent crash when user data is null (#JIRA-456)

Root cause: UserProfile component did not handle null response from API
when user account was deleted. Added null check and redirect to home page.
```

## Common Bug Patterns in This Project

### Redux State Issues
- Mutating state directly instead of returning new state
- Missing state reset on component unmount
- Stale selectors returning cached data

### React Router v5
- Missing `exact` prop causing wrong route match
- Using `useHistory` outside `<Router>` context
- Not handling route change side effects cleanup

### Axios/API
- Not cancelling requests on component unmount
- Missing error handling for specific HTTP status codes
- Race conditions with concurrent API calls

### TypeScript
- Runtime errors from incorrect type assertions (`as`)
- Optional chaining (`?.`) hiding real null reference bugs
- Missing exhaustive checks in switch statements
