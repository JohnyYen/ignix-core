import { ServiceError } from "../exceptions/exceptions";
import { IService } from "../services/service.interface";
import { APIRequest, APIResponse, IAPIHandler } from "./api.inteface";

/**
 * Maps ServiceError to appropriate HTTP status code
 * @param error - The service error to map
 * @returns HTTP status code
 */
const getStatusCode = <E>(error: E): number => {
  if (error && typeof error === "object" && "type" in error) {
    const err = error as unknown as ServiceError;
    if (err.type === "validation") return 400;
    if (err.type === "not_found") return 404;
    if (err.type === "database") return 500;
  }
  return 500;
};

/**
 * Abstract API handler class implementing IAPIHandler
 * Provides HTTP endpoint implementations that delegate to service operations
 * Handles Result pattern responses and converts them to appropriate HTTP status codes
 * @template T - The entity type
 * @template K - The key type for the entity's identifier field
 * @template CreateDto - The DTO type for creating entities
 * @template UpdateDto - The DTO type for updating entities
 * @template ResponseDto - The DTO type for response data
 * @template E - The error type for operation failures
 */


export abstract class APIHandler<
  T extends Record<K, number | string>,
  K extends keyof T,
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError,
> implements IAPIHandler<T, K, CreateDto, UpdateDto, ResponseDto, E> {
  /**
   * Constructor for the API handler
   * @param service - The service instance to delegate operations to
   */
  constructor(
    protected readonly service: IService<
      T,
      K,
      CreateDto,
      UpdateDto,
      ResponseDto,
      E
    >,
  ) {}
  /**
   * Handles GET request to retrieve all entities
   * @param req - The API request object
   * @param res - The API response object
   * @returns Promise that resolves when the response is sent
   */
  async findAll(
    req: APIRequest,
    res: APIResponse<ResponseDto[] | E>,
  ): Promise<void> {
    const result = await this.service.findAll();
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(getStatusCode(result.error)).json(result.error);
    }
  }
  /**
   * Handles GET request to retrieve a single entity by ID
   * @param req - The API request with identifier in params
   * @param res - The API response object
   * @returns Promise that resolves when the response is sent
   */
  async findById(
    req: APIRequest<{}, {}, Record<K, string | number>>,
    res: APIResponse<ResponseDto | null | E>,
  ): Promise<void> {
    const paramKey = Object.keys(req.params)[0] as K;
    const result = await this.service.findById(req.params[paramKey]);
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(getStatusCode(result.error)).json(result.error);
    }
  }
  /**
   * Handles GET request to find the first entity matching query criteria
   * @param req - The API request with query criteria
   * @param res - The API response object
   * @returns Promise that resolves when the response is sent
   */
  async findOne(
    req: APIRequest,
    res: APIResponse<ResponseDto | null | E>,
  ): Promise<void> {
    const result = await this.service.findOne(req.query);
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(getStatusCode(result.error)).json(result.error);
    }
  }
  /**
   * Handles POST request to create a new entity
   * @param req - The API request with CreateDto in body
   * @param res - The API response object
   * @returns Promise that resolves when the response is sent
   */
  async create(
    req: APIRequest<{}, CreateDto>,
    res: APIResponse<ResponseDto | E>,
  ): Promise<void> {
    const result = await this.service.create(req.body);
    if (result.type === "success") {
      res.status(201).json(result.data);
    } else {
      res.status(getStatusCode(result.error)).json(result.error);
    }
  }
  /**
   * Handles PUT (full replacement) or PATCH (partial update) request to update an existing entity
   * PUT: Requires all required fields - performs full replacement
   * PATCH: Accepts partial data - performs partial update
   * @param req - The API request with identifier in params and UpdateDto in body
   * @param res - The API response object
   * @returns Promise that resolves when the response is sent
   */
  async update(
    req: APIRequest<{}, UpdateDto, Record<K, string | number>>,
    res: APIResponse<ResponseDto | undefined | E>,
  ): Promise<void> {
    const paramKey = Object.keys(req.params)[0] as K;
    const result = await this.service.update(req.params[paramKey], req.body);
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(getStatusCode(result.error)).json(result.error);
    }
  }
  /**
   * Handles PATCH request to partially update an existing entity
   * Unlike PUT (full replacement), PATCH only updates the provided fields
   * Ideal for updating individual attributes without sending the entire resource
   * @param req - The API request with identifier in params and partial UpdateDto in body
   * @param res - The API response object
   * @returns Promise that resolves when the response is sent
   */
  async patch(
    req: APIRequest<{}, UpdateDto, Record<K, string | number>>,
    res: APIResponse<ResponseDto | undefined | E>,
  ): Promise<void> {
    const paramKey = Object.keys(req.params)[0] as K;
    // PATCH accepts partial data - the service handles the partial update logic
    const result = await this.service.update(req.params[paramKey], req.body);
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(getStatusCode(result.error)).json(result.error);
    }
  }
  /**
   * Handles DELETE request to soft delete an entity
   * @param req - The API request with identifier in params
   * @param res - The API response object
   * @returns Promise that resolves when the response is sent
   */
  async delete(
    req: APIRequest<{}, {}, Record<K, string | number>>,
    res: APIResponse<boolean | E>,
  ): Promise<void> {
    const paramKey = Object.keys(req.params)[0] as K;
    const result = await this.service.softDelete(req.params[paramKey]);
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(getStatusCode(result.error)).json(result.error);
    }
  }
  /**
   * Handles hard DELETE request to permanently remove an entity
   * Unlike softDelete, this permanently removes the entity from the database
   * @param req - The API request with identifier in params
   * @param res - The API response object
   * @returns Promise that resolves when the response is sent
   */
  async hardDelete(
    req: APIRequest<{}, {}, Record<K, string | number>>,
    res: APIResponse<boolean | E>,
  ): Promise<void> {
    const paramKey = Object.keys(req.params)[0] as K;
    const result = await this.service.hardDelete(req.params[paramKey]);
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(getStatusCode(result.error)).json(result.error);
    }
  }
}
