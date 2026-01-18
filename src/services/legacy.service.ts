import { ILegacyService } from "./service.interface";
import { IService } from "./service.interface";
import { ServiceError } from "../exceptions/exceptions";

export class LegacyService<
  T extends Record<string, any>,
  CreateDto = Omit<T, "id">,
  UpdateDto = Partial<T>,
  ResponseDto = T,
  E = ServiceError
> implements ILegacyService<T, keyof T, CreateDto, UpdateDto, ResponseDto, E> {
  constructor(protected service: IService<T, keyof T, CreateDto, UpdateDto, ResponseDto, E>) {}

  async findAll(options?: any): Promise<ResponseDto[]> {
    const result = await this.service.findAll(options);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  async findById(id: string | number): Promise<ResponseDto | null> {
    const result = await this.service.findById(id);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  async findOne(options: any): Promise<ResponseDto | null> {
    const result = await this.service.findOne(options);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  async create(data: CreateDto): Promise<ResponseDto> {
    const result = await this.service.create(data);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  async update(id: string | number, data: UpdateDto): Promise<ResponseDto | null> {
    const result = await this.service.update(id, data);
    if (result.type === "success") {
      return result.data || null;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  async hardDelete(id: string | number): Promise<boolean> {
    const result = await this.service.hardDelete(id);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  async softDelete(id: string | number): Promise<boolean> {
    const result = await this.service.softDelete(id);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  async restore(id: string | number): Promise<boolean> {
    const result = await this.service.restore(id);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  async count(options?: any): Promise<number> {
    const result = await this.service.count(options);
    if (result.type === "success") {
      return result.data;
    } else {
      throw new Error((result.error as ServiceError).message);
    }
  }

  async mapToResponse(entity: T): Promise<ResponseDto> {
    return this.service.mapToResponse(entity);
  }
}