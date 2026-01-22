import { Result, ok, fail } from "../types/result";
import { IService } from "./service.interface";
import { IRepository } from "../repositories/repository.interface";
import { ServiceError, DatabaseError, NotFoundError, ValidationError } from "../exceptions/exceptions";

/**
 * Abstract base service class implementing IService
 * Provides a foundation for business logic services with Result-based error handling
 * Uses a repository for data access operations
 * @template T - The entity type with id field
 * @template CreateDto - The DTO type for creating entities
 * @template UpdateDto - The DTO type for updating entities
 * @template ResponseDto - The DTO type for response data
 * @template E - The error type for operation failures
 */
export abstract class BaseService<
  T extends { id: string | number; [key: string]: any },
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError
> implements IService<T, keyof T, CreateDto, UpdateDto, ResponseDto, E> {
  /**
   * Constructor for the base service
   * @param repo - The repository instance for data access
   */
  constructor(protected repo: IRepository<T>) {}

  /**
   * Finds all entities matching the provided options
   * Maps entities to response DTOs and wraps result in Result pattern
   * @param options - Query options for filtering, sorting, pagination, etc.
   * @returns Promise resolving to a Result containing an array of response DTOs
   */
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

  /**
   * Finds a single entity by its ID
   * Returns NotFoundError if entity doesn't exist, otherwise maps to response DTO
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to a Result containing the response DTO or null if not found
   */
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

  /**
   * Finds the first entity matching the provided options
   * Returns null if no entity matches, otherwise maps to response DTO
   * @param options - Query options for filtering
   * @returns Promise resolving to a Result containing the response DTO or null if not found
   */
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

  /**
   * Creates a new entity with the provided data
   * Performs basic validation and maps the created entity to response DTO
   * @param data - The creation DTO containing the data for the new entity
   * @returns Promise resolving to a Result containing the created response DTO
   */
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

  /**
   * Updates an existing entity with the provided data
   * Performs basic validation and returns NotFoundError if entity doesn't exist
   * @param id - The unique identifier of the entity to update
   * @param data - The update DTO containing the data to update
   * @returns Promise resolving to a Result containing the updated response DTO or undefined if not found
   */
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

  /**
   * Permanently deletes an entity (hard delete)
   * Returns NotFoundError if entity doesn't exist
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving to a Result containing true if deleted, false if not found
   */
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

  /**
   * Soft deletes an entity (marks as deleted without removing)
   * Returns NotFoundError if entity doesn't exist
   * @param id - The unique identifier of the entity to soft delete
   * @returns Promise resolving to a Result containing true if deleted, false if not found
   */
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

  /**
   * Restores a soft-deleted entity
   * Returns NotFoundError if entity doesn't exist
   * @param id - The unique identifier of the entity to restore
   * @returns Promise resolving to a Result containing true if restored, false if not found
   */
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

  /**
   * Counts entities matching the provided options
   * @param options - Query options for filtering
   * @returns Promise resolving to a Result containing the count of matching entities
   */
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

  /**
   * Maps an entity to its response DTO representation
   * Default implementation returns the entity as-is, can be overridden for custom mapping
   * @param entity - The entity to map
   * @returns Promise resolving to the response DTO
   */
  async mapToResponse(entity: T): Promise<ResponseDto> {
    // Default: return entity as ResponseDto (can be overridden)
    return entity as unknown as ResponseDto;
  }

  /**
   * Gets the name of the resource for error messages
   * Can be overridden in subclasses to provide specific resource names
   * @returns The resource name string
   */
  protected getResourceName(): string {
    // Default resource name; can be overridden
    return "resource";
  }
}