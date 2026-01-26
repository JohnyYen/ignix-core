import { ok, fail, Result, SuccessResult, FailureResult } from '../../src/types/result';

describe('Result Pattern', () => {
  describe('ok function', () => {
    it('should create a successful result', () => {
      const data = { id: 1, name: 'test' };
      const result = ok(data);
      
      expect(result.type).toBe('success');
      expect(result.data).toEqual(data);
      expect(result.message).toBeUndefined();
    });

    it('should create a successful result with message', () => {
      const data = 'success';
      const message = 'Operation completed';
      const result = ok(data, message);
      
      expect(result.type).toBe('success');
      expect(result.data).toBe(data);
      expect(result.message).toBe(message);
    });

    it('should handle different data types', () => {
      const stringResult = ok('string data');
      const numberResult = ok(42);
      const booleanResult = ok(true);
      const arrayResult = ok([1, 2, 3]);
      const objectResult = ok({ key: 'value' });

      expect(stringResult.data).toBe('string data');
      expect(numberResult.data).toBe(42);
      expect(booleanResult.data).toBe(true);
      expect(arrayResult.data).toEqual([1, 2, 3]);
      expect(objectResult.data).toEqual({ key: 'value' });
    });
  });

  describe('fail function', () => {
    it('should create a failure result', () => {
      const error = { type: 'database', message: 'Connection failed' };
      const result = fail(error);
      
      expect(result.type).toBe('failure');
      expect(result.error).toEqual(error);
      expect(result.message).toBeUndefined();
    });

    it('should create a failure result with message', () => {
      const error = { type: 'validation', message: 'Invalid input' };
      const message = 'Validation failed';
      const result = fail(error, message);
      
      expect(result.type).toBe('failure');
      expect(result.error).toEqual(error);
      expect(result.message).toBe(message);
    });

    it('should handle different error types', () => {
      const dbError = { type: 'database', message: 'DB error' };
      const validationError = { type: 'validation', field: 'email', message: 'Invalid' };
      const notFoundError = { type: 'not_found', message: 'Not found', resource: 'user', id: 1 };

      const dbResult = fail(dbError);
      const validationResult = fail(validationError);
      const notFoundResult = fail(notFoundError);

      expect(dbResult.error.type).toBe('database');
      expect(validationResult.error.type).toBe('validation');
      expect(notFoundResult.error.type).toBe('not_found');
    });
  });

  describe('Result type checking', () => {
    it('should properly type check SuccessResult', () => {
      const success: SuccessResult<string> = ok('test');
      expect(success.type).toBe('success');
      
      if (success.type === 'success') {
        expect(typeof success.data).toBe('string');
        expect(success.data).toBe('test');
      }
    });

    it('should properly type check FailureResult', () => {
      const error = { type: 'database', message: 'error' };
      const failure: FailureResult<typeof error> = fail(error);
      expect(failure.type).toBe('failure');
      
      if (failure.type === 'failure') {
        expect(failure.error.type).toBe('database');
        expect(failure.error.message).toBe('error');
      }
    });

    it('should handle Result union type correctly', () => {
      const success: Result<string, any> = ok('success');
      const failure: Result<string, any> = fail({ type: 'database', message: 'error' });

      // Type guard usage
      if (success.type === 'success') {
        expect(success.data).toBe('success');
        expect(typeof success.data).toBe('string');
      }

      if (failure.type === 'failure') {
        expect(failure.error.type).toBe('database');
        expect(typeof failure.error.message).toBe('string');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle null and undefined data', () => {
      const nullResult = ok(null);
      const undefinedResult = ok(undefined);

      expect(nullResult.type).toBe('success');
      expect(nullResult.data).toBeNull();

      expect(undefinedResult.type).toBe('success');
      expect(undefinedResult.data).toBeUndefined();
    });

    it('should handle empty error objects', () => {
      const result = fail({} as any);
      expect(result.type).toBe('failure');
      expect(result.error).toEqual({});
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            preferences: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        permissions: ['read', 'write']
      };

      const result = ok(complexData);
      expect(result.type).toBe('success');
      expect(result.data).toEqual(complexData);
      expect(result.data.user.profile.preferences.theme).toBe('dark');
    });
  });

  describe('Message handling', () => {
    it('should handle empty messages', () => {
      const successResult = ok('data', '');
      const failureResult = fail({ type: 'error', message: 'msg' }, '');

      expect(successResult.message).toBe('');
      expect(failureResult.message).toBe('');
    });

    it('should handle long messages', () => {
      const longMessage = 'This is a very long message that should be handled properly without any issues or truncation';
      const result = ok('data', longMessage);

      expect(result.message).toBe(longMessage);
      if (result.message) {
        expect(result.message.length).toBe(longMessage.length);
      }
    });
  });
});