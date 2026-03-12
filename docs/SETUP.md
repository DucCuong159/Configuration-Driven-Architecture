# Development Setup Guide

## Prerequisites

- Node.js 18+ and npm 9+
- Git

## Installation

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
```

## Environment Configuration

### Backend

```bash
cp .env.example .env
# Edit .env with your settings
```

Default ports:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Running Development Servers

### Start Backend

```bash
cd backend
npm run dev
# Server starts on http://localhost:3001
```

### Start Frontend

```bash
cd frontend
npm run dev
# App opens on http://localhost:5173
```

## Available Scripts

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + Vite build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with ts-node |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled JS |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/config/asset-types` | All asset type configs |
| GET | `/api/config/input-formats` | Dynamic input formats |
| GET | `/api/assets` | List assets |
| POST | `/api/assets` | Create asset |
| PUT | `/api/assets/:id/publish` | Publish asset |
| GET | `/api/activities` | List activities |
| POST | `/api/activities` | Create activity |
| POST | `/api/activities/:id/submit` | Submit activity |
| GET | `/api/reviews` | List reviews |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id/steps/:num` | Update review step |

## Troubleshooting

**npm install fails**: Try `npm install --legacy-peer-deps`

**CORS errors**: Ensure backend is running on port 3001

**Form not rendering**: Check that asset type configs are properly exported in `config/assetTypes/index.ts`
