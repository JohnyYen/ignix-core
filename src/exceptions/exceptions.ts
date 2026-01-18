export interface DatabaseError {
  type: "database";
  message: string;
  code?: string;
}


export interface ValidationError {
  type: "validation";
  field: string;
  message: string;
}


export interface NotFoundError {
  type: "not_found";
  message: string;
  resource: string;
  id: number | string;
}


export type ServiceError = DatabaseError | ValidationError | NotFoundError;