const {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
} = require('../helpers/db');
const {
  request,
  app,
  seedSellerWithProduct,
  authRequest,
  seedUser,
} = require('../helpers/app');

describe('Product API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it('lists verified products publicly', async () => {
    const { product } = await seedSellerWithProduct();

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data.products.some((item) => item._id === product._id.toString() || item._id.toString?.() === product._id.toString())).toBe(true);
  });

  it('returns product details by slug', async () => {
    const { product } = await seedSellerWithProduct();

    const res = await request(app).get(`/api/products/${product.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.product.title).toBe('Test Product');
  });

  it('allows sellers to create products', async () => {
    const { sellerUser, category } = await seedSellerWithProduct();

    const res = await authRequest(sellerUser)
      .post('/api/seller/product')
      .send({
        title: 'New Candle',
        description: 'Scented candle',
        price: 299,
        mrp: 399,
        categoryId: category._id.toString(),
        stock: 5,
        images: [{ public_id: 'img-1', url: 'https://example.com/candle.jpg' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.product.title).toBe('New Candle');
  });

  it('blocks customers from seller product creation', async () => {
    const customer = await seedUser({ email: 'blocked@test.com' });
    const { category } = await seedSellerWithProduct();

    const res = await authRequest(customer)
      .post('/api/seller/product')
      .send({
        title: 'Blocked Product',
        description: 'Should fail',
        price: 100,
        categoryId: category._id.toString(),
        stock: 1,
        images: [{ public_id: 'img-2', url: 'https://example.com/blocked.jpg' }],
      });

    expect(res.status).toBe(403);
  });
});
