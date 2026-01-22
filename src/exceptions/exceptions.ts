/**
 * Error interface for database-related operation failures
 */
export interface DatabaseError {
  type: "database";
  message: string;
  code?: string;
}


/**
 * Error interface for validation failures on input data
 */
export interface ValidationError {
  type: "validation";
  field: string;
  message: string;
}


/**
 * Error interface for when a requested resource is not found
 */
export interface NotFoundError {
  type: "not_found";
  message: string;
  resource: string;
  id: number | string;
}


/**
 * Union type representing all possible service-level errors
 * Combines database, validation, and not found errors
 */
export type ServiceError = DatabaseError | ValidationError | NotFoundError;