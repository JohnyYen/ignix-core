import { ServiceError } from "../exceptions/exceptions";
import { IService } from "../services/service.interface";
import { Result } from "../types/result";
import { APIRequest, APIResponse, IAPIHandler } from "./api.inteface";

export abstract class APIHandler<
  T extends { id: number | string },
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError,
> implements IAPIHandler<T, CreateDto, UpdateDto, ResponseDto, E> {
  constructor(
    protected readonly service: IService<
      T,
      CreateDto,
      UpdateDto,
      ResponseDto,
      E
    >,
  ) {}

  async findAll(
    req: APIRequest,
    res: APIResponse<Result<ResponseDto[], E>>,
  ): Promise<void> {
    const data = await this.service.findAll();
    if (data.type === "success") {
      res.status(200).json(data);
    } else {
      res.status(500).json(data);
    }
  }

  async findById(
    req: APIRequest<{}, {}, { id: string | number }>,
    res: APIResponse<Result<ResponseDto | null, E>>,
  ): Promise<void> {
    const data = await this.service.findById(req.params.id);
    if (data.type === "success") {
      return res.status(200).json(data);
    } else {
      res.status(500).json(data);
      // return res.status(500).json({ error: data.error, message: data.message });
    }
  }

  async findOne(
    req: APIRequest,
    res: APIResponse<Result<ResponseDto | null, E>>,
  ): Promise<void> {
    const data = await this.service.findOne(req.query);
    if (data.type === "success") return res.status(200).json(data);
    else res.status(500).json(data);
  }

  async create(
    req: APIRequest<{}, CreateDto, any>,
    res: APIResponse<Result<ResponseDto, E>>,
  ): Promise<void> {
    const body = req.body;
    const data = await this.service.create(body);
    if (data.type === "success") {
      return res.status(201).json(data);
    }
  }

  async update(
    req: APIRequest<{}, UpdateDto, { id: string | number }>,
    res: APIResponse<Result<ResponseDto | undefined, E>>,
  ): Promise<void> {
    const body = req.body;
    const data = await this.service.update(req.params.id, body);
    if (data.type === "success") {
      return res.status(200).json(data);
    }
  }

  async delete(
    req: APIRequest<{}, {}, { id: string | number }>,
    res: APIResponse<Result<boolean, E>>,
  ): Promise<void> {
    const data = await this.service.softDelete(req.params.id);
    if (data.type === "success") {
      return res.status(200).json(data);
    }
  }
}
