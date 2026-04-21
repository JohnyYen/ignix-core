import type { ICommand, ICommandHandler, ICommandBus } from "./types";
import type { Result } from "../types/result";
import { ok, fail } from "../types/result";
import type { ServiceError } from "../exceptions/exceptions";

/**
 * Abstract base class for Command Handlers
 * Provides common functionality for executing commands
 * @template C - The command type extending ICommand
 * @template R - The result type on success
 * @template E - The error type (defaults to ServiceError)
 * @template C2 - Internal command type
 */
export abstract class CommandHandler<
  C extends ICommand,
  R,
  E = ServiceError,
  C2 extends ICommand = C
> implements ICommandHandler<C2, R, E>
{
  abstract readonly commandType: string;
  readonly _commandType!: string;

  get commandTypeName(): string {
    return this.commandType || (this as any).constructor.name;
  }

  async execute(command: C2): Promise<R> {
    return this.handle(command);
  }

  /**
   * Implement this method to define command execution logic
   * @param command - The command to execute
   * @returns Promise resolving to the result
   */
  abstract handle(command: C2): Promise<R>;
}

/**
 * In-memory Command Bus implementation
 * Stores handlers in a Map for lookup by command type
 * @template C - Command type
 * @template R - Result type
 * @template E - Error type
 */
export class CommandBus<
  C extends ICommand,
  R,
  E = ServiceError
> implements ICommandBus<C, R, E>
{
  private handlers = new Map<string, ICommandHandler<ICommand, unknown, ServiceError>>();

  async dispatch(command: C): Promise<R> {
    const handler = this.handlers.get(command.type) as
      | ICommandHandler<C, R, E>
      | undefined;

    if (!handler) {
      throw new Error(`Command handler not found: ${command.type}`);
    }

    return handler.execute(command) as Promise<R>;
  }

  register<C2 extends ICommand, R2, E2 = ServiceError>(
    handler: ICommandHandler<C2, R2, E2>
  ): void {
    this.handlers.set(handler.commandType, handler as ICommandHandler<ICommand, unknown, ServiceError>);
  }
}

/**
 * Simple Command Builder for type-safe command creation
 * @template T - The command type string
 * @template P - The payload type
 */
export class Command<T extends string, P> implements ICommand {
  readonly type: T;
  readonly payload: P;

  private constructor(type: T, payload: P) {
    this.type = type;
    this.payload = payload;
  }

  static create<T extends string, P>(
    type: T,
    payload: P
  ): Command<T, P> {
    return new Command(type, payload);
  }
}