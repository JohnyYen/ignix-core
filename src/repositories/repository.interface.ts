/**
 * Repository interface for data persistence operations
 * Provides CRUD operations and query methods for entities
 * @template T - The entity type, must have an 'id' field
 */
export interface IRepository<T extends { id: number | string }> {
  /**
   * Finds all entities matching the provided options
   * @param options - Query options for filtering, sorting, pagination, etc.
   * @returns Promise resolving to an array of entities
   */
  findAll(options?: any): Promise<T[]>;

  /**
   * Finds a single entity by its ID
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to the entity or null if not found
   */
  findById(id: string | number): Promise<T | null>;

  /**
   * Finds the first entity matching the provided options
   * @param options - Query options for filtering
   * @returns Promise resolving to the entity or null if not found
   */
  findOne(options: any): Promise<T | null>;

  /**
   * Creates a new entity with the provided data
   * @param data - The data to create the entity with
   * @returns Promise resolving to the created entity
   */
  create(data: any): Promise<T>;

  /**
   * Updates an existing entity with the provided data
   * @param id - The unique identifier of the entity to update
   * @param data - The data to update the entity with
   * @returns Promise resolving to the updated entity or null if not found
   */
  update(id: string | number, data: any): Promise<T | null>;

  /**
   * Permanently deletes an entity (hard delete)
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  hardDelete(id: string | number): Promise<boolean>;

  /**
   * Soft deletes an entity (marks as deleted without removing)
   * @param id - The unique identifier of the entity to soft delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  softDelete(id: string | number): Promise<boolean>;

  /**
   * Restores a soft-deleted entity
   * @param id - The unique identifier of the entity to restore
   * @returns Promise resolving to true if restored, false if not found
   */
  restore(id: string | number): Promise<boolean>;

  /**
   * Counts entities matching the provided options
   * @param options - Query options for filtering
   * @returns Promise resolving to the count of matching entities
   */
  count(options?: any): Promise<number>;
}

/**
 * Abstract base repository class that implements IRepository
 * Provides a foundation for concrete repository implementations
 * @template T - The entity type, must have an 'id' field
 */
export abstract class BaseRepository<T extends { id: number | string }> implements IRepository<T> {
  /**
   * Constructor for the base repository
   * @param client - The database client or connection object
   */
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