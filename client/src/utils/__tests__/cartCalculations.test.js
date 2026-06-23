import {
  calculateLineTotal,
  getCartCount,
  getCartSubtotal,
} from '../cartCalculations';

describe('client cartCalculations', () => {
  const items = [
    { qty: 2, priceAtAdd: 120 },
    { qty: 1, productId: { price: 300 } },
  ];

  it('calculates totals and counts', () => {
    expect(calculateLineTotal(120, 2)).toBe(240);
    expect(getCartCount(items)).toBe(3);
    expect(getCartSubtotal(items)).toBe(540);
  });
});
