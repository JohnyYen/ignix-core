export interface IMiddleware {
  (req: any, res: any, next: Function): void;
}

export interface IAppFramework {
  get(path: string, ...handlers: IMiddleware[]): void;
  post(path: string, ...handlers: IMiddleware[]): void;
  put(path: string, ...handlers: IMiddleware[]): void;
  delete(path: string, ...handlers: IMiddleware[]): void;
  patch(path: string, ...handlers: IMiddleware[]): void;

  use(middleware: IMiddleware): void;
  use(path: string, middleware: IMiddleware): void;
}
