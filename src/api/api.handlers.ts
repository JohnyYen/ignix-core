import { ServiceError } from "../exceptions/exceptions";
import { IService } from "../services/service.interface";
import { APIRequest, APIResponse, IAPIHandler } from "./api.inteface";

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
   * Returns 200 with data array on success, 500 with error on failure
   * @param req - The API request object
   * @param res - The API response object
   */
  async findAll(
    req: APIRequest,
    res: APIResponse<ResponseDto[] | E>,
  ): Promise<void> {
    const result = await this.service.findAll();
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(500).json(result.error);
    }
  }
  /**
   * Handles GET request to retrieve a single entity by ID
   * Returns 200 with entity data on success, 500 with error on failure
   * @param req - The API request with identifier in params
   * @param res - The API response object
   */
  async findById(
    req: APIRequest<{}, {}, Record<K, string | number>>,
    res: APIResponse<ResponseDto | null | E>,
  ): Promise<void> {
    const result = await this.service.findById(req.params.id);
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(500).json(result.error);
    }
  }
  /**
   * Handles GET request to find the first entity matching query criteria
   * Returns 200 with entity data on success, 500 with error on failure
   * @param req - The API request with query criteria
   * @param res - The API response object
   */
  async findOne(
    req: APIRequest,
    res: APIResponse<ResponseDto | null | E>,
  ): Promise<void> {
    const result = await this.service.findOne(req.query);
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(500).json(result.error);
    }
  }
  /**
   * Handles POST request to create a new entity
   * Returns 201 with created entity data on success, 500 with error on failure
   * @param req - The API request with CreateDto in body
   * @param res - The API response object
   */
  async create(
    req: APIRequest<{}, CreateDto>,
    res: APIResponse<ResponseDto | E>,
  ): Promise<void> {
    const result = await this.service.create(req.body);
    if (result.type === "success") {
      res.status(201).json(result.data);
    } else {
      res.status(500).json(result.error);
    }
  }
  /**
   * Handles PUT/PATCH request to update an existing entity
   * Returns 200 with updated entity data on success, 500 with error on failure
   * @param req - The API request with identifier in params and UpdateDto in body
   * @param res - The API response object
   */
  async update(
    req: APIRequest<{}, UpdateDto, Record<K, string | number>>,
    res: APIResponse<ResponseDto | undefined | E>,
  ): Promise<void> {
    const result = await this.service.update(req.params.id, req.body);
    if (result.type === "success") {
      res.status(200).json(result.data);
         } else {
      res.status(500).json(result.error);
    }
  }
  /**
   * Handles DELETE request to soft delete an entity
   * Returns 200 with deletion success boolean on success, 500 with error on failure
   * @param req - The API request with identifier in params
   * @param res - The API response object
   */
  async delete(
    req: APIRequest<{}, {}, Record<K, string | number>>,
    res: APIResponse<boolean | E>,
  ): Promise<void> {
    const result = await this.service.softDelete(req.params.id);
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(500).json(result.error);
    }
  }
}
