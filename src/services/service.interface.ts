import { ServiceError } from "../exceptions/exceptions";
import { ICreateDto, IUpdateDto } from "../types/dto";
import { Result } from "../types/result";

export interface IService<
  T extends Record<K, string | number>,
  K extends keyof T,
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError
> {
  findAll(options?: any): Promise<Result<ResponseDto[], E>>;
  findById(id: number | string): Promise<Result<ResponseDto | null, E>>;
  findOne(options: any): Promise<Result<ResponseDto | null, E>>;
  create(data: CreateDto): Promise<Result<ResponseDto, E>>;
  update(
    id: number | string,
    data: UpdateDto
  ): Promise<Result<ResponseDto | undefined, E>>;
  hardDelete(id: number | string): Promise<Result<boolean, E>>;
  softDelete(id: number | string): Promise<Result<boolean, E>>;
  restore(id: number | string): Promise<Result<boolean, E>>;
  count(options?: any): Promise<Result<number, E>>;

  mapToResponse(entity: T): Promise<ResponseDto>;
}

export interface ILegacyService<
  T extends Record<K, string | number>,
  K extends keyof T,
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError
> {
  findAll(options?: any): Promise<ResponseDto[]>;
  findById(id: number | string): Promise<ResponseDto | null>;
  findOne(options: any): Promise<ResponseDto | null>;
  create(data: CreateDto): Promise<ResponseDto>;
  update(id: number | string, data: UpdateDto): Promise<ResponseDto | null>;
  hardDelete(id: number | string): Promise<boolean>;
  softDelete(id: number | string): Promise<boolean>;
  restore(id: number | string): Promise<boolean>;
  count(options?: any): Promise<number>;
  mapToResponse(entity: T): Promise<ResponseDto>;
}
