// Services
export { IService, ILegacyService } from "./services/service.interface";
export { BaseService } from "./services/base.service";
export { LegacyService } from "./services/legacy.service";

// Repositories
export {
  IRepository,
  BaseRepository,
} from "./repositories/repository.interface";

// API
export { IAPIHandler, APIRequest, APIResponse } from "./api/api.inteface";
export { APIHandler } from "./api/api.handlers";
export * from "./api/adapters/route.adapter";

// Types
export { Result, ok, fail } from "./types/result";
export type { ICreateDto, IUpdateDto } from "./types/dto";

// Exceptions
export {
  ServiceError,
  DatabaseError,
  ValidationError,
  NotFoundError,
} from "./exceptions/exceptions";

// Middleware
export * from "./middleware/middleware.interface";

// Utils
export * from "./utils/utils";
