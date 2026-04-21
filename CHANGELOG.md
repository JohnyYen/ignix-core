# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.2] - 2024-??-??

### Fixed

- Workflow token configuration for npm publishing
- Semantic-release CD on version tags

## [1.6.0] - 2024-??-??

### Added

- **Result Pattern**: Type-safe error handling with `Result<T, E>` union type
  - `ok()` and `fail()` constructors
  - `isSuccess()` and `isFailure()` type guards
  - `map()` and `flatMap()` for chaining operations
  - `fromPromise()` to convert Promises to Results
  - `fromNullable()` for null/undefined handling
- **Service Layer**: `IService` and `ILegacyService` interfaces
  - `BaseService` and `LegacyService` implementations
  - CRUD operations: findAll, findById, findOne, create, update, delete
  - Soft delete and restore support
  - Count operations
- **Repository Abstraction**: `IRepository` interface
  - ORM-agnostic design
  - Works with any database (Prisma, Drizzle, TypeORM, etc.)
- **API Handlers**: Framework-flexible HTTP handlers
  - Express, Fastify, NestJS, Hono adapters
  - Request/Response type definitions
  - Route adapter system
- **Middleware**: Result middleware support
- **Exceptions**: Domain-specific error types
  - `DatabaseError`
  - `ValidationError`
  - `NotFoundError`
- **DTO Types**: `ICreateDto` and `IUpdateDto` type utilities
- **CI/CD**: GitHub Actions workflows
  - ESLint
  - Jest testing
  - Semantic-release for npm publishing

### Changed

- Migrated from npm to pnpm for package management
- Added pnpm-lock.yaml

## [1.5.0] - 2024-??-??

### Added

- Initial npm publish configuration
- Basic documentation

---

##CQRS Extension (v1.7.0+)

### Added (Latest)

- **CQRS Pattern**: Command Query Responsibility Segregation
  - `ICommand` and `IQuery` interfaces
  - `CommandHandler` and `QueryHandler` abstract classes
  - `CommandBus` and `QueryBus` for handler dispatching
  - `Mediator` combining both buses
  - Type-safe `Command` and `Query` builders

---

## Upgrading

### From v1.5.x to v1.6.x

The v1.6.0 release introduced breaking changes in the Result pattern:

```typescript
// Before (v1.5.x)
const result = await service.findById(id);

// After (v1.6.x) - Now returns Result<T, E>
const result = await service.findById(id);
if (isSuccess(result)) {
  console.log(result.data);
}
```

### Migrating to CQRS (v1.7.0+)

```typescript
// Define Commands and Queries
class CreateUserCommand extends Command<'CREATE_USER', { name: string; email: string }> {}
class GetUserQuery extends Query<'GET_USER', { id: number }> {}

// Create Handlers
class CreateUserHandler extends CommandHandler<CreateUserCommand, User> {
  readonly commandType = 'CREATE_USER';
  async handle(cmd) { /* ... */ }
}

class GetUserHandler extends QueryHandler<GetUserQuery, User> {
  readonly queryType = 'GET_USER';
  async handle(qry) { /* ... */ }
}

// Use Mediator
const mediator = new Mediator();
mediator.registerCommand(new CreateUserHandler());
mediator.registerQuery(new GetUserHandler());

const user = await mediator.send<User>(new CreateUserCommand({ name: 'John', email: 'john@test.com' }));
const found = await mediator.ask<User>(new GetUserQuery({ id: 1 }));
```

---

## Roadmap

- [ ] Event Sourcing support
- [ ]Saga Pattern for distributed transactions
- [ ] GraphQL integration
- [ ] WebSocket handlers
- [ ] Rate limiting middleware
- [ ] Caching utilities
- [ ] Validation decorators (class-validator integration)

---

## Credits

- [Johny A. Pedraza](https://github.com/JohnyYen) - Author