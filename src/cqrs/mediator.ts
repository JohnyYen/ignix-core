import { ICommand, ICommandHandler } from "./types";
import { IQuery, IQueryHandler } from "./types";
import { IMediator } from "./types";
import { ServiceError } from "../exceptions/exceptions";

/**
 * CQRS Mediator - Combines Command and Query Bus functionality
 * Single entry point for both Commands and Queries
 * @template C - Command type
 * @template Q - Query type
 * @template R - Result type
 * @template E - Error type
 */
export class Mediator<C extends ICommand, Q extends IQuery, R, E = ServiceError>
  implements IMediator<C, Q, R, E>
{
  private commandHandlers = new Map<
    string,
    ICommandHandler<ICommand, unknown, ServiceError>
  >();
  private queryHandlers = new Map<string, IQueryHandler<IQuery, unknown, ServiceError>>();

  /**
   * Send a command to be processed
   * @template R2 - Expected result type
   * @param command - The command to execute
   * @returns Promise resolving to the result
   */
  async send<R2>(command: C): Promise<R2> {
    const handler = this.commandHandlers.get(command.type) as
      | ICommandHandler<C, R2, E>
      | undefined;

    if (!handler) {
      throw new Error(`Command handler not found: ${command.type}`);
    }

    return handler.execute(command) as Promise<R2>;
  }

  /**
   * Send a query to be processed
   * @template R2 - Expected result type
   * @param query - The query to execute
   * @returns Promise resolving to the result
   */
  async ask<R2>(query: Q): Promise<R2> {
    const handler = this.queryHandlers.get(query.type) as
      | IQueryHandler<Q, R2, E>
      | undefined;

    if (!handler) {
      throw new Error(`Query handler not found: ${query.type}`);
    }

    return handler.execute(query) as Promise<R2>;
  }

  /**
   * Register a command handler
   * @template C2 - Command type
   * @template R2 - Result type
   * @template E2 - Error type
   * @param handler - The handler to register
   */
  registerCommand<C2 extends ICommand, R2 = unknown, E2 = ServiceError>(
    handler: ICommandHandler<C2, R2, E2>
  ): void {
    this.commandHandlers.set(
      handler.commandType,
      handler as ICommandHandler<ICommand, unknown, ServiceError>
    );
  }

  /**
   * Register a query handler
   * @template Q2 - Query type
   * @template R2 - Result type
   * @template E2 - Error type
   * @param handler - The handler to register
   */
  registerQuery<Q2 extends IQuery, R2 = unknown, E2 = ServiceError>(
    handler: IQueryHandler<Q2, R2, E2>
  ): void {
    this.queryHandlers.set(
      handler.queryType,
      handler as IQueryHandler<IQuery, unknown, ServiceError>
    );
  }
}