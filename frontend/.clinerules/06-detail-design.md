---
description: "Detail design and PlantUML documentation workflow — Toggle when creating design docs"
globs: 
alwaysApply: false
---

# Detail Design Workflow

## When to Create Detail Design
- New feature with complex business logic
- System integration or API design
- Database schema changes
- Architecture-level changes

## Document Structure

### 1. Overview
- Feature name and description
- Business requirements summary
- Scope and constraints

### 2. Class Diagram (PlantUML)

```plantuml
@startuml
skinparam classAttributeIconSize 0

interface IUserRepository {
  + findById(id: string): Promise<IUser>
  + save(user: IUser): Promise<void>
  + delete(id: string): Promise<void>
}

class UserService {
  - repository: IUserRepository
  + getUser(id: string): Promise<UserDto>
  + createUser(dto: CreateUserDto): Promise<UserDto>
}

class UserRepository implements IUserRepository {
  - axiosInstance: AxiosInstance
  + findById(id: string): Promise<IUser>
  + save(user: IUser): Promise<void>
  + delete(id: string): Promise<void>
}

UserService --> IUserRepository
UserRepository ..|> IUserRepository
@enduml
```

### 3. Sequence Diagram

```plantuml
@startuml
actor User
participant "UserPage" as Page
participant "UserService" as Service
participant "UserRepository" as Repo
participant "API Server" as API

User -> Page: Click "Save"
Page -> Service: createUser(dto)
Service -> Service: validate(dto)
Service -> Repo: save(entity)
Repo -> API: POST /api/users
API --> Repo: 201 Created
Repo --> Service: IUser
Service --> Page: UserDto
Page --> User: Show success
@enduml
```

### 4. Component Diagram

```plantuml
@startuml
package "Presentation" {
  [UserPage]
  [UserForm]
  [UserList]
}

package "Application" {
  [UserService]
}

package "Infrastructure" {
  [UserRepository]
  [AxiosClient]
}

package "Domain" {
  [IUser]
  [IUserRepository]
}

[UserPage] --> [UserService]
[UserService] --> [IUserRepository]
[UserRepository] ..|> [IUserRepository]
[UserRepository] --> [AxiosClient]
@enduml
```

### 5. Data Flow

```
User Input → Component State → Redux Action → Thunk → API Call → Response → Redux Store → Component Re-render
```

## File Naming
- Place `.puml` files in `docs/designs/` directory
- Name: `[feature-name]-[diagram-type].puml`
- Example: `user-management-sequence.puml`

## Confluence Page Template
```markdown
# [Feature Name] — Detail Design

## 1. Overview
## 2. Requirements
## 3. Architecture Diagrams
## 4. Data Model
## 5. API Contracts
## 6. Error Handling
## 7. Testing Strategy
## 8. Open Questions
```
