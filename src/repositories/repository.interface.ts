export interface IRepository<T extends { id: number | string }> {
  findAll(options?: any): Promise<T[]>;
  findById(id: string | number): Promise<T | null>;
  findOne(options: any): Promise<T | null>;
  create(data: any): Promise<T>;
  update(id: string | number, data: any): Promise<T | null>;
  hardDelete(id: string | number): Promise<boolean>;
  softDelete(id: string | number): Promise<boolean>;
  restore(id: string | number): Promise<boolean>;
  count(options?: any): Promise<number>;
}

export abstract class BaseRepository<T extends { id: number | string }> implements IRepository<T> {
  constructor(protected client: any) {}

  abstract findAll(options?: any): Promise<T[]>;
  abstract findById(id: string | number): Promise<T | null>;
  abstract findOne(options: any): Promise<T | null>;
  abstract create(data: any): Promise<T>;
  abstract update(id: string | number, data: any): Promise<T | null>;
  abstract hardDelete(id: string | number): Promise<boolean>;
  abstract softDelete(id: string | number): Promise<boolean>;
  abstract restore(id: string | number): Promise<boolean>;
  abstract count(options?: any): Promise<number>;
}