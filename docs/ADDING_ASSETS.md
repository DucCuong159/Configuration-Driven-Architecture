# Adding New Asset Types

This guide shows how to add a new asset type with **zero frontend code changes**.

## Step 1: Create the Config File

Create `frontend/src/config/assetTypes/agent.config.json`:

```json
{
  "type": "agent",
  "label": "AI Agent",
  "icon": "SmartToy",
  "description": "Autonomous AI agents with specific capabilities",
  "sections": [
    {
      "key": "basic",
      "title": "Basic Information",
      "order": 1,
      "collapsible": true,
      "defaultCollapsed": false
    }
  ],
  "fields": [
    {
      "key": "name",
      "label": "Agent Name",
      "type": "text",
      "required": true,
      "section": "basic",
      "order": 1,
      "colSpan": 6,
      "validations": [
        { "type": "required", "message": "Agent name is required" }
      ]
    },
    {
      "key": "description",
      "label": "Description",
      "type": "textarea",
      "section": "basic",
      "order": 2,
      "colSpan": 12
    }
  ],
  "reviewSteps": [
    {
      "stepNumber": 1,
      "title": "Review",
      "description": "Review agent details",
      "reviewerRole": "admin",
      "fields": ["name", "description"],
      "requiredFields": ["name"]
    }
  ],
  "activities": [
    {
      "type": "registration",
      "label": "Agent Registration",
      "description": "Register a new AI agent",
      "requiredFields": ["name"]
    }
  ]
}
```

## Step 2: Register in Index

Edit `frontend/src/config/assetTypes/index.ts`:

```diff
 import modelConfig from './model.config.json';
 import datasetConfig from './dataset.config.json';
+import agentConfig from './agent.config.json';

 export const assetTypeConfigs: Record<string, AssetTypeConfig> = {
   model: modelConfig as unknown as AssetTypeConfig,
   dataset: datasetConfig as unknown as AssetTypeConfig,
+  agent: agentConfig as unknown as AssetTypeConfig,
 };
```

Also update `configLoader.ts` the same way.

## Step 3: Update Type (Optional)

Add to `AssetTypeName` in `types/index.ts` if not already included:

```typescript
export type AssetTypeName = 'model' | 'dataset' | 'agent' | ...;
```

## That's It!

The frontend will automatically:
- Show the new asset type in Activity page
- Render the form with configured fields
- Handle field dependencies
- Create review workflow
- Display in Asset Library after publishing

## Field Type Reference

| Type | Description | Extra Options |
|------|-------------|---------------|
| `text` | Text input | `placeholder`, `validations` |
| `textarea` | Multi-line input | `placeholder` |
| `number` | Numeric input | `min`, `max` |
| `email` | Email input | Built-in validation |
| `date` | Date picker | — |
| `date-range` | Start/end dates | Value: `{startDate, endDate}` |
| `dropdown` | Select | `options: [{label, value}]` |
| `radio` | Radio group | `options: [{label, value}]` |
| `checkbox` | Boolean checkbox | `defaultValue` |
| `switch` | Toggle switch | `defaultValue` |
| `tags` | Tag chips | Array of strings |
| `asset_relation` | Link to other assets | `relatedAssetType`, `multiple` |
| `asset_url` | URL + internal checkbox | `showInternalCheckbox` |

## Dependency Rules

```json
{
  "dependencies": [{
    "sourceField": "field_key",
    "condition": "equals|not_equals|contains|not_empty|empty|in|not_in",
    "value": "match_value",
    "action": "show|hide|enable|disable|set_value|fetch_options"
  }]
}
```
