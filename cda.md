# CDA Asset Management System - Complete Implementation Prompt

## PROJECT CONTEXT

I am building a Configuration-Driven Architecture (CDA) Asset Management System with 20+ years of architecture experience.

The system manages multiple asset types: Dataset, Model, Agent, Service, Software Component, App, Product.

Three main sections:

1. Asset Activity (registration, sharing, purchase, etc. - focus on registration)
2. Asset Review (multi-step model card review and approval)
3. Asset Library (public listing of published assets)

## BUSINESS REQUIREMENTS

### Asset Types

Six asset types with 10-20 fields each:

- Standard fields: text, textarea, number, email, date, date-range, dropdown, radio, checkbox, switch
- Extended fields: tags (array of chips), file_upload
- Custom field types:
  1. Asset Relation: search and select other assets (same/different type) into a table
  2. Asset URL: input field with optional checkbox for internal hosting
  3. Dependent Fields: show/hide/enable/disable/set_value based on other field values
  4. Dynamic Fields: API-driven option fetching via `fetch_options` dependency action

### Form Layout

Fields are organized into collapsible sections (Accordion layout):
- Each section has: key, title, description, order, collapsible, defaultCollapsed
- Fields belong to a section and have colSpan (1-12 grid) for responsive layout
- Sections are sorted by `order` and can be collapsed/expanded

### Workflows

1. Activity Creation → Choose asset type → Fill form with configuration
2. Model Card Review → Multi-step admin review process
3. Admin Approval → Verify all required fields
4. Publish to Library → Make asset visible publicly
5. Zero code changes when adding new asset types or fields

## CURRENT STATUS

Project structure already exists with:

- Frontend folder (React + TypeScript + Vite ready)
- Backend folder (Node.js + TypeScript ready)
- Basic folder hierarchy created

## TECHNOLOGY STACK

### Frontend

- React ^18.2.0, TypeScript ^5.3.0 (strict mode)
- RJSF (@rjsf/core, @rjsf/mui, @rjsf/utils, @rjsf/validator-ajv8) ^5.18.0
- Material-UI (@mui/material ^5.15.0, @mui/icons-material, @emotion/react, @emotion/styled)
- State: Zustand ^4.4.0
- HTTP: Axios ^1.6.0, @tanstack/react-query ^5.0.0
- Routing: react-router-dom ^6.20.0
- Validation: AJV8 (via RJSF validator)
- Testing: Jest, React Testing Library
- Build: Vite ^5.0.0

### Backend

- Node.js/Express, TypeScript (strict mode)
- Database: PostgreSQL with TypeORM (or Prisma)
- Validation: AJV8 + custom validators
- API: REST with Swagger/OpenAPI
- Testing: Jest, Supertest

## COMPLETE IMPLEMENTATION REQUEST

Generate comprehensive, production-ready code for a complete CDA system.

### Part 1: Dependencies & Configuration

Generate frontend/package.json with:

- react ^18.2.0, react-dom ^18.2.0
- typescript ^5.3.0, vite ^5.0.0
- @rjsf/core ^5.18.0, @rjsf/mui ^5.18.0, @rjsf/utils ^5.18.0, @rjsf/validator-ajv8 ^5.18.0
- @mui/material ^5.15.0, @mui/icons-material ^5.15.0, @emotion/react, @emotion/styled
- zustand ^4.4.0
- axios ^1.6.0, @tanstack/react-query ^5.0.0
- react-router-dom ^6.20.0
- jest, @testing-library/react (devDependencies)
- prettier, eslint (devDependencies)

Generate backend/package.json with:

- express 4.18.0
- typescript 5.0.0, ts-node 10.9.0
- pg 8.11.0, typeorm 0.3.17
- ajv 8.12.0, ajv-formats 2.2.0
- cors 2.8.5, helmet 7.1.0, dotenv 16.3.1
- axios 1.5.0
- jest 29.7.0, supertest 6.3.3
- prettier 3.0.0, eslint 8.50.0

Generate configuration files:

- frontend/tsconfig.json with strict mode enabled
- backend/tsconfig.json with strict mode enabled
- ESLint configs for both
- Prettier configs for both
- .env.example files

### Part 2: Backend Implementation

Generate backend/src/app.ts:

- Express initialization with middleware
- CORS enabled, helmet security headers
- JSON body parser, request logging
- Error handling middleware
- Health check endpoint
- 404 handler

Generate backend/src/server.ts:

- Server startup on port 3001
- Database connection
- Server listening confirmation

Generate backend/src/config.ts:

- Environment variables configuration
- Database connection string
- API configuration

Generate backend/.env.example:

- Example environment variables

Generate backend/src/routes/assets.ts with endpoints:

- GET /api/assets (list all assets with filters)
- GET /api/assets/:id (get single asset)
- POST /api/assets (create new asset with validation)
- PUT /api/assets/:id (update asset)
- DELETE /api/assets/:id (delete asset)
- GET /api/assets/search (search by name/type)

Each endpoint must include:

- Input validation using AJV
- Proper error handling
- Logging
- TypeScript types
- JSDoc comments
- Correct HTTP status codes

Generate backend/src/routes/config.ts:

- GET /api/config/asset-types (get all asset type configurations)
- GET /api/config/asset-types/:type (get specific asset type config)
- Cache configurations
- Validate schema integrity
- Support hot-reload

Generate backend/src/services/assetService.ts:

- Business logic for asset operations
- Validation logic
- Database interaction
- Error handling

Generate backend/src/services/configService.ts:

- Load configurations from JSON files
- Cache configurations in memory
- Validate configuration schema
- Provide hot-reload capability

Generate backend/src/types/index.ts:

- Asset interface
- Activity interface
- Review interface
- Configuration interfaces
- All TypeScript types

Generate database migration files:

- Create assets table (id, type, name, data JSONB, created_at, updated_at, status)
- Create activities table (id, asset_id, type, status, created_at)
- Create reviews table (id, activity_id, step_number, status, feedback, completed_at)
- Create asset_relations table (id, from_asset_id, to_asset_id, relation_type)
- Proper indexes and foreign keys

Generate backend/src/middleware/errorHandler.ts:

- Global error handling
- Error logging
- Error response formatting

Generate backend/src/middleware/validation.ts:

- AJV schema validation middleware
- Request validation
- Error message formatting

### Part 3: Frontend Integration

Generate frontend/src/api/client.ts:

- Axios instance with baseURL http://localhost:3001
- Request/response interceptors
- Error handling
- Retry logic for failed requests
- Request/response logging in development

Generate frontend/src/api/assets.ts:

- getAssets(): Promise<Asset[]>
- getAsset(id: string): Promise<Asset>
- createAsset(data: AssetCreateInput): Promise<Asset>
- updateAsset(id: string, data: AssetUpdateInput): Promise<Asset>
- deleteAsset(id: string): Promise<void>
- searchAssets(query: string): Promise<Asset[]>

Generate frontend/src/stores/assetStore.ts with Zustand:
State:

- assets: Asset[]
- loading: boolean
- error: string | null
- selectedAssetId: string | null
- filters: { type?: string; status?: string }

Actions:

- fetchAssets(filters?: any): Promise<void>
- createAsset(data: any): Promise<void>
- updateAsset(id: string, data: any): Promise<void>
- deleteAsset(id: string): Promise<void>
- selectAsset(id: string): void
- setFilters(filters: any): void
- resetError(): void
- clearAssets(): void

All actions should:

- Use API client
- Handle errors with proper messages
- Update loading states
- Propagate errors to UI

Generate frontend/src/hooks/useAssets.ts:

- Custom hook wrapping assetStore
- useFetchAssets() → fetch assets
- useCreateAsset() → create asset
- useUpdateAsset() → update asset
- useDeleteAsset() → delete asset
- useSelectedAsset() → get selected asset
- useAssetFilters() → filter assets

Generate frontend/src/hooks/useForm.ts:

- Form state management
- Handle form data changes
- Handle form submission
- Validation error management
- Loading states

Generate frontend/src/hooks/useActivities.ts:

- Activity workflow management
- Create activity
- Get activity details
- Submit activity for review
- Get review steps

Generate frontend/src/types/index.ts:

- Export all asset types
- Export all activity types
- Export all form types
- All TypeScript interfaces

Generate frontend/src/components/AssetForm.tsx:

- Use @rjsf/mui Form component
- Props: config (AssetTypeConfig), activityType?, initialData?, onSubmit, onSaveDraft?, readOnly?
- Generate RJSF schema from config using schemaMapper
- Resolve field states (show/hide/enable/disable) using fieldDependencyResolver
- Apply dynamic options for dependent dropdown fields
- Validate using @rjsf/validator-ajv8
- Show loading state while submitting
- Display error messages with Alert component
- Save draft functionality
- Handle field dependencies generically via config (not hardcoded)
- Support all custom widgets via registry
- Register custom widgets: AssetRelationWidget, AssetUrlWidget, DateRangeWidget, TagsWidget, SwitchWidget

Generate frontend/src/components/AssetLibrary.tsx:

- Display all published assets
- Filter by type
- Search functionality
- Show asset metadata
- Link to asset details
- Sort capabilities

Generate frontend/src/components/ActivityFlow.tsx:

- Show activity creation flow
- Display current step
- Handle navigation between steps
- Show form for current step
- Handle form submission

Generate frontend/src/components/ReviewModal.tsx:

- Display review interface
- Show asset data for review
- Display previous reviews
- Allow adding feedback
- Approve/reject functionality
- Show review history

Generate frontend/src/components/widgets/AssetRelationWidget.tsx:

- Custom RJSF widget for asset relations
- MUI Autocomplete for searching assets
- Filter by relatedAssetType from config (or 'any')
- Support single and multiple selection
- Display selected assets in a Table with Name, Type, Version, Remove action
- API integration for searching (currently mock, should use real API)

Generate frontend/src/components/widgets/AssetUrlWidget.tsx:

- Custom RJSF widget for asset URLs
- URL input field with icon adornment (Cloud/Dns based on isInternal)
- "Internal" checkbox with visual highlight when checked
- Value is object: { url: string, isInternal: boolean }
- showInternalCheckbox option from config

Generate frontend/src/components/widgets/DateRangeWidget.tsx:

- Two date inputs: Start Date, End Date
- Value is object: { startDate: string, endDate: string }

Generate frontend/src/components/widgets/TagsWidget.tsx:

- Input field with Enter to add tags
- Display tags as MUI Chips with delete action
- Value is array of strings

Generate frontend/src/components/widgets/SwitchWidget.tsx:

- MUI Switch with FormControlLabel
- Boolean value toggle

Generate frontend/src/App.tsx:

- Main app component
- Use assetStore for state
- Fetch assets on mount
- Display asset list
- "Create New Asset" button
- Asset form in modal/page
- Error handling
- Loading states
- Success notifications
- Responsive layout using Material-UI

### Part 4: Configuration System

Generate frontend/src/config/assetTypes/model.config.json:
Asset Type: Model (ML/AI Models)

Fields:

- Basic Info:
  - name (string, required, title: "Model Name")
  - description (string, title: "Description")
  - version (string, required)
- Technical Info:
  - framework (dropdown: ["TensorFlow", "PyTorch", "JAX"], required)
  - inputType (dropdown: ["image", "text", "audio", "multimodal"], onChange trigger)
  - inputFormat (dynamically populated based on inputType)
  - trainingDatasets (asset_relation, required, type: "dataset")
- Deployment:
  - modelUrl (asset_url)
  - modelSize (number)
  - inferenceTime (number)

Review Steps:

- Step 1: Basic Information (reviewer: admin)
- Step 2: Technical Details (reviewer: ml_engineer)
- Step 3: Final Approval (reviewer: admin)

Activities:

- registration: required_fields [name, version, framework]
- sharing: required_fields [name]
- purchase: required_fields [name, modelUrl]

Generate frontend/src/config/assetTypes/dataset.config.json:
Asset Type: Dataset

Fields:

- name (string, required)
- description (string)
- format (dropdown: ["CSV", "JSON", "Parquet", "HDF5"])
- size (number)
- rowCount (number)
- columnCount (number)
- sourceUrl (asset_url)
- relatedModels (asset_relation, type: "model")
- tags (array of strings)

Generate frontend/src/config/assetTypes/index.ts:

- Export all asset type configs
- Provide config loader function
- Cache configs
- Support dynamic loading

Generate frontend/src/utils/configLoader.ts:

- Load asset type config from JSON
- Cache loaded configs in memory
- Validate config against schema
- Return typed config object
- Support hot-reload
- Error handling for missing configs

Generate frontend/src/utils/schemaMapper.ts:

- Convert asset config to RJSF schema
- Map field types to appropriate widgets
- Handle field visibility/dependency rules
- Handle field validation rules
- Generate proper JSON Schema format
- Type-safe output

Generate frontend/src/schemas/index.ts:

- Export all RJSF schemas
- Provide schema generation function
- Cache generated schemas

### Part 5: Custom Validators

Generate frontend/src/utils/validators.ts:

Validators (each returns (formData, errors) => errors):

1. urlValidator
   - Validate URL format
   - Support http://, https://, s3://, gs:// protocols

2. emailValidator
   - Check email format
   - Show appropriate error messages

3. versionValidator
   - Validate semver format (e.g., 1.0.0, 1.0.0-beta.1)

4. dateRangeValidator
   - Cross-field: ensure endDate >= startDate

5. assetRelationValidator
   - Validate minimum selections (cardinality)
   - Check array length >= minCount

6. assetUrlValidator
   - Validate URL object { url, isInternal }
   - URL format check on url sub-field

7. composeValidators
   - Compose multiple validators into single customValidate function
   - Chain validators sequentially

Each validator must:

- Accept (formData, errors, fieldKey) parameters
- Return modified errors object
- Include clear error messages
- Have TypeScript types
- Be composable with other validators

Generate frontend/src/utils/fieldDependencyResolver.ts:

- Resolve field visibility/enabled states from config dependencies
- Evaluate conditions: equals, not_equals, contains, not_empty, empty, in, not_in
- Actions: show, hide, enable, disable, set_value, fetch_options
- Apply resolved states to JSON Schema (remove hidden from required, set hidden widget)
- Get fields needing option fetch when a source field changes
- Track field dependencies for efficient re-evaluation

### Part 6: Testing Setup

Generate frontend/jest.config.js:

- TypeScript support (ts-jest preset)
- jsdom test environment
- Setup files
- Module name mapper for paths

Generate frontend/src/setupTests.ts:

- Import testing-library/jest-dom
- Setup global mocks
- Configure test utilities

Generate frontend/src/components/**tests**/AssetForm.test.tsx:

- Test form renders correctly
- Test form validation works
- Test password strength validation
- Test field dependencies
- Test form submission
- Test error handling
- Test custom widgets

Generate backend/jest.config.js:

- TypeScript support
- Node test environment

Generate backend/src/**tests**/assets.test.ts:

- Test GET /api/assets endpoint
- Test POST /api/assets with validation
- Test error handling
- Test 404 responses
- Test asset creation
- Test asset update
- Test asset deletion

All tests must use:

- Proper setup/teardown
- Mocking where needed
- Assertions for expected behavior
- Coverage tracking

### Part 7: Example Data & Seeds

Generate database seed script (backend/seeds/seed.ts):

- Create sample assets (Model, Dataset)
- Create sample activities
- Create sample reviews
- Create sample relationships
- Populate with realistic test data

Generate sample API responses as examples:

- GET /api/assets response
- POST /api/assets request/response
- GET /api/config/asset-types response

### Part 8: Documentation

Generate README.md:

1. Project Overview
   - What the system does
   - Key features
   - Technology stack
   - Architecture diagram

2. Quick Start (30 minutes)
   - Clone project
   - npm install (frontend & backend)
   - Setup .env
   - npm run dev
   - Open browser

3. Project Structure
   - Folder organization
   - Key files explained
   - File purposes

4. API Documentation
   - All endpoints
   - Request/response examples
   - Status codes
   - Error responses

5. Configuration Guide
   - How to add new asset type (5 minutes)
   - Asset type config structure
   - Field type definitions
   - Validator definitions
   - Widget mappings

6. Adding New Assets (Examples)
   - Step 1: Create config JSON
   - Step 2: Add to assetTypes folder
   - Step 3: Restart backend
   - Step 4: Frontend automatically supports new type
   - Complete walkthrough example

7. Custom Validators
   - How to create custom validator
   - How to use in config
   - Example implementations

8. Custom Widgets
   - How to create custom widget
   - How to register in RJSF
   - Example implementations

9. Troubleshooting
   - Common issues and solutions
   - Debug tips
   - Performance optimization

10. Contributing Guidelines
    - Code style
    - Testing requirements
    - PR process

Generate docs/ARCHITECTURE.md:

- System architecture overview
- Component diagram
- Data flow
- Configuration system architecture
- Asset relationship management
- Review workflow

Generate docs/SETUP.md:

- Detailed setup instructions
- Database setup
- Environment configuration
- Running dev servers
- Building for production

Generate docs/ADDING_ASSETS.md:

- Step-by-step guide to add new asset type
- Configuration examples
- Field type reference
- Validator reference
- Widget reference

## IMPLEMENTATION STANDARDS

### Code Quality

- All code must be TypeScript with strict mode
- All functions must have proper types
- No use of `any` type
- ESLint must pass
- Prettier must format all code

### Error Handling

- Try-catch blocks for async operations
- Proper error messages
- Error boundaries in React
- API error handling with proper status codes
- Validation error messages

### Performance

- Memoization with useMemo/useCallback where needed
- Lazy loading of forms
- Code splitting for components
- Bundle optimization
- Configuration caching

### Security

- Input validation on all endpoints
- XSS prevention in form outputs
- CSRF protection
- Secure headers (helmet middleware)
- Sanitized error messages

### Testing

- Minimum 80% code coverage
- Unit tests for utilities
- Integration tests for API
- Component tests for UI
- E2E test examples

### Documentation

- JSDoc comments for all functions
- Inline comments for complex logic
- README for setup
- API documentation
- Configuration guide

## DELIVERABLES

For each component, provide:

1. Complete, production-ready code
2. Full TypeScript types
3. Error handling
4. Logging
5. Comments for complex parts
6. No hardcoded values (use config/env)
7. Ready to copy-paste

## QUALITY REQUIREMENTS

Generate code that:

- ✅ Compiles without errors (TypeScript strict mode)
- ✅ Passes linting (ESLint)
- ✅ Passes formatting (Prettier)
- ✅ Includes tests (Jest)
- ✅ Handles all errors gracefully
- ✅ Works immediately after copy-paste
- ✅ Is production-ready
- ✅ Includes all necessary comments
- ✅ Is fully typed (no any)
- ✅ Supports all features described

## DEPLOYMENT READINESS

After implementation, the system should:

- ✅ Support unlimited asset types (config only)
- ✅ Support custom validators
- ✅ Support custom widgets
- ✅ Handle complex workflows
- ✅ Scale to thousands of assets
- ✅ Deploy to production without code changes
- ✅ Support database migrations
- ✅ Support environment-specific configs
- ✅ Include logging and monitoring hooks
- ✅ Have comprehensive documentation

## FINAL DELIVERABLES CHECKLIST

Frontend:
✅ package.json with all dependencies
✅ tsconfig.json, vite.config.ts
✅ .eslintrc.json, .prettierrc
✅ src/api/client.ts
✅ src/api/assets.ts
✅ src/stores/assetStore.ts (Zustand)
✅ src/hooks/useAssets.ts
✅ src/hooks/useForm.ts
✅ src/hooks/useActivities.ts
✅ src/components/AssetForm.tsx (core CDA form component)
✅ src/components/Layout.tsx (sidebar + top bar)
✅ src/components/ActivityFlow.tsx
✅ src/components/ReviewPanel.tsx
✅ src/components/widgets/AssetRelationWidget.tsx
✅ src/components/widgets/AssetUrlWidget.tsx
✅ src/components/widgets/DateRangeWidget.tsx
✅ src/components/widgets/TagsWidget.tsx
✅ src/components/widgets/SwitchWidget.tsx
✅ src/pages/Dashboard.tsx
✅ src/pages/AssetActivity.tsx
✅ src/pages/AssetReview.tsx
✅ src/pages/AssetLibrary.tsx
✅ src/config/assetTypes/model.config.json
✅ src/config/assetTypes/dataset.config.json
✅ src/config/assetTypes/index.ts
✅ src/utils/configLoader.ts
✅ src/utils/schemaMapper.ts
✅ src/utils/validators.ts
✅ src/utils/fieldDependencyResolver.ts
✅ src/types/index.ts
✅ src/schemas/index.ts (widget registry)
✅ src/theme/index.ts (MUI dark theme)
✅ src/App.tsx (router)
✅ src/main.tsx (providers)
✅ src/__tests__/ (test files)
✅ jest.config.js
✅ src/setupTests.ts

Backend:
✅ package.json with all dependencies
✅ tsconfig.json
✅ .env.example
✅ src/app.ts
✅ src/server.ts
✅ src/config.ts
✅ src/routes/assets.ts
✅ src/routes/config.ts
✅ src/services/assetService.ts
✅ src/services/configService.ts
✅ src/types/index.ts
✅ src/middleware/errorHandler.ts
✅ src/middleware/validation.ts
✅ database/migrations/ (migration files)
✅ database/entities/ (TypeORM entities)
✅ seeds/seed.ts (seed data)
✅ src/**tests**/ (test files)
✅ jest.config.js

Documentation:
✅ README.md
✅ docs/ARCHITECTURE.md
✅ docs/SETUP.md
✅ docs/ADDING_ASSETS.md

## SUCCESS CRITERIA

The implementation is complete when:
✅ npm install completes without errors
✅ npm run dev works (backend on :3001, frontend on :5173)
✅ Forms render correctly with RJSF Material-UI template
✅ All standard field types work (input, dropdown, date, etc.)
✅ All custom field types work (asset_relation, asset_url)
✅ Field dependencies/visibility works
✅ Form validation works (AJV + custom validators)
✅ Asset creation works
✅ Assets persist to database
✅ Asset retrieval works
✅ Tests pass (80%+ coverage)
✅ TypeScript compilation succeeds
✅ ESLint passes
✅ No console errors
✅ Can add new asset type with JSON config only (no code changes)
✅ Can add new field with JSON config only (no code changes)
✅ Documentation is complete and accurate

Generate this complete, production-ready CDA Asset Management System implementation.
