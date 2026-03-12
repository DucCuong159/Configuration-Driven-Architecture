---
description: "Git conventions and branching strategy — Always active"
globs: 
alwaysApply: true
---

# Git Conventions

## Conventional Commits

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
| Type | Usage | Example |
|------|-------|---------|
| `feat` | New feature | `feat(user): add profile avatar upload` |
| `fix` | Bug fix | `fix(auth): prevent token refresh loop` |
| `refactor` | Code change (no feature/fix) | `refactor(api): extract error handler` |
| `style` | Formatting only | `style(lint): fix ESLint warnings` |
| `docs` | Documentation | `docs(readme): update setup instructions` |
| `test` | Add/update tests | `test(user): add UserService unit tests` |
| `chore` | Maintenance | `chore(deps): upgrade axios to v1.6` |
| `perf` | Performance improvement | `perf(list): add virtualization for large lists` |
| `build` | Build system changes | `build(webpack): configure code splitting` |
| `ci` | CI config changes | `ci(github): add lint check workflow` |

### Rules
- Subject line: **max 72 characters**
- Use **imperative mood**: "add feature" not "added feature"
- Do NOT end subject with period
- Body: explain **why**, not what
- Reference JIRA ticket in footer: `Refs: JIRA-123`

### Breaking Changes
```
feat(api)!: change user endpoint response format

BREAKING CHANGE: The /api/users endpoint now returns paginated results.
Use response.data.items instead of response.data.
```

## Branch Strategy

### Branch Naming
```
feature/JIRA-123-short-description
bugfix/JIRA-456-fix-login-crash
hotfix/JIRA-789-security-patch
release/v1.2.0
```

### Branch Flow
```
main (production)
  └── develop (integration)
        ├── feature/JIRA-123-user-profile
        ├── feature/JIRA-456-dashboard
        └── bugfix/JIRA-789-login-fix
```

### Rules
- **main** — Production-ready, protected, no direct pushes
- **develop** — Integration branch, merge features here
- **feature/** — New features, branch from `develop`
- **bugfix/** — Bug fixes, branch from `develop`
- **hotfix/** — Urgent production fixes, branch from `main`
- **release/** — Release prep, branch from `develop`

## Pull Request (PR) Process

### PR Title
Same format as commit message: `type(scope): description`

### PR Template
```markdown
## Description
[What does this PR do?]

## Related Tickets
- JIRA-123

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation

## Checklist
- [ ] Tests added/updated
- [ ] No lint errors
- [ ] No TypeScript errors
- [ ] Self-reviewed code
- [ ] Documentation updated
```

### Merge Strategy
- **Squash and merge** for feature branches → clean history
- **Merge commit** for release branches → preserve history
- **Rebase** for small fixes → linear history
- Delete branch after merge

## Tags
- Use semantic versioning: `v1.2.3`
- Tag releases on `main` branch only
