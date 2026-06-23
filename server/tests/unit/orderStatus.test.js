const {
  canCancelOrder,
  canTransitionOrderStatus,
  isValidPaymentStatus,
} = require('../../src/utils/orderStatus');

describe('orderStatus helpers', () => {
  it('allows cancellation only for pending and placed orders', () => {
    expect(canCancelOrder('pending')).toBe(true);
    expect(canCancelOrder('placed')).toBe(true);
    expect(canCancelOrder('shipped')).toBe(false);
  });

  it('validates status transitions', () => {
    expect(canTransitionOrderStatus('pending', 'placed')).toBe(true);
    expect(canTransitionOrderStatus('pending', 'delivered')).toBe(false);
  });

  it('validates payment statuses', () => {
    expect(isValidPaymentStatus('paid')).toBe(true);
    expect(isValidPaymentStatus('unknown')).toBe(false);
  });
});
