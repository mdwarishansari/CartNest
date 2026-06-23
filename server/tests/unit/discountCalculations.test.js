const {
  calculateDiscountPercent,
  calculateSavings,
  hasDiscount,
} = require('../../src/utils/discountCalculations');

describe('discountCalculations', () => {
  it('calculates discount percentage and savings', () => {
    expect(calculateDiscountPercent(1000, 800)).toBe(20);
    expect(calculateSavings(1000, 800)).toBe(200);
    expect(hasDiscount(1000, 800)).toBe(true);
  });

  it('returns zero when no discount applies', () => {
    expect(calculateDiscountPercent(800, 800)).toBe(0);
    expect(hasDiscount(800, 800)).toBe(false);
  });
});
