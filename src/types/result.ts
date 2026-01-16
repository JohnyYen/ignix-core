export interface SuccessResult<T> {
    type: "success";
    data: T;
    message?: string
}

export interface FailureResult<E> {
    type: "failure";
    error: E;
    message?: string;
}

export type Result<T, E> = SuccessResult<T> | FailureResult<E>

export const ok = <T>(data: T, message?: string): SuccessResult<T> => ({
    type: "success",
    data,
    message
});

export const fail = <E>(error: E, message?: string): FailureResult<E> => ({
    type: "failure",
    error,
    message
});

