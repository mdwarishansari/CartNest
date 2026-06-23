const authorize = require('../../src/middleware/authorize');
const ApiError = require('../../src/utils/ApiError');

describe('authorize middleware', () => {
  const next = jest.fn();

  beforeEach(() => {
    next.mockClear();
  });

  it('rejects unauthenticated requests', () => {
    const middleware = authorize('admin');
    middleware({}, {}, next);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('rejects unauthorized roles', () => {
    const middleware = authorize('admin');
    middleware({ user: { role: 'customer' } }, {}, next);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('allows authorized roles', () => {
    const middleware = authorize('admin', 'seller');
    middleware({ user: { role: 'seller' } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });
});
