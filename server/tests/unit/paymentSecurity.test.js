const { verifyRazorpaySignature } = require('../../src/utils/paymentSecurity');

describe('paymentSecurity', () => {
  it('validates razorpay signatures', () => {
    const secret = 'test-secret';
    const orderId = 'order_123';
    const paymentId = 'pay_456';
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(
      verifyRazorpaySignature({ orderId, paymentId, signature, secret }),
    ).toBe(true);
    expect(
      verifyRazorpaySignature({ orderId, paymentId, signature: 'bad', secret }),
    ).toBe(false);
  });
});
