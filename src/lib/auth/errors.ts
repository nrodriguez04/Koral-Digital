export class UnauthenticatedError extends Error {
  readonly status = 401;
  constructor(message = 'Sign in required.') {
    super(message);
    this.name = 'UnauthenticatedError';
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = 'You do not have permission to do that.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/** Used for cross-tenant lookups so we never reveal that another org's record exists. */
export class NotFoundError extends Error {
  readonly status = 404;
  constructor(message = 'Not found.') {
    super(message);
    this.name = 'NotFoundError';
  }
}
