import {
  calculateDiscountPercent,
  calculateSavings,
  hasDiscount,
} from '../discountCalculations';

describe('client discountCalculations', () => {
  it('calculates discount values', () => {
    expect(calculateDiscountPercent(500, 400)).toBe(20);
    expect(calculateSavings(500, 400)).toBe(100);
    expect(hasDiscount(500, 400)).toBe(true);
  });
});
