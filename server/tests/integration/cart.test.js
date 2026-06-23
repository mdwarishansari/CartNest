const {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
} = require('../helpers/db');
const {
  seedSellerWithProduct,
  authRequest,
  seedUser,
} = require('../helpers/app');

describe('Cart API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it('adds, updates, and removes cart items', async () => {
    const customer = await seedUser({ email: 'cart@test.com' });
    const { product } = await seedSellerWithProduct();
    const client = authRequest(customer);

    const addRes = await client
      .post('/api/cart')
      .send({ productId: product._id.toString(), qty: 2 });
    expect(addRes.status).toBe(200);
    expect(addRes.body.data.cart.items).toHaveLength(1);

    const updateRes = await client
      .put('/api/cart')
      .send({ productId: product._id.toString(), qty: 3 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.cart.items[0].qty).toBe(3);

    const removeRes = await client.delete(`/api/cart/${product._id.toString()}`);
    expect(removeRes.status).toBe(200);
    expect(removeRes.body.data.cart.items).toHaveLength(0);
  });

  it('prepares checkout from a populated cart', async () => {
    const customer = await seedUser({ email: 'checkout@test.com' });
    const { product } = await seedSellerWithProduct();
    const client = authRequest(customer);

    await client.post('/api/cart').send({ productId: product._id.toString(), qty: 1 });

    const checkoutRes = await client.post('/api/orders/checkout').send({
      shippingAddress: {
        name: 'Checkout User',
        phone: '9999999999',
        house: '12 Market Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
    });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.data.order.totalAmount).toBe(499);
  });
});
