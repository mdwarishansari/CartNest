const { validationResult } = require('express-validator');
const ApiError = require('../../src/utils/ApiError');
const validate = require('../../src/middleware/validate');
const { sessionValidator } = require('../../src/modules/auth/auth.validator');
const { addToCartValidator } = require('../../src/modules/cart/cart.validator');
const { checkoutValidator } = require('../../src/modules/order/order.validator');

const runValidators = async (validators, body = {}, query = {}) => {
  const req = { body, query };
  for (const validator of validators) {
    await validator.run(req);
  }
  return req;
};

const expectValidationFailure = async (req) => {
  await expect(
    new Promise((resolve, reject) => {
      try {
        validate(req, {}, (error) => {
          if (error) reject(error);
          else resolve();
        });
      } catch (error) {
        reject(error);
      }
    }),
  ).rejects.toBeInstanceOf(ApiError);
};

describe('request validators', () => {
  it('requires firebase id token for session creation', async () => {
    const req = await runValidators(sessionValidator, {});
    expect(validationResult(req).isEmpty()).toBe(false);
    await expectValidationFailure(req);
  });

  it('validates cart product id and quantity', async () => {
    const req = await runValidators(addToCartValidator, {
      productId: 'invalid-id',
      qty: 0,
    });
    await expectValidationFailure(req);
  });

  it('requires shipping address fields for checkout', async () => {
    const req = await runValidators(checkoutValidator, { shippingAddress: { name: 'Test' } });
    await expectValidationFailure(req);
  });
});
