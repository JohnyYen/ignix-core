import { ServiceError, DatabaseError, ValidationError, NotFoundError } from '../../src/exceptions/exceptions';

describe('Service Errors', () => {
  describe('DatabaseError', () => {
    it('should create a valid database error with all properties', () => {
      const error: DatabaseError = {
        type: 'database',
        message: 'Connection failed',
        code: 'ECONNREFUSED'
      };

      expect(error.type).toBe('database');
      expect(error.message).toBe('Connection failed');
      expect(error.code).toBe('ECONNREFUSED');
    });

    it('should create a database error with minimal properties', () => {
      const error: DatabaseError = {
        type: 'database',
        message: 'Database error occurred'
      };

      expect(error.type).toBe('database');
      expect(error.message).toBe('Database error occurred');
      expect(error.code).toBeUndefined();
    });

    it('should handle different database error codes', () => {
      const errors: DatabaseError[] = [
        { type: 'database', message: 'Timeout', code: 'ETIMEDOUT' },
        { type: 'database', message: 'Connection lost', code: 'ECONNRESET' },
        { type: 'database', message: 'Query failed', code: 'ER_QUERY_FAILED' },
        { type: 'database', message: 'Constraint violation', code: '23505' },
        { type: 'database', message: 'Syntax error', code: 'SQL_SYNTAX_ERROR' }
      ];

      errors.forEach(error => {
        expect(error.type).toBe('database');
        expect(error.message).toBeTruthy();
        expect(error.code).toBeTruthy();
      });
    });

    it('should handle empty database error', () => {
      const error: DatabaseError = {
        type: 'database',
        message: '',
        code: ''
      };

      expect(error.type).toBe('database');
      expect(error.message).toBe('');
      expect(error.code).toBe('');
    });
  });

  describe('ValidationError', () => {
    it('should create a valid validation error with all properties', () => {
      const error: ValidationError = {
        type: 'validation',
        field: 'email',
        message: 'Invalid email format'
      };

      expect(error.type).toBe('validation');
      expect(error.field).toBe('email');
      expect(error.message).toBe('Invalid email format');
    });

    it('should handle validation errors for different fields', () => {
      const errors: ValidationError[] = [
        { type: 'validation', field: 'name', message: 'Name is required' },
        { type: 'validation', field: 'age', message: 'Age must be greater than 0' },
        { type: 'validation', field: 'password', message: 'Password must be at least 8 characters' },
        { type: 'validation', field: 'phone', message: 'Invalid phone number format' },
        { type: 'validation', field: 'url', message: 'Invalid URL format' }
      ];

      errors.forEach(error => {
        expect(error.type).toBe('validation');
        expect(error.field).toBeTruthy();
        expect(error.message).toBeTruthy();
      });
    });

    it('should handle validation errors for nested fields', () => {
      const error: ValidationError = {
        type: 'validation',
        field: 'user.profile.email',
        message: 'Invalid email format'
      };

      expect(error.type).toBe('validation');
      expect(error.field).toBe('user.profile.email');
      expect(error.message).toBe('Invalid email format');
    });

    it('should handle validation errors for array fields', () => {
      const error: ValidationError = {
        type: 'validation',
        field: 'tags[0]',
        message: 'Tag cannot be empty'
      };

      expect(error.type).toBe('validation');
      expect(error.field).toBe('tags[0]');
      expect(error.message).toBe('Tag cannot be empty');
    });

    it('should handle empty validation error', () => {
      const error: ValidationError = {
        type: 'validation',
        field: '',
        message: ''
      };

      expect(error.type).toBe('validation');
      expect(error.field).toBe('');
      expect(error.message).toBe('');
    });
  });

  describe('NotFoundError', () => {
    it('should create a valid not found error with all properties', () => {
      const error: NotFoundError = {
        type: 'not_found',
        message: 'User with id 123 not found',
        resource: 'User',
        id: 123
      };

      expect(error.type).toBe('not_found');
      expect(error.message).toBe('User with id 123 not found');
      expect(error.resource).toBe('User');
      expect(error.id).toBe(123);
    });

    it('should handle not found errors for different resource types', () => {
      const errors: NotFoundError[] = [
        { type: 'not_found', message: 'Product with code ABC123 not found', resource: 'Product', id: 'ABC123' },
        { type: 'not_found', message: 'Order with number ORD-456 not found', resource: 'Order', id: 'ORD-456' },
        { type: 'not_found', message: 'File with path /tmp/file.txt not found', resource: 'File', id: '/tmp/file.txt' },
        { type: 'not_found', message: 'Session with token abc-def-456 not found', resource: 'Session', id: 'abc-def-456' }
      ];

      errors.forEach(error => {
        expect(error.type).toBe('not_found');
        expect(error.message).toBeTruthy();
        expect(error.resource).toBeTruthy();
        expect(error.id).toBeTruthy();
      });
    });

    it('should handle numeric and string IDs', () => {
      const numericError: NotFoundError = {
        type: 'not_found',
        message: 'Resource with id 42 not found',
        resource: 'Resource',
        id: 42
      };

      const stringError: NotFoundError = {
        type: 'not_found',
        message: 'Resource with id uuid-string not found',
        resource: 'Resource',
        id: 'uuid-string'
      };

      expect(numericError.id).toBe(42);
      expect(typeof numericError.id).toBe('number');

      expect(stringError.id).toBe('uuid-string');
      expect(typeof stringError.id).toBe('string');
    });

    it('should handle empty not found error', () => {
      const error: NotFoundError = {
        type: 'not_found',
        message: '',
        resource: '',
        id: ''
      };

      expect(error.type).toBe('not_found');
      expect(error.message).toBe('');
      expect(error.resource).toBe('');
      expect(error.id).toBe('');
    });
  });

  describe('ServiceError union type', () => {
    it('should accept any service error type', () => {
      const errors: ServiceError[] = [
        { type: 'database', message: 'DB error' },
        { type: 'database', message: 'DB error', code: 'ECONN' },
        { type: 'validation', field: 'name', message: 'Required' },
        { type: 'validation', field: 'email', message: 'Invalid email' },
        { type: 'not_found', message: 'Not found', resource: 'Entity', id: 1 },
        { type: 'not_found', message: 'Not found', resource: 'User', id: 'user123' }
      ];

      expect(errors).toHaveLength(6);
      errors.forEach(error => {
        expect(['database', 'validation', 'not_found']).toContain(error.type);
      });
    });

    it('should allow type guards to discriminate error types', () => {
      const dbError: ServiceError = { type: 'database', message: 'Connection failed' };
      const validationError: ServiceError = { type: 'validation', field: 'email', message: 'Invalid' };
      const notFoundError: ServiceError = { type: 'not_found', message: 'Not found', resource: 'User', id: 1 };

      // Database error type guard
      if (dbError.type === 'database') {
        expect(dbError.message).toBe('Connection failed');
        expect(dbError.code).toBeUndefined();
      }

      // Validation error type guard
      if (validationError.type === 'validation') {
        expect(validationError.field).toBe('email');
        expect(validationError.message).toBe('Invalid');
      }

      // Not found error type guard
      if (notFoundError.type === 'not_found') {
        expect(notFoundError.resource).toBe('User');
        expect(notFoundError.id).toBe(1);
      }
    });

    it('should handle error creation dynamically', () => {
      function createDatabaseError(message: string, code?: string): DatabaseError {
        return { type: 'database', message, code };
      }

      function createValidationError(field: string, message: string): ValidationError {
        return { type: 'validation', field, message };
      }

      function createNotFoundError(resource: string, id: string | number): NotFoundError {
        return {
          type: 'not_found',
          message: `${resource} with id ${id} not found`,
          resource,
          id
        };
      }

      const dbErr = createDatabaseError('Connection timeout', 'ETIMEDOUT');
      const validErr = createValidationError('email', 'Invalid format');
      const notFoundErr = createNotFoundError('Product', 123);

      expect(dbErr.type).toBe('database');
      expect(validErr.type).toBe('validation');
      expect(notFoundErr.type).toBe('not_found');
    });
  });

  describe('Error serialization and deserialization', () => {
    it('should serialize and deserialize database errors correctly', () => {
      const originalError: DatabaseError = {
        type: 'database',
        message: 'Connection failed',
        code: 'ECONNREFUSED'
      };

      const serialized = JSON.stringify(originalError);
      const deserialized = JSON.parse(serialized) as DatabaseError;

      expect(deserialized).toEqual(originalError);
      expect(deserialized.type).toBe('database');
      expect(deserialized.message).toBe('Connection failed');
      expect(deserialized.code).toBe('ECONNREFUSED');
    });

    it('should serialize and deserialize validation errors correctly', () => {
      const originalError: ValidationError = {
        type: 'validation',
        field: 'user.email',
        message: 'Invalid email format'
      };

      const serialized = JSON.stringify(originalError);
      const deserialized = JSON.parse(serialized) as ValidationError;

      expect(deserialized).toEqual(originalError);
      expect(deserialized.type).toBe('validation');
      expect(deserialized.field).toBe('user.email');
      expect(deserialized.message).toBe('Invalid email format');
    });

    it('should serialize and deserialize not found errors correctly', () => {
      const originalError: NotFoundError = {
        type: 'not_found',
        message: 'User with id user123 not found',
        resource: 'User',
        id: 'user123'
      };

      const serialized = JSON.stringify(originalError);
      const deserialized = JSON.parse(serialized) as NotFoundError;

      expect(deserialized).toEqual(originalError);
      expect(deserialized.type).toBe('not_found');
      expect(deserialized.resource).toBe('User');
      expect(deserialized.id).toBe('user123');
    });
  });

  describe('Error edge cases', () => {
    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const error: DatabaseError = {
        type: 'database',
        message: longMessage
      };

      expect(error.message.length).toBe(1000);
      expect(error.type).toBe('database');
    });

    it('should handle special characters in error messages', () => {
      const specialChars = 'Error with émojis 🚨 and special chars: @#$%^&*()_+-={}[]|\\:";\'<>?,./';
      const error: ValidationError = {
        type: 'validation',
        field: 'special',
        message: specialChars
      };

      expect(error.message).toBe(specialChars);
      expect(error.type).toBe('validation');
    });

    it('should handle unicode characters in resource names', () => {
      const error: NotFoundError = {
        type: 'not_found',
        message: 'Usuario con código 用户123 no encontrado',
        resource: 'Usuario',
        id: '用户123'
      };

      expect(error.type).toBe('not_found');
      expect(error.resource).toBe('Usuario');
      expect(error.id).toBe('用户123');
    });

    it('should handle null and undefined values appropriately', () => {
      const dbError: DatabaseError = {
        type: 'database',
        message: 'Error occurred',
        code: undefined
      };

      const validationError: ValidationError = {
        type: 'validation',
        field: 'optional',
        message: 'Optional field missing'
      };

      const notFoundError: NotFoundError = {
        type: 'not_found',
        message: 'Not found',
        resource: 'Test',
        id: null as any
      };

      expect(dbError.code).toBeUndefined();
      expect(validationError.field).toBe('optional');
      expect(notFoundError.id).toBeNull();
    });
  });
});