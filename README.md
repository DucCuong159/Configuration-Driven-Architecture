# CDA Asset Management System

Configuration-Driven Architecture (CDA) for managing assets: Models, Datasets, Agents, Services, Software Components, Apps, and Products.

## Key Features

- **Zero-code asset management**: Add new asset types with JSON config only
- **Config-driven forms**: RJSF + Material-UI renders forms from JSON configuration
- **Field dependencies**: Show/hide/enable/disable fields based on other field values
- **Dynamic options**: API-driven dropdown population
- **Custom widgets**: AssetRelation, AssetUrl, DateRange, Tags, Switch
- **Multi-step review**: Configurable review workflow with approve/reject/feedback
- **Asset Library**: Browse, search, and filter published assets

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Material-UI |
| Forms | RJSF (@rjsf/mui) + @rjsf/validator-ajv8 |
| State | Zustand |
| HTTP | Axios + React Query |
| Backend | Express, TypeScript |
| Database | In-memory (PostgreSQL-ready) |

## Quick Start

```bash
# 1. Clone the project
git clone <repo-url> && cd CDA

# 2. Install frontend dependencies
cd frontend && npm install

# 3. Install backend dependencies
cd ../backend && npm install

# 4. Start backend (port 3001)
cd ../backend && npm run dev

# 5. Start frontend (port 5173)
cd ../frontend && npm run dev

# 6. Open http://localhost:5173
```

## Project Structure

```
CDA/
├── cda.md                          # Complete specification
├── frontend/
│   ├── src/
│   │   ├── api/                    # API client + endpoint functions
│   │   ├── components/
│   │   │   ├── AssetForm.tsx       # Core CDA form component
│   │   │   ├── ActivityFlow.tsx    # Activity creation workflow
│   │   │   ├── ReviewPanel.tsx     # Review step management
│   │   │   ├── Layout.tsx          # App shell (sidebar + topbar)
│   │   │   ├── ErrorBoundary.tsx   # Error boundary
│   │   │   └── widgets/           # Custom RJSF widgets
│   │   │       ├── AssetRelationWidget.tsx
│   │   │       ├── AssetUrlWidget.tsx
│   │   │       ├── DateRangeWidget.tsx
│   │   │       ├── TagsWidget.tsx
│   │   │       └── SwitchWidget.tsx
│   │   ├── config/assetTypes/      # JSON config files per asset type
│   │   │   ├── model.config.json
│   │   │   ├── dataset.config.json
│   │   │   └── index.ts
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── pages/                  # Route pages
│   │   ├── stores/                 # Zustand store
│   │   ├── types/                  # TypeScript interfaces
│   │   └── utils/                  # Schema mapper, validators, etc.
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── server.ts               # Express server
│   │   ├── routes/                 # API routes
│   │   ├── middleware/             # Error handling, validation
│   │   └── data/                   # Mock data
│   └── package.json
└── docs/
    ├── ARCHITECTURE.md
    ├── SETUP.md
    └── ADDING_ASSETS.md
```

## Three Main Sections

1. **Asset Activity** (`/activity`) — Create new registrations, sharing, purchase activities
2. **Asset Review** (`/review`) — Multi-step admin review with approve/reject
3. **Asset Library** (`/library`) — Browse published assets with filtering

## Adding a New Asset Type

See [docs/ADDING_ASSETS.md](docs/ADDING_ASSETS.md) for the full guide. Summary:

1. Create `frontend/src/config/assetTypes/newtype.config.json`
2. Import and register in `config/assetTypes/index.ts`
3. Done — no other code changes needed!

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design and data flow
- [Setup Guide](docs/SETUP.md) — Detailed development setup
- [Adding Assets](docs/ADDING_ASSETS.md) — Step-by-step guide for new asset types
