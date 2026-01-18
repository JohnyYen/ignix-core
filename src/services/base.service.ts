import { Result, ok, fail } from "../types/result";
import { IService } from "./service.interface";
import { IRepository } from "../repositories/repository.interface";
import { ServiceError, DatabaseError, NotFoundError, ValidationError } from "../exceptions/exceptions";

export abstract class BaseService<
  T extends { id: string | number; [key: string]: any },
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError
> implements IService<T, keyof T, CreateDto, UpdateDto, ResponseDto, E> {
  constructor(protected repo: IRepository<T>) {}

  async findAll(options?: any): Promise<Result<ResponseDto[], E>> {
    try {
      const entities = await this.repo.findAll(options);
      const responses = await Promise.all(entities.map(e => this.mapToResponse(e)));
      return ok(responses);
    } catch (error) {
      return fail({
        type: "database",
        message: error instanceof Error ? error.message : "Database error",
      } as E);
    }
  }

  async findById(id: string | number): Promise<Result<ResponseDto | null, E>> {
    try {
      const entity = await this.repo.findById(id);
      if (!entity) {
        return fail({
          type: "not_found",
          message: `${this.getResourceName()} with id ${id} not found`,
          resource: this.getResourceName(),
          id,
        } as E);
      }
      const response = await this.mapToResponse(entity);
      return ok(response);
    } catch (error) {
      return fail({
        type: "database",
        message: error instanceof Error ? error.message : "Database error",
      } as E);
    }
  }

  async findOne(options: any): Promise<Result<ResponseDto | null, E>> {
    try {
      const entity = await this.repo.findOne(options);
      if (!entity) return ok(null);
      const response = await this.mapToResponse(entity);
      return ok(response);
    } catch (error) {
      return fail({
        type: "database",
        message: error instanceof Error ? error.message : "Database error",
      } as E);
    }
  }

  async create(data: CreateDto): Promise<Result<ResponseDto, E>> {
    try {
      // Basic validation
      if (!data || Object.keys(data).length === 0) {
        return fail({
          type: "validation",
          field: "data",
          message: "Create data cannot be empty",
        } as E);
      }
      const entity = await this.repo.create(data as any);
      const response = await this.mapToResponse(entity);
      return ok(response);
    } catch (error) {
      return fail({
        type: "database",
        message: error instanceof Error ? error.message : "Database error",
      } as E);
    }
  }

  async update(id: string | number, data: UpdateDto): Promise<Result<ResponseDto | undefined, E>> {
    try {
      // Basic validation
      if (!data || Object.keys(data).length === 0) {
        return fail({
          type: "validation",
          field: "data",
          message: "Update data cannot be empty",
        } as E);
      }
      const entity = await this.repo.update(id, data as any);
      if (!entity) {
        return fail({
          type: "not_found",
          message: `${this.getResourceName()} with id ${id} not found`,
          resource: this.getResourceName(),
          id,
        } as E);
      }
      const response = await this.mapToResponse(entity);
      return ok(response);
    } catch (error) {
      return fail({
        type: "database",
        message: error instanceof Error ? error.message : "Database error",
      } as E);
    }
  }

  async hardDelete(id: string | number): Promise<Result<boolean, E>> {
    try {
      const success = await this.repo.hardDelete(id);
      if (!success) {
        return fail({
          type: "not_found",
          message: `${this.getResourceName()} with id ${id} not found`,
          resource: this.getResourceName(),
          id,
        } as E);
      }
      return ok(true);
    } catch (error) {
      return fail({
        type: "database",
        message: error instanceof Error ? error.message : "Database error",
      } as E);
    }
  }

  async softDelete(id: string | number): Promise<Result<boolean, E>> {
    try {
      const success = await this.repo.softDelete(id);
      if (!success) {
        return fail({
          type: "not_found",
          message: `${this.getResourceName()} with id ${id} not found`,
          resource: this.getResourceName(),
          id,
        } as E);
      }
      return ok(true);
    } catch (error) {
      return fail({
        type: "database",
        message: error instanceof Error ? error.message : "Database error",
      } as E);
    }
  }

  async restore(id: string | number): Promise<Result<boolean, E>> {
    try {
      const success = await this.repo.restore(id);
      if (!success) {
        return fail({
          type: "not_found",
          message: `${this.getResourceName()} with id ${id} not found`,
          resource: this.getResourceName(),
          id,
        } as E);
      }
      return ok(true);
    } catch (error) {
      return fail({
        type: "database",
        message: error instanceof Error ? error.message : "Database error",
      } as E);
    }
  }

  async count(options?: any): Promise<Result<number, E>> {
    try {
      const count = await this.repo.count(options);
      return ok(count);
    } catch (error) {
      return fail({
        type: "database",
        message: error instanceof Error ? error.message : "Database error",
      } as E);
    }
  }

  async mapToResponse(entity: T): Promise<ResponseDto> {
    // Default: return entity as ResponseDto (can be overridden)
    return entity as unknown as ResponseDto;
  }

  protected getResourceName(): string {
    // Default resource name; can be overridden
    return "resource";
  }
}