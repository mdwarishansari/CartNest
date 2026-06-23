const {
  calculateOrderTotal,
  calculateCommission,
  calculateNetEarnings,
  aggregateSellerAmounts,
} = require('../../src/utils/orderCalculations');

describe('orderCalculations', () => {
  const items = [
    { price: 100, qty: 2, sellerId: 'seller-a' },
    { price: 50, qty: 1, sellerId: 'seller-b' },
  ];

  it('calculates order totals', () => {
    expect(calculateOrderTotal(items)).toBe(250);
  });

  it('calculates commission and net earnings', () => {
    expect(calculateCommission(250)).toBe(25);
    expect(calculateNetEarnings(250)).toBe(225);
  });

  it('aggregates seller amounts', () => {
    expect(aggregateSellerAmounts(items)).toEqual({
      'seller-a': 200,
      'seller-b': 50,
    });
  });
});
