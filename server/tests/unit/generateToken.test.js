const { signToken, verifyToken } = require('../../src/utils/generateToken');

describe('generateToken helpers', () => {
  it('signs and verifies a JWT payload', () => {
    const payload = { id: '507f1f77bcf86cd799439011', email: 'user@test.com', role: 'customer' };
    const token = signToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.id).toBe(payload.id);
  });

  it('rejects invalid tokens', () => {
    expect(() => verifyToken('invalid.token.value')).toThrow();
  });
});
