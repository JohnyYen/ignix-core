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

/**
 * Type guard to check if a Result is successful
 * @template T - The type of data in a success result
 * @template E - The type of error in a failure result
 * @param result - The Result to check
 * @returns True if the result is a SuccessResult, false otherwise
 * @example
 * const result = ok({ id: 1, name: "John" });
 * if (isSuccess(result)) {
 *   console.log(result.data.name); // TypeScript narrows to SuccessResult
 * }
 */
export const isSuccess = <T, E>(result: Result<T, E>): result is SuccessResult<T> => {
    return result.type === "success";
};

/**
 * Type guard to check if a Result is a failure
 * @template T - The type of data in a success result
 * @template E - The type of error in a failure result
 * @param result - The Result to check
 * @returns True if the result is a FailureResult, false otherwise
 * @example
 * const result = fail({ type: "validation", field: "email", message: "Invalid" });
 * if (isFailure(result)) {
 *   console.log(result.error.message); // TypeScript narrows to FailureResult
 * }
 */
export const isFailure = <T, E>(result: Result<T, E>): result is FailureResult<E> => {
    return result.type === "failure";
};

/**
 * Transforms the success data of a Result using a mapping function
 * @template T - The original success data type
 * @template E - The error type
 * @template U - The mapped success data type
 * @param result - The Result to transform
 * @param fn - The function to transform the success data
 * @returns A new Result with the transformed data if successful, otherwise the original failure
 * @example
 * const result = ok({ id: 1, name: "John" });
 * const mapped = map(result, (data) => ({ ...data, name: data.name.toUpperCase() }));
 * // mapped.data.name === "JOHN"
 */
export const map = <T, E, U>(
    result: Result<T, E>,
    fn: (data: T) => U
): Result<U, E> => {
    if (isSuccess(result)) {
        return ok(fn(result.data), result.message);
    }
    return fail(result.error, result.message);
};

/**
 * Chains Result-returning functions, flattening the nested Result
 * @template T - The original success data type
 * @template E - The error type
 * @template U - The final success data type
 * @param result - The Result to chain from
 * @param fn - The function that returns a Result
 * @returns The Result from the chained function if successful, otherwise the original failure
 * @example
 * const userResult = ok({ id: 1, name: "John" });
 * const chained = flatMap(userResult, (user) => {
 *   if (user.name === "John") {
 *     return ok({ ...user, role: "admin" });
 *   }
 *   return fail({ type: "validation", field: "name", message: "Invalid" });
 * });
 */
export const flatMap = <T, E, U>(
    result: Result<T, E>,
    fn: (data: T) => Result<U, E>
): Result<U, E> => {
    if (isSuccess(result)) {
        return fn(result.data);
    }
    return fail(result.error, result.message);
};

/**
 * Converts a Promise to a Result, mapping errors to the error type
 * @template T - The resolved value type
 * @template E - The error type to map to
 * @param promise - The Promise to convert
 * @param mapError - Function to map any rejection reason to the error type
 * @returns A Promise that resolves to a Result
 * @example
 * const result = await fromPromise(
 *   fetch("/api/user").then(r => r.json()),
 *   (error) => ({ type: "database" as const, message: error.message })
 * );
 */
export const fromPromise = async <T, E>(
    promise: Promise<T>,
    mapError: (error: unknown) => E
): Promise<Result<T, E>> => {
    try {
        const data = await promise;
        return ok(data);
    } catch (error) {
        return fail(mapError(error));
    }
};

/**
 * Converts a nullable value to a Result, using the provided error if null/undefined
 * @template T - The type of the value (may include null/undefined)
 * @template E - The error type when value is null/undefined
 * @param value - The value that may be null or undefined
 * @param error - The error to use if the value is null/undefined
 * @returns A SuccessResult with the value (narrowed to NonNullable) or a FailureResult
 * @example
 * const result = fromNullable(user, { type: "not_found" as const, message: "User not found", resource: "user", id: 1 });
 * if (isSuccess(result)) {
 *   console.log(result.data.name); // TypeScript knows it's not null
 * }
 */
export const fromNullable = <T, E>(
    value: T | null | undefined,
    error: E
): Result<NonNullable<T>, E> => {
    if (value === null || value === undefined) {
        return fail(error);
    }
    return ok(value as NonNullable<T>);
};

