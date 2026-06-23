const { isValidRole, hasRole } = require('../../src/utils/roles');

describe('roles helpers', () => {
  it('validates known roles', () => {
    expect(isValidRole('admin')).toBe(true);
    expect(isValidRole('guest')).toBe(false);
  });

  it('checks role membership', () => {
    expect(hasRole('seller', 'seller', 'admin')).toBe(true);
    expect(hasRole('customer', 'admin')).toBe(false);
  });
});
