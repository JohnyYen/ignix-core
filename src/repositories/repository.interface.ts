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