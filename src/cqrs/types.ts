/**
 * CQRS Types - Command and Query definitions
 * @template C - Command type
 * @template R - Result type
 */

import type { Result, SuccessResult, FailureResult } from "../types/result";
import { ok, fail, isSuccess, isFailure, map, flatMap } from "../types/result";
import type { ServiceError } from "../exceptions/exceptions";

// Re-export for convenience
export type { Result, SuccessResult, FailureResult };
export { ok, fail, isSuccess, isFailure, map, flatMap };
export type { ServiceError };

/**
 * Base interface for all Commands
 * Commands represent intent to change state
 */
export interface ICommand {
  readonly type: string;
  readonly payload: unknown;
}

/**
 * Base interface for all Queries
 * Queries represent intent to read state
 */
export interface IQuery {
  readonly type: string;
  readonly payload?: unknown;
}

/**
 * Command Handler signature
 * @template C - The command type
 * @template R - The result type returned on success
 * @template E - The error type
 */
export interface ICommandHandler<C extends ICommand, R, E = ServiceError> {
  readonly commandType: string;
  execute(command: C): Promise<R>;
}

/**
 * Query Handler signature
 * @template Q - The query type
 * @template R - The result type returned on success
 * @template E - The error type
 */
export interface IQueryHandler<Q extends IQuery, R, E = ServiceError> {
  readonly queryType: string;
  execute(query: Q): Promise<R>;
}

/**
 * Command Bus - dispatches commands to handlers
 * @template C - Command type
 * @template R - Result type
 * @template E - Error type
 */
export interface ICommandBus<C extends ICommand, R, E = ServiceError> {
  dispatch(command: C): Promise<R>;
  register<C2 extends ICommand, R2, E2 = ServiceError>(
    handler: ICommandHandler<C2, R2, E2>
  ): void;
}

/**
 * Query Bus - dispatches queries to handlers
 * @template Q - Query type
 * @template R - Result type
 * @template E - Error type
 */
export interface IQueryBus<Q extends IQuery, R, E = ServiceError> {
  dispatch(query: Q): Promise<R>;
  register<Q2 extends IQuery, R2, E2 = ServiceError>(
    handler: IQueryHandler<Q2, R2, E2>
  ): void;
}

/**
 * Mediator - combines Command and Query dispatch
 * @template C - Command type
 * @template Q - Query type
 * @template R - Result type
 * @template E - Error type
 */
export interface IMediator<C extends ICommand, Q extends IQuery, R, E = ServiceError> {
  send<R2>(command: C): Promise<R2>;
  ask<R2>(query: Q): Promise<R2>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerCommand<C2 extends ICommand, R2 = any, E2 = ServiceError>(
    handler: ICommandHandler<C2, R2, E2>
  ): void;
  registerQuery<Q2 extends IQuery, R2 = any, E2 = ServiceError>(
    handler: IQueryHandler<Q2, R2, E2>
  ): void;
}