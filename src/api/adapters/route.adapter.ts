import { IAppFramework } from "../../middleware/middleware.interface";
import { IAPIHandler } from "../api.inteface";

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
