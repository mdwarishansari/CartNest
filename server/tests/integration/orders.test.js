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
const Order = require('../../src/modules/order/order.model');

describe('Order API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it('tracks created orders for the customer', async () => {
    const customer = await seedUser({ email: 'orders@test.com' });
    const { product } = await seedSellerWithProduct();
    const client = authRequest(customer);

    await client.post('/api/cart').send({ productId: product._id.toString(), qty: 1 });
    const checkoutRes = await client.post('/api/orders/checkout').send({
      shippingAddress: {
        name: 'Order User',
        phone: '8888888888',
        house: '45 Main Road',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
    });

    const orderId = checkoutRes.body.data.order._id;
    const listRes = await client.get('/api/orders');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.orders.some((order) => order._id === orderId)).toBe(true);

    const detailRes = await client.get(`/api/orders/${orderId}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.order.orderStatus).toBe('pending');
  });

  it('cancels pending orders and restores stock', async () => {
    const customer = await seedUser({ email: 'cancel@test.com' });
    const { product } = await seedSellerWithProduct();
    const client = authRequest(customer);

    await client.post('/api/cart').send({ productId: product._id.toString(), qty: 2 });
    const checkoutRes = await client.post('/api/orders/checkout').send({
      shippingAddress: {
        name: 'Cancel User',
        phone: '7777777777',
        house: '78 Park Lane',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
      },
    });

    const orderId = checkoutRes.body.data.order._id;
    const cancelRes = await client.post(`/api/orders/${orderId}/cancel`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.order.orderStatus).toBe('cancelled');

    const updatedOrder = await Order.findById(orderId);
    expect(updatedOrder.orderStatus).toBe('cancelled');
  });
});
