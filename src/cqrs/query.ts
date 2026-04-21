import type { IQuery, IQueryHandler, IQueryBus } from "./types";
import type { ServiceError } from "../exceptions/exceptions";

/**
 * Abstract base class for Query Handlers
 * Provides common functionality for executing queries
 * @template Q - The query type extending IQuery
 * @template R - The result type on success
 * @template E - The error type (defaults to ServiceError)
 * @template Q2 - Internal query type
 */
export abstract class QueryHandler<
  Q extends IQuery,
  R,
  E = ServiceError,
  Q2 extends IQuery = Q
> implements IQueryHandler<Q2, R, E>
{
  abstract readonly queryType: string;
  readonly _queryType!: string;

  get queryTypeName(): string {
    return this.queryType || (this as any).constructor.name;
  }

  async execute(query: Q2): Promise<R> {
    return this.handle(query);
  }

  /**
   * Implement this method to define query execution logic
   * @param query - The query to execute
   * @returns Promise resolving to the result
   */
  abstract handle(query: Q2): Promise<R>;
}

/**
 * In-memory Query Bus implementation
 * Stores handlers in a Map for lookup by query type
 * @template Q - Query type
 * @template R - Result type
 * @template E - Error type
 */
export class QueryBus<
  Q extends IQuery,
  R,
  E = ServiceError
> implements IQueryBus<Q, R, E>
{
  private handlers = new Map<string, IQueryHandler<IQuery, unknown, ServiceError>>();

  async dispatch(query: Q): Promise<R> {
    const handler = this.handlers.get(query.type) as
      | IQueryHandler<Q, R, E>
      | undefined;

    if (!handler) {
      return Promise.reject(
        new Error(`Query handler not found: ${query.type}`)
      ) as Promise<R>;
    }

    return handler.execute(query) as Promise<R>;
  }

  register<Q2 extends IQuery, R2, E2 = ServiceError>(
    handler: IQueryHandler<Q2, R2, E2>
  ): void {
    this.handlers.set(handler.queryType, handler as IQueryHandler<IQuery, unknown, ServiceError>);
  }
}

/**
 * Simple Query Builder for type-safe query creation
 * @template T - The query type string
 * @template P - The payload type (optional)
 */
export class Query<T extends string, P = undefined> implements IQuery {
  readonly type: T;
  readonly payload?: P;

  private constructor(type: T, payload?: P) {
    this.type = type;
    this.payload = payload;
  }

  static create<T extends string, P>(
    type: T,
    payload?: P
  ): Query<T, P> {
    return new Query(type, payload);
  }
}