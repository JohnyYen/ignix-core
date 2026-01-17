import { ServiceError } from "../exceptions/exceptions";
import { Result } from "../types/result";

export interface APIRequest<Query = any, Body = any, Params = any> {
  query: Query;
  body: Body;
  params: Params;
}

export interface APIResponse<Data = any> {
  status(code: number): this;
  json(data: Data): void;
}

export interface IAPIHandler<
  T extends { id: number | string },
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError,
> {
  findAll(
    req: APIRequest,
    res: APIResponse<Result<ResponseDto[], E>>,
  ): Promise<void>;

  findById(
    req: APIRequest<{}, {}, { id: string | number }>,
    res: APIResponse<Result<ResponseDto, E>>,
  ): Promise<void>;

  findOne(
    req: APIRequest,
    res: APIResponse<Result<ResponseDto, E>>,
  ): Promise<void>;

  create(
    req: APIRequest<{}, CreateDto>,
    res: APIResponse<Result<ResponseDto, E>>,
  ): Promise<void>;

  update(
    req: APIRequest<{}, UpdateDto, { id: string | number }>,
    res: APIResponse<Result<ResponseDto, E>>,
  ): Promise<void>;

  delete(
    req: APIRequest<{}, {}, { id: string | number }>,
    res: APIResponse<Result<boolean, E>>,
  ): Promise<void>;
}
