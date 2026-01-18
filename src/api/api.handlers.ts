import { ServiceError } from "../exceptions/exceptions";
import { IService } from "../services/service.interface";
import { Result } from "../types/result";
import { APIRequest, APIResponse, IAPIHandler } from "./api.inteface";

export abstract class APIHandler<
  T extends Record<K, number | string>,
  K extends keyof T,
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError,
> implements IAPIHandler<T, K, CreateDto, UpdateDto, ResponseDto, E> {
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
  async update(
    req: APIRequest<{}, UpdateDto, Record<K, string | number>>,
    res: APIResponse<ResponseDto | undefined | E>,
  ): Promise<void> {
    const result = await this.service.update(req.params.id, req.body);
    if (result.type === "success") {
      res.status(200).json(result.data);
    } else {
      res.status(500).json(result.error);
    }
  }
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
