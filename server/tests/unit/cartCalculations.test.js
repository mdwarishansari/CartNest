const {
  calculateLineTotal,
  getCartCount,
  getCartSubtotal,
  mergeCartItem,
} = require('../../src/utils/cartCalculations');

describe('cartCalculations', () => {
  const items = [
    { qty: 2, priceAtAdd: 100 },
    { qty: 1, productId: { price: 250 } },
  ];

  it('calculates line totals safely', () => {
    expect(calculateLineTotal(100, 2)).toBe(200);
    expect(calculateLineTotal(-10, 2)).toBe(0);
    expect(calculateLineTotal(100, 0)).toBe(0);
  });

  it('counts cart items and subtotal', () => {
    expect(getCartCount(items)).toBe(3);
    expect(getCartSubtotal(items)).toBe(450);
  });

  it('merges duplicate cart lines', () => {
    const merged = mergeCartItem([], 'abc123', 2, { price: 50, sellerId: 'seller1' });
    const updated = mergeCartItem(merged, 'abc123', 1, { price: 50, sellerId: 'seller1' });
    expect(updated).toHaveLength(1);
    expect(updated[0].qty).toBe(3);
  });
});
