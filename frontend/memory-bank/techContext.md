# Tech Context

## Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React (CRA) | 18.2 |
| Language | TypeScript | Strict mode |
| State | Redux Toolkit | Latest |
| Styling | SCSS Modules | — |
| Routing | React Router | 5.3.4 |
| UI | MUI + PrimeReact | Latest |
| HTTP | Axios | Latest |
| Testing | Jest + RTL | Latest |
| Bundler | Webpack | 4 (migrating to 5) |
| Linting | ESLint + Prettier | Latest |

## Development Setup
- **Node.js**: Check `.nvmrc` or `package.json` engines
- **Package Manager**: yarn
- **IDE**: VS Code with recommended extensions
- **AI Assistant**: Cline with `.clinerules/`

## Key Commands
```bash
yarn start        # Dev server
yarn build        # Production build
yarn test         # Run tests
yarn lint         # Lint check
yarn lint:fix     # Auto-fix lint issues
yarn format       # Prettier format
```

## Key Configuration Files
- `tsconfig.json` — TypeScript (strict mode, absolute imports)
- `.eslintrc.json` — ESLint rules
- `.prettierrc` — Prettier formatting
- `.editorconfig` — Editor settings
- `.env.local` — Environment variables (gitignored)

## Important Constraints
- **React Router v5** — Not v6 (different API: `Switch` not `Routes`)
- **No Tailwind** — SCSS only
- **No CSS-in-JS** — SCSS modules
- **Webpack 4** — Planning migration to v5
