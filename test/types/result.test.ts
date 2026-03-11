import { ok, fail, Result, SuccessResult, FailureResult, isSuccess, isFailure, map, flatMap, fromPromise, fromNullable } from '../../src/types/result';

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

  describe('isSuccess type guard', () => {
    it('should return true for SuccessResult', () => {
      const successResult = ok({ id: 1, name: 'test' });
      expect(isSuccess(successResult)).toBe(true);
    });

    it('should return false for FailureResult', () => {
      const failureResult = fail({ type: 'database', message: 'error' });
      expect(isSuccess(failureResult)).toBe(false);
    });

    it('should narrow type correctly in conditional', () => {
      const result: Result<string, any> = ok('success data');
      
      if (isSuccess(result)) {
        expect(result.data).toBe('success data');
        expect(result.type).toBe('success');
      } else {
        fail('Should not reach here');
      }
    });

    it('should narrow FailureResult to never in else branch', () => {
      const result: Result<string, any> = fail({ type: 'error', message: 'fail' });
      
      if (isSuccess(result)) {
        fail('Should not reach here');
      } else {
        expect(result.error.type).toBe('error');
      }
    });
  });

  describe('isFailure type guard', () => {
    it('should return true for FailureResult', () => {
      const failureResult = fail({ type: 'validation', message: 'Invalid' });
      expect(isFailure(failureResult)).toBe(true);
    });

    it('should return false for SuccessResult', () => {
      const successResult = ok('data');
      expect(isFailure(successResult)).toBe(false);
    });

    it('should narrow type correctly in conditional', () => {
      const result: Result<any, { type: string; message: string }> = fail({ type: 'error', message: 'fail' });
      
      if (isFailure(result)) {
        expect(result.error.type).toBe('error');
        expect(result.error.message).toBe('fail');
        expect(result.type).toBe('failure');
      } else {
        ok('Should not reach here');
      }
    });

    it('should narrow SuccessResult to never in else branch', () => {
      const result: Result<string, any> = ok('success');
      
      if (isFailure(result)) {
        fail('Should not reach here');
      } else {
        expect(result.data).toBe('success');
      }
    });
  });

  describe('map function', () => {
    it('should transform data in SuccessResult', () => {
      const result: SuccessResult<{ name: string; age: number }> = ok({ name: 'john', age: 25 });
      const mapped = map(result, (data) => ({ ...data, name: data.name.toUpperCase() }));
      
      expect(mapped.type).toBe('success');
      expect((mapped as SuccessResult<any>).data.name).toBe('JOHN');
      expect((mapped as SuccessResult<any>).data.age).toBe(25);
    });

    it('should propagate FailureResult unchanged', () => {
      const error = { type: 'database', message: 'Connection failed' };
      const result: FailureResult<typeof error> = fail(error);
      const mapped = map(result, (_data: any) => ({ name: 'ignored' }));
      
      expect(mapped.type).toBe('failure');
      expect((mapped as FailureResult<any>).error).toEqual(error);
    });

    it('should preserve message on SuccessResult', () => {
      const result = ok('hello', 'original message');
      const mapped = map(result, (data: string) => data.toUpperCase());
      
      expect(mapped.type).toBe('success');
      expect((mapped as SuccessResult<string>).data).toBe('HELLO');
      expect(mapped.message).toBe('original message');
    });

    it('should preserve message on FailureResult', () => {
      const result = fail({ type: 'error' }, 'error message');
      const mapped = map(result, (_data: any) => 'transformed');
      
      expect(mapped.type).toBe('failure');
      expect(mapped.message).toBe('error message');
    });

    it('should work with various transformation functions', () => {
      const numberResult = ok(10);
      const doubled = map(numberResult, (n) => n * 2);
      expect((doubled as SuccessResult<number>).data).toBe(20);

      const arrayResult = ok([1, 2, 3]);
      const summed = map(arrayResult, (arr) => arr.reduce((a, b) => a + b, 0));
      expect((summed as SuccessResult<number>).data).toBe(6);

      const objectResult = ok({ a: 1, b: 2 });
      const keys = map(objectResult, (obj) => Object.keys(obj));
      expect((keys as SuccessResult<string[]>).data).toEqual(['a', 'b']);
    });

    it('should change result type correctly', () => {
      const result = ok({ id: 1 });
      const mapped = map(result, (data) => data.id.toString());
      
      expect(typeof (mapped as SuccessResult<string>).data).toBe('string');
      expect((mapped as SuccessResult<string>).data).toBe('1');
    });
  });

  describe('flatMap function', () => {
    it('should chain SuccessResult with Result-returning function', () => {
      const userResult = ok({ id: 1, name: 'John' });
      const chained = flatMap(userResult, (user) => {
        if (user.name === 'John') {
          return ok({ ...user, role: 'admin' });
        }
        return fail({ type: 'validation', message: 'Invalid name' });
      });
      
      expect(chained.type).toBe('success');
      expect((chained as SuccessResult<any>).data.role).toBe('admin');
    });

    it('should propagate FailureResult unchanged', () => {
      const error = { type: 'database', message: 'error' };
      const result = fail(error);
      const chained = flatMap(result, (data) => ok({ processed: data }));
      
      expect(chained.type).toBe('failure');
      expect((chained as FailureResult<any>).error).toEqual(error);
    });

    it('should handle chained failure from function', () => {
      const userResult = ok({ id: 1, name: 'Jane' });
      const chained = flatMap(userResult, (user) => {
        if (user.name === 'John') {
          return ok({ ...user, role: 'admin' });
        }
        return fail({ type: 'validation', message: 'Invalid name' });
      });
      
      expect(chained.type).toBe('failure');
      expect((chained as FailureResult<any>).error.type).toBe('validation');
    });

    it('should preserve message on original failure', () => {
      const result = fail({ type: 'error' }, 'original error');
      const chained = flatMap(result, (data) => ok({ processed: data }));
      
      expect(chained.type).toBe('failure');
      expect(chained.message).toBe('original error');
    });

    it('should handle nested Results correctly', () => {
      const result = ok(5);
      const flat = flatMap(result, (n) => ok(n * 2));
      const flatAgain = flatMap(flat, (n) => ok(n.toString()));
      
      expect(flatAgain.type).toBe('success');
      expect((flatAgain as SuccessResult<string>).data).toBe('10');
    });

    it('should work with different input and output types', () => {
      const numberResult = ok(100);
      const stringResult = flatMap(numberResult, (n) => ok(`Value: ${n}`));
      
      expect(stringResult.type).toBe('success');
      expect((stringResult as SuccessResult<string>).data).toBe('Value: 100');
    });
  });

  describe('fromPromise function', () => {
    it('should convert resolved Promise to SuccessResult', async () => {
      const promise = Promise.resolve({ id: 1, name: 'Test' });
      const result = await fromPromise(promise, (e) => ({ type: 'unknown', message: String(e) }));
      
      expect(result.type).toBe('success');
      expect((result as SuccessResult<any>).data).toEqual({ id: 1, name: 'Test' });
    });

    it('should convert rejected Promise to FailureResult', async () => {
      const promise = Promise.reject(new Error('Database connection failed'));
      const result = await fromPromise(promise, (e) => ({ 
        type: 'database' as const, 
        message: e instanceof Error ? e.message : 'Unknown error' 
      }));
      
      expect(result.type).toBe('failure');
      expect((result as FailureResult<any>).error.type).toBe('database');
      expect((result as FailureResult<any>).error.message).toBe('Database connection failed');
    });

    it('should use mapError correctly', async () => {
      const error = { code: 'ERR001', info: 'Server error' };
      const promise = Promise.reject(error);
      const result = await fromPromise(
        promise,
        (e: any) => ({ type: 'api', message: e.info, code: e.code })
      );
      
      expect(result.type).toBe('failure');
      expect((result as FailureResult<any>).error.type).toBe('api');
      expect((result as FailureResult<any>).error.code).toBe('ERR001');
    });

    it('should handle async operations correctly', async () => {
      const asyncOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async data';
      };
      
      const result = await fromPromise(asyncOperation(), (e) => ({ type: 'error', message: String(e) }));
      
      expect(result.type).toBe('success');
      expect((result as SuccessResult<string>).data).toBe('async data');
    });

    it('should propagate rejection with custom error mapping', async () => {
      const promise = Promise.reject('string error');
      const result = await fromPromise(
        promise,
        (e) => ({ type: 'custom', message: String(e), timestamp: Date.now() })
      );
      
      expect(result.type).toBe('failure');
      expect((result as FailureResult<any>).error.type).toBe('custom');
      expect((result as FailureResult<any>).error.message).toBe('string error');
    });
  });

  describe('fromNullable function', () => {
    it('should convert non-null value to SuccessResult', () => {
      const result = fromNullable('some value', { type: 'not_found', message: 'Value is null' });
      
      expect(result.type).toBe('success');
      expect((result as SuccessResult<string>).data).toBe('some value');
    });

    it('should convert null to FailureResult with provided error', () => {
      const error = { type: 'not_found', message: 'User not found' };
      const result = fromNullable(null, error);
      
      expect(result.type).toBe('failure');
      expect((result as FailureResult<any>).error).toEqual(error);
    });

    it('should convert undefined to FailureResult', () => {
      const error = { type: 'not_found', message: 'Value is required' };
      const result = fromNullable(undefined, error);
      
      expect(result.type).toBe('failure');
      expect((result as FailureResult<any>).error).toEqual(error);
    });

    it('should narrow type to NonNullable in SuccessResult', () => {
      const value: string | null = 'test';
      const result = fromNullable(value, { type: 'error', message: 'fail' });
      
      if (result.type === 'success') {
        expect(typeof (result as SuccessResult<string>).data).toBe('string');
        expect((result as SuccessResult<string>).data.toUpperCase()).toBe('TEST');
      }
    });

    it('should handle objects correctly', () => {
      const obj = { id: 1, name: 'John' };
      const found = fromNullable(obj, { type: 'not_found', message: 'Not found' });
      const notFound = fromNullable(null, { type: 'not_found', message: 'Not found' });
      
      expect(found.type).toBe('success');
      expect((found as SuccessResult<any>).data).toEqual(obj);
      
      expect(notFound.type).toBe('failure');
    });

    it('should handle zero and empty string as valid values', () => {
      const zeroResult = fromNullable(0, { type: 'error', message: 'fail' });
      const emptyStringResult = fromNullable('', { type: 'error', message: 'fail' });
      
      expect(zeroResult.type).toBe('success');
      expect((zeroResult as SuccessResult<number>).data).toBe(0);
      
      expect(emptyStringResult.type).toBe('success');
      expect((emptyStringResult as SuccessResult<string>).data).toBe('');
    });

    it('should handle false as valid value', () => {
      const falseResult = fromNullable(false, { type: 'error', message: 'fail' });
      
      expect(falseResult.type).toBe('success');
      expect((falseResult as SuccessResult<boolean>).data).toBe(false);
    });
  });
});