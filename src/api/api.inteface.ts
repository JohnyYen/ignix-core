import { ServiceError } from "../exceptions/exceptions";
import { Result } from "../types/result";

/**
 * Interface representing an API request with typed query, body, and params
 * @template Query - The type of query parameters
 * @template Body - The type of request body
 * @template Params - The type of route parameters
 */
export interface APIRequest<Query = any, Body = any, Params = any> {
  query: Query;
  body: Body;
  params: Params;
}

/**
 * Interface representing an API response with methods to set status and send JSON
 * @template Data - The type of data to be sent in the response
 */
export interface APIResponse<Data = any> {
  status(code: number): this;
  json(data: Data): void;
}

/**
 * API handler interface for HTTP endpoints with typed requests and responses
 * Provides CRUD operations mapped to HTTP methods
 * @template T - The entity type
 * @template K - The key type for the entity's identifier field (id, slug, uuid, etc.)
 * @template CreateDto - The DTO type for creating entities (excludes the key K)
 * @template UpdateDto - The DTO type for updating entities
 * @template ResponseDto - The DTO type for response data
 * @template E - The error type for operation failures
 */
export interface IAPIHandler<
  T extends Record<K, string | number>,
  K extends keyof T,// K es la key que identifica T
  CreateDto = Omit<T, K>, // Excluimos la key K
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError,
> {
  /**
   * Handles GET request to retrieve all entities
   * Maps to IService.findAll operation
   * @param req - The API request object
   * @param res - The API response object for ResponseDto array
   */
  // Obtener todos los elementos
  findAll(req: APIRequest, res: APIResponse<ResponseDto[]>): Promise<void>;

  /**
   * Handles GET request to retrieve a single entity by its identifier
   * Maps to IService.findById operation
   * @param req - The API request with identifier in params
   * @param res - The API response object for single ResponseDto or null
   */
  // Obtener un elemento por la key K (id, slug, uuid, etc.)
  findById(
    req: APIRequest<{}, {}, Record<K, string | number>>,
    res: APIResponse<ResponseDto | null>,
  ): Promise<void>;

  /**
   * Handles GET request to find the first entity matching criteria
   * Maps to IService.findOne operation
   * @param req - The API request with query criteria
   * @param res - The API response object for single ResponseDto or null
   */
  // Obtener un solo elemento según algún criterio
  findOne(req: APIRequest, res: APIResponse<ResponseDto | null>): Promise<void>;

  /**
   * Handles POST request to create a new entity
   * Maps to IService.create operation
   * @param req - The API request with CreateDto in body
   * @param res - The API response object for created ResponseDto
   */
  // Crear un nuevo elemento
  create(
    req: APIRequest<{}, CreateDto>,
    res: APIResponse<ResponseDto>,
  ): Promise<void>;

  /**
   * Handles PUT/PATCH request to update an existing entity
   * Maps to IService.update operation
   * @param req - The API request with identifier in params and UpdateDto in body
   * @param res - The API response object for updated ResponseDto or undefined
   */
  // Actualizar un elemento por la key K
  update(
    req: APIRequest<{}, UpdateDto, Record<K, string | number>>,
    res: APIResponse<ResponseDto | undefined>,
  ): Promise<void>;

  /**
   * Handles DELETE request to remove an entity
   * Maps to IService.hardDelete operation
   * @param req - The API request with identifier in params
   * @param res - The API response object for deletion success boolean
   */
  // Eliminar un elemento por la key K
  delete(
    req: APIRequest<{}, {}, Record<K, string | number>>,
    res: APIResponse<boolean>,
  ): Promise<void>;
}
