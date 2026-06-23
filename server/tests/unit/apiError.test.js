const ApiError = require('../../src/utils/ApiError');

describe('ApiError', () => {
  it('creates typed HTTP errors', () => {
    const error = ApiError.badRequest('Invalid input', [{ field: 'email' }]);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid input');
    expect(error.errors).toHaveLength(1);
    expect(error.isOperational).toBe(true);
  });

  it('supports common status helpers', () => {
    expect(ApiError.unauthorized().statusCode).toBe(401);
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.notFound().statusCode).toBe(404);
  });
});
