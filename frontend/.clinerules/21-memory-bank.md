---
description: "Memory Bank management — Toggle to initialize or update memory bank"
globs: 
alwaysApply: false
---

# Memory Bank

## What is Memory Bank?
The Memory Bank is a structured documentation system in `memory-bank/` that helps you maintain project context across sessions. Read these files at the START of every session to rebuild context.

## Core Files

| File | Purpose | Update Frequency |
|------|---------|-----------------|
| `projectbrief.md` | Core requirements & goals | Rarely (only when scope changes) |
| `productContext.md` | Why project exists, UX goals | Rarely |
| `systemPatterns.md` | Architecture & design patterns | When patterns evolve |
| `techContext.md` | Tech stack & setup details | When stack changes |
| `activeContext.md` | Current focus & recent changes | **Every session** |
| `progress.md` | Milestones & overall progress | After each milestone |

## Workflow

### Starting a New Session
```
1. Read ALL memory bank files
2. Understand current project state
3. Check activeContext.md for last session's progress
4. Continue from where you left off
```

### Ending a Session
```
1. Update activeContext.md with:
   - What was accomplished
   - Current blockers
   - Next steps
2. Update progress.md if milestone reached
3. Update other files if patterns/tech changed
```

### Initialize Memory Bank
When requested to "initialize memory bank":
1. Create `memory-bank/` directory in project root
2. Populate all 6 files with current project information
3. Use existing `.clinerules/01-project-context.md` as base reference

## File Templates

### projectbrief.md
```markdown
# Project Brief

## Project Name
[Samsung Enterprise Application Name]

## Core Requirements
- [Requirement 1]
- [Requirement 2]

## Goals
- [Goal 1]
- [Goal 2]

## Scope
### In Scope
- [Feature A]

### Out of Scope
- [Feature X]
```

### productContext.md
```markdown
# Product Context

## Why This Project Exists
[Business problem this solves]

## Target Users
[Who uses this application]

## User Experience Goals
- [UX Goal 1]
- [UX Goal 2]

## Key User Flows
1. [Flow 1 description]
2. [Flow 2 description]
```

### systemPatterns.md
```markdown
# System Patterns

## Architecture
- Clean Architecture (Domain → Application → Infrastructure → Presentation)

## Key Design Patterns
- Repository Pattern for data access
- Service Pattern for business logic
- Redux Toolkit for state management

## Component Patterns
- Functional components with hooks
- Container/Presentational separation
- SCSS Modules for styling
```

### techContext.md
```markdown
# Tech Context

## Stack
- React 18.2 (CRA)
- TypeScript (strict mode)
- Redux Toolkit
- SCSS Modules
- React Router 5.3.4
- MUI + PrimeReact
- Axios
- Jest + RTL
- Webpack 4

## Development Setup
- Node.js: [version]
- Package Manager: yarn
- IDE: VS Code

## Key Configuration
- TypeScript: strict mode enabled
- ESLint + Prettier configured
- Absolute imports enabled
```

### activeContext.md
```markdown
# Active Context

## Current Focus
[What is being worked on right now]

## Recent Changes
- [Change 1 — date]
- [Change 2 — date]

## Current Blockers
- [Blocker 1]

## Next Steps
- [Next step 1]
- [Next step 2]

## Open Questions
- [Question 1]
```

### progress.md
```markdown
# Progress

## Completed Milestones
- [x] [Milestone 1] — [date]
- [x] [Milestone 2] — [date]

## In Progress
- [/] [Current milestone]

## Upcoming
- [ ] [Future milestone 1]
- [ ] [Future milestone 2]

## Known Issues
- [Issue 1]
```
