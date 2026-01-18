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
  T extends Record<K, string | number>,
  K extends keyof T,// K es la key que identifica T
  CreateDto = Omit<T, K>, // Excluimos la key K
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError,
> {
  // Obtener todos los elementos
  findAll(req: APIRequest, res: APIResponse<ResponseDto[]>): Promise<void>;

  // Obtener un elemento por la key K (id, slug, uuid, etc.)
  findById(
    req: APIRequest<{}, {}, Record<K, string | number>>,
    res: APIResponse<ResponseDto | null>,
  ): Promise<void>;

  // Obtener un solo elemento según algún criterio
  findOne(req: APIRequest, res: APIResponse<ResponseDto | null>): Promise<void>;

  // Crear un nuevo elemento
  create(
    req: APIRequest<{}, CreateDto>,
    res: APIResponse<ResponseDto>,
  ): Promise<void>;

  // Actualizar un elemento por la key K
  update(
    req: APIRequest<{}, UpdateDto, Record<K, string | number>>,
    res: APIResponse<ResponseDto | undefined>,
  ): Promise<void>;

  // Eliminar un elemento por la key K
  delete(
    req: APIRequest<{}, {}, Record<K, string | number>>,
    res: APIResponse<boolean>,
  ): Promise<void>;
}
