/**
 * Represents a successful operation result containing data
 * @template T - The type of data contained in the success result
 */
export interface SuccessResult<T> {
    type: "success";
    data: T;
    message?: string
}

/**
 * Represents a failed operation result containing error information
 * @template E - The type of error contained in the failure result
 */
export interface FailureResult<E> {
    type: "failure";
    error: E;
    message?: string;
}

/**
 * Union type representing either a successful or failed operation result
 * @template T - The type of data in a success result
 * @template E - The type of error in a failure result
 */
export type Result<T, E> = SuccessResult<T> | FailureResult<E>

/**
 * Creates a successful result object
 * @template T - The type of data to wrap in the success result
 * @param data - The data to include in the success result
 * @param message - Optional success message
 * @returns A SuccessResult object
 */
export const ok = <T>(data: T, message?: string): SuccessResult<T> => ({
    type: "success",
    data,
    message
});

/**
 * Creates a failure result object
 * @template E - The type of error to wrap in the failure result
 * @param error - The error to include in the failure result
 * @param message - Optional error message
 * @returns A FailureResult object
 */
export const fail = <E>(error: E, message?: string): FailureResult<E> => ({
    type: "failure",
    error,
    message
});

