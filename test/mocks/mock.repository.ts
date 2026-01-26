import { IRepository } from '../../src/repositories/repository.interface';

export class MockRepository<T extends { id: number | string }> implements IRepository<T> {
  private entities: T[] = [];
  private createResult: T | null = null;
  private updateResult: T | null = null;
  private softDeleteResult: boolean | null = null;
  private hardDeleteResult: boolean | null = null;
  private restoreResult: boolean | null = null;
  private countResult: number = 0;
  private shouldError: boolean = false;
  private errorMessage: string = '';

  setMockData(entities: T[]) {
    this.entities = entities;
  }

  setMockCreateResult(entity: T) {
    this.createResult = entity;
  }

  setMockUpdateResult(entity: T | null) {
    this.updateResult = entity;
  }

  setMockSoftDeleteResult(result: boolean) {
    this.softDeleteResult = result;
  }

  setMockHardDeleteResult(result: boolean) {
    this.hardDeleteResult = result;
  }

  setMockRestoreResult(result: boolean) {
    this.restoreResult = result;
  }

  setMockCountResult(count: number) {
    this.countResult = count;
  }

  shouldThrowError(error: Error) {
    this.shouldError = true;
    this.errorMessage = error.message;
  }

  resetMocks() {
    this.entities = [];
    this.createResult = null;
    this.updateResult = null;
    this.softDeleteResult = null;
    this.hardDeleteResult = null;
    this.restoreResult = null;
    this.countResult = 0;
    this.shouldError = false;
    this.errorMessage = '';
  }

  async findAll(options?: any): Promise<T[]> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    return this.entities;
  }

  async findById(id: string | number): Promise<T | null> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    return this.entities.find(e => e.id === id) || null;
  }

  async findOne(options: any): Promise<T | null> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    return this.entities[0] || null;
  }

  async create(data: any): Promise<T> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    return this.createResult || (data as T);
  }

  async update(id: string | number, data: any): Promise<T | null> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    return this.updateResult;
  }

  async hardDelete(id: string | number): Promise<boolean> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    return this.hardDeleteResult !== null ? this.hardDeleteResult : true;
  }

  async softDelete(id: string | number): Promise<boolean> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    return this.softDeleteResult !== null ? this.softDeleteResult : true;
  }

  async restore(id: string | number): Promise<boolean> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    return this.restoreResult !== null ? this.restoreResult : true;
  }

  async count(options?: any): Promise<number> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    return this.countResult;
  }
}