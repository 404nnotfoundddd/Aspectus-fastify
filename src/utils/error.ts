

// reference: https://www.jsonrpc.org/specification

import { invert } from './invert';
import { isObject } from './isObject';

/**
 * JSON-RPC 2.0 Error codes
 */
export const ERROR_CODES_BY_KEY = {
    /**
     * Invalid JSON was received by the server.
     * An error occurred on the server while parsing the JSON text.
     */
    PARSE_ERROR: -32700,
    /**
     * The JSON sent is not a valid Request object.
     */
    BAD_REQUEST: -32600, // 400

    // Internal JSON-RPC error
    INTERNAL_SERVER_ERROR: -32603,
    NOT_IMPLEMENTED: -32603,

    // Implementation specific errors
    UNAUTHORIZED: -32001, // 401
    FORBIDDEN: -32003, // 403
    NOT_FOUND: -32004, // 404
    METHOD_NOT_SUPPORTED: -32005, // 405
    TIMEOUT: -32008, // 408
    CONFLICT: -32009, // 409
    PRECONDITION_FAILED: -32012, // 412
    PAYLOAD_TOO_LARGE: -32013, // 413
    UNPROCESSABLE_CONTENT: -32022, // 422
    TOO_MANY_REQUESTS: -32029, // 429
    CLIENT_CLOSED_REQUEST: -32099, // 499
} as const;

export const ERROR_CODES_BY_NUMBER = invert(ERROR_CODES_BY_KEY);
type ValueOf<TObj> = TObj[keyof TObj];

export type ERROR_CODE_NUMBER = ValueOf<typeof ERROR_CODES_BY_KEY>;
export type ERROR_CODE_KEY = keyof typeof ERROR_CODES_BY_KEY;


/**
 * @internal
 */
export function getMessageFromUnknownError(
    err: unknown,
    fallback: string,
): string {
    if (typeof err === 'string') {
        return err;
    }
    if (isObject(err) && typeof err.message === 'string') {
        return err.message;
    }
    return fallback;
}


class UnknownCauseError extends Error {
    [key: string]: unknown;
}
export function getCauseFromUnknown(cause: unknown): Error | undefined {
    if (cause instanceof Error) {
        return cause;
    }

    const type = typeof cause;
    if (type === 'undefined' || type === 'function' || cause === null) {
        return undefined;
    }

    // Primitive types just get wrapped in an error
    if (type !== 'object') {
        return new Error(String(cause));
    }

    // If it's an object, we'll create a synthetic error
    if (isObject(cause)) {
        const err = new UnknownCauseError();
        for (const key in cause) {
            err[key] = cause[key];
        }
        return err;
    }

    return undefined;
}


export class ServerError extends Error {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore override doesn't work in all environments due to "This member cannot have an 'override' modifier because it is not declared in the base class 'Error'"
    public override readonly cause?: Error;
    public readonly code;

    constructor(opts: {
        message?: string;
        code: ERROR_CODE_KEY;
        cause?: unknown;
    }) {
        const cause = getCauseFromUnknown(opts.cause);
        const message = opts.message ?? cause?.message ?? opts.code;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore https://github.com/tc39/proposal-error-cause
        super(message, { cause });

        this.code = opts.code;
        this.name = 'ServerError';

        if (!this.cause) {
            // < ES2022 / < Node 16.9.0 compatability
            this.cause = cause;
        }
    }
}