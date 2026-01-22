import { ILegacyService } from "./service.interface";
import { IService } from "./service.interface";
import { ServiceError } from "../exceptions/exceptions";

/**
 * Legacy service class that adapts IService to ILegacyService
 * Converts Result-based responses to traditional exception-throwing behavior
 * Useful for backward compatibility with code expecting thrown errors
 * @template T - The entity type
 * @template CreateDto - The DTO type for creating entities
 * @template UpdateDto - The DTO type for updating entities
 * @template ResponseDto - The DTO type for response data
 * @template E - The error type for operation failures
 */
export class LegacyService<
  T extends Record<string, any>,
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError
> implements ILegacyService<T, keyof T, CreateDto, UpdateDto, ResponseDto, E> {
  /**
   * Constructor for the legacy service
   * @param service - The Result-based service to adapt
   */
  constructor(protected service: IService<T, keyof T, CreateDto, UpdateDto, ResponseDto, E>) {}

  /**
   * Finds all entities matching the provided options
   * @param options - Query options for filtering, sorting, pagination, etc.
   * @returns Promise resolving to an array of response DTOs
   * @throws {Error} If the operation fails
   */
  async findAll(options?: any): Promise<ResponseDto[]> {
    const result = await this.service.findAll(options);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  /**
   * Finds a single entity by its ID
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to the response DTO or null if not found
   * @throws {Error} If the operation fails
   */
  async findById(id: string | number): Promise<ResponseDto | null> {
    const result = await this.service.findById(id);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  /**
   * Finds the first entity matching the provided options
   * @param options - Query options for filtering
   * @returns Promise resolving to the response DTO or null if not found
   * @throws {Error} If the operation fails
   */
  async findOne(options: any): Promise<ResponseDto | null> {
    const result = await this.service.findOne(options);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  /**
   * Creates a new entity with the provided data
   * @param data - The creation DTO containing the data for the new entity
   * @returns Promise resolving to the created response DTO
   * @throws {Error} If the operation fails
   */
  async create(data: CreateDto): Promise<ResponseDto> {
    const result = await this.service.create(data);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  /**
   * Updates an existing entity with the provided data
   * @param id - The unique identifier of the entity to update
   * @param data - The update DTO containing the data to update
   * @returns Promise resolving to the updated response DTO or null if not found
   * @throws {Error} If the operation fails
   */
  async update(id: string | number, data: UpdateDto): Promise<ResponseDto | null> {
    const result = await this.service.update(id, data);
    if (result.type === "success") {
      return result.data || null;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  /**
   * Permanently deletes an entity (hard delete)
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving to true if deleted, false if not found
   * @throws {Error} If the operation fails
   */
  async hardDelete(id: string | number): Promise<boolean> {
    const result = await this.service.hardDelete(id);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  /**
   * Soft deletes an entity (marks as deleted without removing)
   * @param id - The unique identifier of the entity to soft delete
   * @returns Promise resolving to true if deleted, false if not found
   * @throws {Error} If the operation fails
   */
  async softDelete(id: string | number): Promise<boolean> {
    const result = await this.service.softDelete(id);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  /**
   * Restores a soft-deleted entity
   * @param id - The unique identifier of the entity to restore
   * @returns Promise resolving to true if restored, false if not found
   * @throws {Error} If the operation fails
   */
  async restore(id: string | number): Promise<boolean> {
    const result = await this.service.restore(id);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  /**
   * Counts entities matching the provided options
   * @param options - Query options for filtering
   * @returns Promise resolving to the count of matching entities
   * @throws {Error} If the operation fails
   */
  async count(options?: any): Promise<number> {
    const result = await this.service.count(options);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  /**
   * Maps an entity to its response DTO representation
   * Delegates to the underlying service implementation
   * @param entity - The entity to map
   * @returns Promise resolving to the response DTO
   */
  async mapToResponse(entity: T): Promise<ResponseDto> {
    return this.service.mapToResponse(entity);
  }
}