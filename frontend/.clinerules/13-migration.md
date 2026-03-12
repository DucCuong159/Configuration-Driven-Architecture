---
description: "Migration and upgrade workflow — Toggle when migrating dependencies"
globs: 
alwaysApply: false
---

# Migration & Upgrade Workflow

## Webpack 4 → 5 Migration

### Pre-Migration Checklist
- [ ] Audit current Webpack 4 config
- [ ] List all custom loaders and plugins
- [ ] Check compatibility of all dependencies with Webpack 5
- [ ] Create migration branch: `feature/webpack-5-migration`
- [ ] Document current build performance (baseline)

### Migration Steps
1. **Update webpack packages**
   ```bash
   yarn add -D webpack@5 webpack-cli@4 webpack-dev-server@4
   ```

2. **Update loaders**
   - `file-loader` / `url-loader` → Use asset modules
   - `raw-loader` → `asset/source`
   - Check `sass-loader`, `css-loader`, `ts-loader` compatibility

3. **Update configuration**
   - Remove `node` polyfills (not auto-included in Webpack 5)
   - Add `resolve.fallback` for Node.js polyfills if needed
   - Update `devtool` setting
   - Enable persistent caching

4. **Test thoroughly**
   - Build succeeds without errors
   - All features work in browser
   - Bundle size comparison
   - Build time comparison

### Rollback Plan
- Keep Webpack 4 config in a separate branch
- Tag the last working Webpack 4 build
- Document the rollback command

## General Dependency Upgrade Strategy

### Upgrade Types
| Type | Risk | Example |
|------|------|---------|
| Patch (x.x.1) | 🟢 Low | Bug fixes only |
| Minor (x.1.0) | 🟡 Medium | New features, backward-compatible |
| Major (1.0.0) | 🔴 High | Breaking changes possible |

### Upgrade Process
1. **Check changelogs** — Read CHANGELOG/release notes
2. **Check breaking changes** — Especially for major upgrades
3. **Upgrade one package at a time** — Never bulk upgrade
4. **Run tests** — `yarn test` after each upgrade
5. **Build** — `yarn build` to verify
6. **Test manually** — Critical user flows

### High-Risk Packages (Handle with Care)
- `react`, `react-dom` — Core framework
- `react-router-dom` — Routing (v5 → v6 is breaking)
- `webpack` — Build system
- `@reduxjs/toolkit` — State management
- `@mui/material` — UI library

### Commit Format for Upgrades
```
chore(deps): upgrade [package-name] from v[old] to v[new]

Breaking changes: [list if any]
Migration steps: [list if needed]
```

## CRA Eject Considerations
- **Do NOT eject** unless absolutely necessary
- Use `craco` or `react-app-rewired` for config overrides
- Document all overrides in project README
