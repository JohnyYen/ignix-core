# Testing Guide

This document explains how to run and maintain the test suite for @ignix/core.

## Overview

The test suite is built with Jest and TypeScript, providing comprehensive coverage for all core functionality:

- **Result Pattern** - Success/failure pattern handling
- **BaseService** - Core service operations with Result pattern
- **LegacyService** - Legacy service with exception throwing
- **Utils** - Framework detection utilities
- **Exceptions** - Error type definitions and handling

## Running Tests

### Basic Test Execution
```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose

# Run tests in CI environment
npm run test:ci
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Format**: `coverage/lcov.info`
- **Text Summary**: Displayed in console

Coverage thresholds are configured in `jest.config.js`:
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

## Test Structure

```
test/
├── services/
│   ├── base.service.test.ts    # BaseService CRUD operations
│   └── legacy.service.test.ts  # LegacyService exception handling
├── types/
│   └── result.test.ts        # Result pattern functions
├── utils/
│   └── utils.test.ts         # Framework detection
├── exceptions/
│   └── exceptions.test.ts    # Error type definitions
└── mocks/
    ├── mock.repository.ts    # Mock repository for testing
    └── mock.service.ts      # Mock service for testing
```

## Writing Tests

### Test Patterns

#### 1. Result Pattern Testing
```typescript
// Test success case
const result = ok(data);
expect(result.type).toBe('success');
expect(result.data).toEqual(expectedData);

// Test failure case
const error = { type: 'database', message: 'Error' };
const result = fail(error);
expect(result.type).toBe('failure');
expect(result.error).toEqual(error);
```

#### 2. Service Testing
```typescript
// Mock setup
const mockRepo = new MockRepository<TestEntity>();
mockRepo.setMockData(entities);
const service = new TestService(mockRepo);

// Test success case
const result = await service.findById(1);
expect(result.type).toBe('success');
if (result.type === 'success') {
  expect(result.data).toEqual(expectedEntity);
}

// Test error case
mockRepo.shouldThrowError(new Error('Database error'));
const result = await service.findById(1);
expect(result.type).toBe('failure');
if (result.type === 'failure') {
  expect(result.error.type).toBe('database');
}
```

#### 3. Error Testing
```typescript
// Test error type creation
const error: DatabaseError = {
  type: 'database',
  message: 'Connection failed',
  code: 'ECONNREFUSED'
};
expect(error.type).toBe('database');
expect(error.message).toBe('Connection failed');

// Test type discrimination
if (error.type === 'database') {
  expect(error.code).toBe('ECONNREFUSED');
}
```

### Mock Objects

#### MockRepository
Provides configurable mock for repository operations:
```typescript
const mockRepo = new MockRepository<TestEntity>();

// Configure behavior
mockRepo.setMockData(entities);
mockRepo.setMockCreateResult(createdEntity);
mockRepo.setMockUpdateResult(updatedEntity);

// Simulate errors
mockRepo.shouldThrowError(new Error('Database error'));

// Reset all mocks
mockRepo.resetMocks();
```

#### MockService
Provides configurable mock for service operations:
```typescript
const mockService = new MockService<TestEntity>(entities);

// Configure behavior
mockService.setMockEntities(entities);
mockService.setShouldFail(true);

// Get current state
const currentEntities = mockService.getMockEntities();
```

## Best Practices

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names (`should... when...`)
- Arrange-Act-Assert pattern in each test

### 2. Async Testing
- Always `await` async operations
- Use proper async/await syntax
- Test both success and failure paths

### 3. Mock Management
- Reset mocks in `beforeEach`
- Use descriptive mock data
- Test edge cases and error conditions

### 4. Type Safety
- Use proper TypeScript types
- Leverage type guards for union types
- Maintain type safety throughout tests

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    npm ci
    npm run test:ci
```

### Coverage Requirements
- Maintain coverage thresholds in jest.config.js
- Add tests for uncovered lines
- Focus on critical paths

## Debugging Tests

### Running Specific Tests
```bash
# Run specific test file
npm test -- test/services/base.service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create"

# Run tests with debug output
npm test -- --verbose --no-cache
```

### Common Issues

#### 1. Mock Configuration
```typescript
// Wrong: Mock not configured
mockRepo.setMockData([]); // Empty array

// Right: Configure mock data
mockRepo.setMockData([expectedEntity]);
```

#### 2. Type Errors
```typescript
// Wrong: Missing type annotation
function createService() {
  return new BaseService(mockRepo);
}

// Right: Proper typing
function createService(): BaseService<TestEntity> {
  return new BaseService(mockRepo);
}
```

#### 3. Async Handling
```typescript
// Wrong: Not awaiting async result
const result = service.findById(1);

// Right: Await async operations
const result = await service.findById(1);
```

## Performance Considerations

- Tests should complete quickly (<10ms per test on average)
- Mock operations should be O(1) complexity
- Use efficient data structures for test data
- Avoid unnecessary async operations in tests

## Contributing

When adding new features:

1. **Add Tests**: Create comprehensive tests for new functionality
2. **Maintain Coverage**: Ensure new code is covered
3. **Update Docs**: Document test patterns and utilities
4. **Mock Objects**: Update mocks if interfaces change
5. **Types**: Maintain TypeScript type safety

## Troubleshooting

### Common Jest Issues
- **Module not found**: Check import paths and tsconfig.json
- **Type errors**: Verify TypeScript configuration
- **Timeouts**: Increase timeout in jest.config.js
- **Memory issues**: Use proper cleanup in afterEach

### Debug Mode
```bash
# Run with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Run tests one by one for debugging
npm test -- --runInBand --no-cache
```

This testing framework ensures robust, maintainable code for @ignix/core.