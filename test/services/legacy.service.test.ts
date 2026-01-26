import { LegacyService } from '../../src/services/legacy.service';
import { IService } from '../../src/services/service.interface';
import { Result, ok, fail } from '../../src/types/result';
import { ServiceError } from '../../src/exceptions/exceptions';
import { MockService } from '../mocks/mock.service';

interface TestEntity {
  id: number;
  name: string;
  email?: string;
}

describe('LegacyService', () => {
  let legacyService: LegacyService<TestEntity>;
  let mockService: MockService<TestEntity>;

  beforeEach(() => {
    const entities = [
      { id: 1, name: 'test1', email: 'test1@example.com' },
      { id: 2, name: 'test2', email: 'test2@example.com' }
    ];
    mockService = new MockService<TestEntity>(entities);
    legacyService = new LegacyService(mockService);
  });

  describe('findAll', () => {
    it('should return data when service returns success', async () => {
      const result = await legacyService.findAll();
      expect(result).toEqual([
        { id: 1, name: 'test1', email: 'test1@example.com' },
        { id: 2, name: 'test2', email: 'test2@example.com' }
      ]);
    });

    it('should return empty array when service returns empty success', async () => {
      mockService.setMockEntities([]);
      const result = await legacyService.findAll();
      expect(result).toEqual([]);
    });

    it('should throw error when service returns failure', async () => {
      mockService.setShouldFail(true);
      await expect(legacyService.findAll()).rejects.toThrow('Mock database error');
    });
  });

  describe('findById', () => {
    it('should return data when service returns success', async () => {
      const result = await legacyService.findById(1);
      expect(result).toEqual({ id: 1, name: 'test1', email: 'test1@example.com' });
    });

    it('should return null when service returns success with null', async () => {
      mockService.setMockEntities([]);
      const result = await legacyService.findById(999);
      expect(result).toBeNull();
    });

    it('should throw error when service returns failure', async () => {
      mockService.setShouldFail(true);
      await expect(legacyService.findById(999)).rejects.toThrow('Mock database error');
    });

    it('should throw error with custom message when service returns not found error', async () => {
      const customService = {
        findById: async () => fail({ type: 'not_found', message: 'Custom not found', resource: 'user', id: 999 })
      } as unknown as IService<TestEntity, 'id'>;
      const customLegacy = new LegacyService(customService);

      await expect(customLegacy.findById(999)).rejects.toThrow('Custom not found');
    });
  });

  describe('findOne', () => {
    it('should return data when service returns success', async () => {
      const result = await legacyService.findOne({ name: 'test1' });
      expect(result).toEqual({ id: 1, name: 'test1', email: 'test1@example.com' });
    });

    it('should return null when service returns success with null', async () => {
      mockService.setMockEntities([]);
      const result = await legacyService.findOne({ name: 'nonexistent' });
      expect(result).toBeNull();
    });

    it('should throw error when service returns failure', async () => {
      mockService.setShouldFail(true);
      await expect(legacyService.findOne({ name: 'test' })).rejects.toThrow('Mock database error');
    });
  });

  describe('create', () => {
    it('should return data when service returns success', async () => {
      const createData = { name: 'new test', email: 'new@example.com' };
      const result = await legacyService.create(createData);
      expect(result).toEqual({ id: expect.any(Number), name: 'new test', email: 'new@example.com' });
    });

    it('should throw error when service returns validation error', async () => {
      const failingService = {
        create: async () => fail({ type: 'validation', field: 'name', message: 'Required field' })
      } as unknown as IService<TestEntity, 'id'>;
      const failingLegacy = new LegacyService(failingService);

      await expect(failingLegacy.create({ name: '' })).rejects.toThrow('Required field');
    });

    it('should throw error when service returns database error', async () => {
      mockService.setShouldFail(true);
      await expect(legacyService.create({ name: 'test' })).rejects.toThrow('Mock database error');
    });
  });

  describe('update', () => {
    it('should return data when service returns success', async () => {
      const updateData = { name: 'updated name', email: 'updated@example.com' };
      const result = await legacyService.update(1, updateData);
      expect(result).toEqual({ id: 1, name: 'updated name', email: 'updated@example.com' });
    });

    it('should return null when service returns success with undefined', async () => {
      const updateData = { name: 'updated' };
      const customService = {
        update: async () => ok(undefined as TestEntity | undefined)
      } as unknown as IService<TestEntity, 'id'>;
      const customLegacy = new LegacyService(customService);

      const result = await customLegacy.update(999, updateData);
      expect(result).toBeNull();
    });

    it('should throw error when service returns not found error', async () => {
      const failingService = {
        update: async () => fail({ type: 'not_found', message: 'User not found', resource: 'user', id: 999 })
      } as unknown as IService<TestEntity, 'id'>;
      const failingLegacy = new LegacyService(failingService);

      await expect(failingLegacy.update(999, { name: 'test' })).rejects.toThrow('User not found');
    });

    it('should throw error when service returns validation error', async () => {
      const failingService = {
        update: async () => fail({ type: 'validation', field: 'name', message: 'Invalid name' })
      } as unknown as IService<TestEntity, 'id'>;
      const failingLegacy = new LegacyService(failingService);

      await expect(failingLegacy.update(1, { name: '' })).rejects.toThrow('Invalid name');
    });
  });

  describe('hardDelete', () => {
    it('should return true when service returns success', async () => {
      const result = await legacyService.hardDelete(1);
      expect(result).toBe(true);
    });

    it('should throw error when service returns not found error', async () => {
      const failingService = {
        hardDelete: async () => fail({ type: 'not_found', message: 'User not found', resource: 'user', id: 999 })
      } as unknown as IService<TestEntity, 'id'>;
      const failingLegacy = new LegacyService(failingService);

      await expect(failingLegacy.hardDelete(999)).rejects.toThrow('User not found');
    });

    it('should throw error when service returns database error', async () => {
      mockService.setShouldFail(true);
      await expect(legacyService.hardDelete(1)).rejects.toThrow('Mock database error');
    });
  });

  describe('softDelete', () => {
    it('should return true when service returns success', async () => {
      const result = await legacyService.softDelete(1);
      expect(result).toBe(true);
    });

    it('should throw error when service returns not found error', async () => {
      const failingService = {
        softDelete: async () => fail({ type: 'not_found', message: 'User not found', resource: 'user', id: 999 })
      } as unknown as IService<TestEntity, 'id'>;
      const failingLegacy = new LegacyService(failingService);

      await expect(failingLegacy.softDelete(999)).rejects.toThrow('User not found');
    });

    it('should throw error when service returns database error', async () => {
      mockService.setShouldFail(true);
      await expect(legacyService.softDelete(1)).rejects.toThrow('Mock database error');
    });
  });

  describe('restore', () => {
    it('should return true when service returns success', async () => {
      const result = await legacyService.restore(1);
      expect(result).toBe(true);
    });

    it('should throw error when service returns not found error', async () => {
      const failingService = {
        restore: async () => fail({ type: 'not_found', message: 'User not found', resource: 'user', id: 999 })
      } as unknown as IService<TestEntity, 'id'>;
      const failingLegacy = new LegacyService(failingService);

      await expect(failingLegacy.restore(999)).rejects.toThrow('User not found');
    });

    it('should throw error when service returns database error', async () => {
      mockService.setShouldFail(true);
      await expect(legacyService.restore(1)).rejects.toThrow('Mock database error');
    });
  });

  describe('count', () => {
    it('should return count when service returns success', async () => {
      const result = await legacyService.count();
      expect(result).toBe(2); // Initial mock has 2 entities
    });

    it('should return count when service returns success with different number', async () => {
      const customService = {
        count: async () => ok(42)
      } as IService<TestEntity, 'id'>;
      const customLegacy = new LegacyService(customService);

      const result = await customLegacy.count();
      expect(result).toBe(42);
    });

    it('should throw error when service returns database error', async () => {
      mockService.setShouldFail(true);
      await expect(legacyService.count()).rejects.toThrow('Mock database error');
    });
  });

  describe('mapToResponse', () => {
    it('should delegate to underlying service', async () => {
      const entity = { id: 1, name: 'test', email: 'test@example.com' };
      const result = await legacyService.mapToResponse(entity);
      expect(result).toEqual(entity);
    });

    it('should handle entities without optional fields', async () => {
      const entity = { id: 1, name: 'test' };
      const result = await legacyService.mapToResponse(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle different error types correctly', async () => {
      const databaseErrorService = {
        findAll: async () => fail({ type: 'database', message: 'Connection failed', code: 'ECONN' })
      } as IService<TestEntity, 'id'>;
      const validationErrorService = {
        findAll: async () => fail({ type: 'validation', field: 'email', message: 'Invalid email' })
      } as IService<TestEntity, 'id'>;
      const notFoundErrorService = {
        findAll: async () => fail({ type: 'not_found', message: 'Not found', resource: 'user', id: 1 })
      } as IService<TestEntity, 'id'>;

      const dbLegacy = new LegacyService(databaseErrorService);
      const validationLegacy = new LegacyService(validationErrorService);
      const notFoundLegacy = new LegacyService(notFoundErrorService);

      await expect(dbLegacy.findAll()).rejects.toThrow('Connection failed');
      await expect(validationLegacy.findAll()).rejects.toThrow('Invalid email');
      await expect(notFoundLegacy.findAll()).rejects.toThrow('Not found');
    });

    it('should preserve error messages exactly as provided', async () => {
      const errorServices = [
        {
          service: {
            findAll: async () => fail({ type: 'database', message: 'Database unavailable' })
          } as IService<TestEntity, 'id'>,
          expectedMessage: 'Database unavailable'
        },
        {
          service: {
            findAll: async () => fail({ type: 'validation', field: 'name', message: 'Name is required' })
          } as IService<TestEntity, 'id'>,
          expectedMessage: 'Name is required'
        },
        {
          service: {
            findAll: async () => fail({ type: 'not_found', message: 'Resource not found', resource: 'test', id: 1 })
          } as IService<TestEntity, 'id'>,
          expectedMessage: 'Resource not found'
        }
      ];

      for (const { service, expectedMessage } of errorServices) {
        const legacy = new LegacyService(service);
        await expect(legacy.findAll()).rejects.toThrow(expectedMessage);
      }
    });
  });
});