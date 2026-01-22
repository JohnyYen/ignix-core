import { ServiceError } from "../exceptions/exceptions";
import { ICreateDto, IUpdateDto } from "../types/dto";
import { Result } from "../types/result";

/**
 * Service interface providing business logic operations with error handling
 * Uses Result pattern for consistent error handling across operations
 * @template T - The entity type
 * @template K - The key type for the entity's ID field
 * @template CreateDto - The DTO type for creating entities
 * @template UpdateDto - The DTO type for updating entities
 * @template ResponseDto - The DTO type for response data
 * @template E - The error type for operation failures
 */
export interface IService<
  T extends Record<K, string | number>,
  K extends keyof T,
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError
> {
  /**
   * Finds all entities matching the provided options
   * @param options - Query options for filtering, sorting, pagination, etc.
   * @returns Promise resolving to a Result containing an array of response DTOs
   */
  findAll(options?: any): Promise<Result<ResponseDto[], E>>;

  /**
   * Finds a single entity by its ID
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to a Result containing the response DTO or null if not found
   */
  findById(id: number | string): Promise<Result<ResponseDto | null, E>>;

  /**
   * Finds the first entity matching the provided options
   * @param options - Query options for filtering
   * @returns Promise resolving to a Result containing the response DTO or null if not found
   */
  findOne(options: any): Promise<Result<ResponseDto | null, E>>;

  /**
   * Creates a new entity with the provided data
   * @param data - The creation DTO containing the data for the new entity
   * @returns Promise resolving to a Result containing the created response DTO
   */
  create(data: CreateDto): Promise<Result<ResponseDto, E>>;

  /**
   * Updates an existing entity with the provided data
   * @param id - The unique identifier of the entity to update
   * @param data - The update DTO containing the data to update
   * @returns Promise resolving to a Result containing the updated response DTO or undefined if not found
   */
  update(
    id: number | string,
    data: UpdateDto
  ): Promise<Result<ResponseDto | undefined, E>>;

  /**
   * Permanently deletes an entity (hard delete)
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving to a Result containing true if deleted, false if not found
   */
  hardDelete(id: number | string): Promise<Result<boolean, E>>;

  /**
   * Soft deletes an entity (marks as deleted without removing)
   * @param id - The unique identifier of the entity to soft delete
   * @returns Promise resolving to a Result containing true if deleted, false if not found
   */
  softDelete(id: number | string): Promise<Result<boolean, E>>;

  /**
   * Restores a soft-deleted entity
   * @param id - The unique identifier of the entity to restore
   * @returns Promise resolving to a Result containing true if restored, false if not found
   */
  restore(id: number | string): Promise<Result<boolean, E>>;

  /**
   * Counts entities matching the provided options
   * @param options - Query options for filtering
   * @returns Promise resolving to a Result containing the count of matching entities
   */
  count(options?: any): Promise<Result<number, E>>;

  /**
   * Maps an entity to its response DTO representation
   * @param entity - The entity to map
   * @returns Promise resolving to the response DTO
   */
  mapToResponse(entity: T): Promise<ResponseDto>;
}

/**
 * Legacy service interface providing business logic operations without Result pattern
 * Uses traditional promise-based error handling (throws exceptions)
 * @template T - The entity type
 * @template K - The key type for the entity's ID field
 * @template CreateDto - The DTO type for creating entities
 * @template UpdateDto - The DTO type for updating entities
 * @template ResponseDto - The DTO type for response data
 * @template E - The error type for operation failures (not used in legacy interface)
 */
export interface ILegacyService<
  T extends Record<K, string | number>,
  K extends keyof T,
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError
> {
  /**
   * Finds all entities matching the provided options
   * @param options - Query options for filtering, sorting, pagination, etc.
   * @returns Promise resolving to an array of response DTOs
   * @throws {Error} If the operation fails
   */
  findAll(options?: any): Promise<ResponseDto[]>;

  /**
   * Finds a single entity by its ID
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to the response DTO or null if not found
   * @throws {Error} If the operation fails
   */
  findById(id: number | string): Promise<ResponseDto | null>;

  /**
   * Finds the first entity matching the provided options
   * @param options - Query options for filtering
   * @returns Promise resolving to the response DTO or null if not found
   * @throws {Error} If the operation fails
   */
  findOne(options: any): Promise<ResponseDto | null>;

  /**
   * Creates a new entity with the provided data
   * @param data - The creation DTO containing the data for the new entity
   * @returns Promise resolving to the created response DTO
   * @throws {Error} If the operation fails
   */
  create(data: CreateDto): Promise<ResponseDto>;

  /**
   * Updates an existing entity with the provided data
   * @param id - The unique identifier of the entity to update
   * @param data - The update DTO containing the data to update
   * @returns Promise resolving to the updated response DTO or null if not found
   * @throws {Error} If the operation fails
   */
  update(id: number | string, data: UpdateDto): Promise<ResponseDto | null>;

  /**
   * Permanently deletes an entity (hard delete)
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving to true if deleted, false if not found
   * @throws {Error} If the operation fails
   */
  hardDelete(id: number | string): Promise<boolean>;

  /**
   * Soft deletes an entity (marks as deleted without removing)
   * @param id - The unique identifier of the entity to soft delete
   * @returns Promise resolving to true if deleted, false if not found
   * @throws {Error} If the operation fails
   */
  softDelete(id: number | string): Promise<boolean>;

  /**
   * Restores a soft-deleted entity
   * @param id - The unique identifier of the entity to restore
   * @returns Promise resolving to true if restored, false if not found
   * @throws {Error} If the operation fails
   */
  restore(id: number | string): Promise<boolean>;

  /**
   * Counts entities matching the provided options
   * @param options - Query options for filtering
   * @returns Promise resolving to the count of matching entities
   * @throws {Error} If the operation fails
   */
  count(options?: any): Promise<number>;

  /**
   * Maps an entity to its response DTO representation
   * @param entity - The entity to map
   * @returns Promise resolving to the response DTO
   */
  mapToResponse(entity: T): Promise<ResponseDto>;
}
