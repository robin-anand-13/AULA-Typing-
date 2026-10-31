export class AppError extends Error {
    statusCode;
    errorCode;
    isOperational;
    details;
    constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found', errorCode = 'NOT_FOUND', details) {
        super(message, 404, errorCode, details);
    }
}
export class ValidationError extends AppError {
    constructor(message = 'Validation failed', details) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED') {
        super(message, 401, errorCode);
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Resource conflict or duplicate operation', errorCode = 'CONFLICT', details) {
        super(message, 409, errorCode, details);
    }
}
