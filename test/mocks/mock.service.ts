import { IService } from '../../src/services/service.interface';
import { Result, ok, fail } from '../../src/types/result';
import { ServiceError } from '../../src/exceptions/exceptions';

export class MockService<T extends { id: number | string }> 
  implements IService<T, 'id', Omit<T, 'id'>, Partial<T>, T, ServiceError> {
  
  constructor(private mockEntities: T[] = [], private shouldFail: boolean = false) {}

  setMockEntities(entities: T[]) {
    this.mockEntities = entities;
  }

  setShouldFail(shouldFail: boolean) {
    this.shouldFail = shouldFail;
  }

  async findAll(options?: any): Promise<Result<T[], ServiceError>> {
    if (this.shouldFail) {
      return fail({
        type: 'database',
        message: 'Mock database error'
      });
    }
    return ok(this.mockEntities);
  }

  async findById(id: string | number): Promise<Result<T | null, ServiceError>> {
    if (this.shouldFail) {
      return fail({
        type: 'database',
        message: 'Mock database error'
      });
    }
    const entity = this.mockEntities.find(e => e.id === id) || null;
    return ok(entity);
  }

  async findOne(options: any): Promise<Result<T | null, ServiceError>> {
    if (this.shouldFail) {
      return fail({
        type: 'database',
        message: 'Mock database error'
      });
    }
    return ok(this.mockEntities[0] || null);
  }

  async create(data: Omit<T, 'id'>): Promise<Result<T, ServiceError>> {
    if (this.shouldFail) {
      return fail({
        type: 'database',
        message: 'Mock database error'
      });
    }
    const newEntity = { ...data, id: Date.now() } as T;
    this.mockEntities.push(newEntity);
    return ok(newEntity);
  }

  async update(id: string | number, data: Partial<T>): Promise<Result<T | undefined, ServiceError>> {
    if (this.shouldFail) {
      return fail({
        type: 'database',
        message: 'Mock database error'
      });
    }
    const index = this.mockEntities.findIndex(e => e.id === id);
    if (index === -1) {
      return fail({
        type: 'not_found',
        message: `Entity with id ${id} not found`,
        resource: 'entity',
        id
      });
    }
    const updatedEntity = { ...this.mockEntities[index], ...data };
    this.mockEntities[index] = updatedEntity;
    return ok(updatedEntity);
  }

  async hardDelete(id: string | number): Promise<Result<boolean, ServiceError>> {
    if (this.shouldFail) {
      return fail({
        type: 'database',
        message: 'Mock database error'
      });
    }
    const index = this.mockEntities.findIndex(e => e.id === id);
    if (index === -1) {
      return fail({
        type: 'not_found',
        message: `Entity with id ${id} not found`,
        resource: 'entity',
        id
      });
    }
    this.mockEntities.splice(index, 1);
    return ok(true);
  }

  async softDelete(id: string | number): Promise<Result<boolean, ServiceError>> {
    if (this.shouldFail) {
      return fail({
        type: 'database',
        message: 'Mock database error'
      });
    }
    const entity = this.mockEntities.find(e => e.id === id);
    if (!entity) {
      return fail({
        type: 'not_found',
        message: `Entity with id ${id} not found`,
        resource: 'entity',
        id
      });
    }
    return ok(true);
  }

  async restore(id: string | number): Promise<Result<boolean, ServiceError>> {
    if (this.shouldFail) {
      return fail({
        type: 'database',
        message: 'Mock database error'
      });
    }
    const entity = this.mockEntities.find(e => e.id === id);
    if (!entity) {
      return fail({
        type: 'not_found',
        message: `Entity with id ${id} not found`,
        resource: 'entity',
        id
      });
    }
    return ok(true);
  }

  async count(options?: any): Promise<Result<number, ServiceError>> {
    if (this.shouldFail) {
      return fail({
        type: 'database',
        message: 'Mock database error'
      });
    }
    return ok(this.mockEntities.length);
  }

  async mapToResponse(entity: T): Promise<T> {
    return entity;
  }
}