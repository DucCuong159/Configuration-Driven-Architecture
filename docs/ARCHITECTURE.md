# CDA Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │  Pages   │  │  Store   │  │  Config System        │   │
│  │ Activity │  │ Zustand  │  │ JSON → RJSF Schema   │   │
│  │ Review   │◄─┤          ├──┤ Field Dependencies    │   │
│  │ Library  │  │  State   │  │ Custom Widgets        │   │
│  └──────────┘  └────┬─────┘  └──────────────────────┘   │
│                     │                                     │
│              ┌──────┴──────┐                              │
│              │  API Client │                              │
│              │  Axios      │                              │
│              └──────┬──────┘                              │
└─────────────────────┼────────────────────────────────────┘
                      │ HTTP REST
┌─────────────────────┼────────────────────────────────────┐
│              ┌──────┴──────┐     Backend (Express)       │
│              │   Routes    │                              │
│              │ /assets     │                              │
│              │ /activities │                              │
│              │ /reviews    │                              │
│              │ /config     │                              │
│              └──────┬──────┘                              │
│              ┌──────┴──────┐                              │
│              │  Data Store │  (In-memory / DB)            │
│              └─────────────┘                              │
└──────────────────────────────────────────────────────────┘
```

## Config-Driven Flow

```
JSON Config File
    │
    ▼
schemaMapper.ts ──────► RJSF JSON Schema + UI Schema
    │
    ▼
fieldDependencyResolver.ts ──► Field States (show/hide/enable/disable)
    │
    ▼
AssetForm.tsx ──────────────► Rendered Material-UI Form
    │
    ▼
Custom Widgets ────────────► AssetRelation, AssetUrl, DateRange, Tags, Switch
```

## Config File Structure

Each asset type config contains:
- **type**: Asset type identifier
- **sections**: Form layout sections with ordering
- **fields**: Field definitions with type, validations, dependencies
- **reviewSteps**: Multi-step review workflow configuration
- **activities**: Activity types with required/visible fields

## Field Dependency System

Dependencies are defined per-field in JSON config:

```json
{
  "dependencies": [{
    "sourceField": "is_pretrained",
    "condition": "equals",
    "value": true,
    "action": "show"
  }]
}
```

Supported conditions: `equals`, `not_equals`, `contains`, `not_empty`, `empty`, `in`, `not_in`
Supported actions: `show`, `hide`, `enable`, `disable`, `set_value`, `fetch_options`

## Data Flow: Activity → Review → Library

1. **Create Activity**: User fills config-driven form → creates Activity + Asset (draft)
2. **Model Card Review**: Admin reviews each step → approve/reject with feedback
3. **Publish**: After all review steps approved → asset published to Library
4. **Browse**: Published assets visible in Asset Library with search/filter
