# NestJS Boilerplate Rules

## Project Goal

This project follows a scalable enterprise NestJS architecture suitable for:

* ERP
* POS
* CRM
* Inventory Management
* Booking Systems
* SaaS Applications

All generated code must follow the standards in this document.

---

# Tech Stack

## Backend

* NestJS
* TypeScript
* TypeORM
* PostgreSQL
* JWT Authentication
* Redis
* Swagger
* Docker

---

# Folder Structure

```text
src/
├── common/
│   ├── constants/
│   ├── decorators/
│   ├── dto/
│   ├── enums/
│   ├── exceptions/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── middleware/
│   ├── pipes/
│   ├── utils/
│   └── types/
│
├── config/
│
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
│
├── entities/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   └── permissions/
│
└── main.ts
```

---

# Module Structure

Every module must follow:

```text
users/
├── dto/
├── entities/
├── users.controller.ts
├── users.service.ts
├── users.repository.ts
├── users.module.ts
```

Avoid putting business logic in controllers.

Controllers should only:

* Receive requests
* Validate DTO
* Call service
* Return response

Business logic belongs in services.

---

# Naming Convention

## Files

```text
users.controller.ts
users.service.ts
users.module.ts
create-user.dto.ts
update-user.dto.ts
```

## Classes

```ts
UsersController
UsersService
CreateUserDto
UpdateUserDto
```

## Interfaces

```ts
interface IUser
interface IUserRepository
```

---

# API Response Format

Success Response

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error Response

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": []
}
```

Always use the global response interceptor.

---

# Validation

All incoming requests must use DTO validation.

Example:

```ts
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
```

Global ValidationPipe:

```ts
transform: true
whitelist: true
forbidNonWhitelisted: true
```

---

# Authentication

Use JWT Authentication.

Requirements:

* Access Token
* Refresh Token
* JWT Guard

Never store plaintext passwords.

Always hash using bcrypt.

---

# Authorization

Use Role-Based Access Control.

Example:

```ts
@Roles('admin')
```

Permissions should be granular:

```text
users.create
users.read
users.update
users.delete
```

---

# Database Rules

Use PostgreSQL.

Every table should contain:

```ts
id
createdAt
updatedAt
deletedAt
createdBy
updatedBy
```

Use soft delete whenever possible.

---

# Pagination Standard

Query Parameters

```http
?page=1
&limit=10
&sortBy=createdAt
&sortOrder=DESC
```

Response

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

# Logging

Use Standard NestJs Logger.

Log:

* Request
* Response
* Error
* Authentication

Never log passwords.

Never log JWT secrets.

---

# Swagger

Every endpoint must contain:

```ts
@ApiTags()
@ApiOperation()
@ApiResponse()
```

Swagger endpoint:

```text
/api/docs
```

---

# Error Handling

Use custom exceptions.

Avoid:

```ts
throw new Error(...)
```

Use:

```ts
throw new BadRequestException(...)
throw new NotFoundException(...)
```

or custom exceptions.

---

# Repository Pattern

Database access belongs in repositories.

Avoid:

```ts
service -> TypeORM directly
```

Preferred:

```text
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

---

# Environment Variables

All environment variables must be validated.

Required examples:

```env
APP_NAME=
PORT=

DATABASE_HOST=
DATABASE_PORT=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=

JWT_SECRET=
JWT_REFRESH_SECRET=

REDIS_HOST=
REDIS_PORT=
```

Never hardcode secrets.

---

# Testing

Each module should contain:

```text
users.service.spec.ts
users.controller.spec.ts
```

Coverage target:

```text
>= 80%
```

---

# Docker

Application must run with:

```bash
docker compose up -d
```

Required services:

* App
* PostgreSQL
* Redis

---

# Code Generation Rules For AI

When generating code:

1. Follow folder structure exactly.
2. Use DTO validation.
3. Use repository pattern.
4. Use dependency injection.
5. Add Swagger decorators.
6. Add proper typing.
7. Use async/await.
8. Avoid business logic in controllers.
9. Return standardized API responses.
10. Follow SOLID principles.
11. Create pagination support when listing data.
12. Create unit tests when creating new services.
13. Generate migration files when creating entities.
14. Use soft delete by default.
15. Prefer reusable abstractions over duplicated code.

End of document.
