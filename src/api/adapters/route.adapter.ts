import { IAppFramework } from "../../middleware/middleware.interface";
import { IAPIHandler } from "../api.inteface";


/**
 * Creates REST API routes for a given API handler
 * Sets up standard CRUD routes: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
 * @template T - The entity type
 * @template CreateDto - The DTO type for creating entities
 * @template UpdateDto - The DTO type for updating entities
 * @template ResponseDto - The DTO type for response data
 * @template E - The error type for operation failures
 * @template K - The key type for the entity's identifier field
 * @param app - The application framework instance
 * @param handler - The API handler instance
 * @param route - The base route path (e.g., '/users')
 * @param routeKey - The parameter name for the identifier in routes (e.g., 'id')
 * @param middlewares - Optional middleware configurations for each route type
 * @returns The modified application framework instance
 */
export const createRoutes = <
  T extends Record<K, string | number>,
  CreateDto,
  UpdateDto,
  ResponseDto,
  E,
  K extends Extract<keyof T, string | number>,
>(
  app: IAppFramework,
  handler: IAPIHandler<T, K, CreateDto, UpdateDto, ResponseDto, E>,
  route: string,
  routeKey: K,
  middlewares?: Partial<{
    getAll: any[];
    getById: any[];
    create: any[];
    update: any[];
    delete: any[];
  }>
): IAppFramework => {

  app.get(
    `${route}`,
    ...(middlewares?.getAll ?? []),
    handler.findAll
  );

  app.get(
    `${route}/:${routeKey}`,
    ...(middlewares?.getById ?? []),
    handler.findById
  );

  app.post(
    `${route}`,
    ...(middlewares?.create ?? []),
    handler.create
  );

  app.put(
    `${route}/:${routeKey}`,
    ...(middlewares?.update ?? []),
    handler.update
  );

  app.delete(
    `${route}/:${routeKey}`,
    ...(middlewares?.delete ?? []),
    handler.delete
  );

  return app;
};
