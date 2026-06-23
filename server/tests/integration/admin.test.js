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
const Product = require('../../src/modules/product/product.model');

describe('Admin and Verifier API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it('allows verifier to approve pending products', async () => {
    const verifier = await seedUser({
      email: 'verifier@test.com',
      role: 'verifier',
    });
    const { sellerProfile, category } = await seedSellerWithProduct();

    const pendingProduct = await Product.create({
      sellerId: sellerProfile._id,
      sellerEmail: 'seller@test.com',
      title: 'Pending Product',
      slug: 'pending-product-xyz',
      price: 150,
      categoryId: category._id,
      stock: 4,
      verified: false,
      verificationState: 'pending',
      status: 'active',
      images: [{ public_id: 'pending-id', url: 'https://example.com/pending.jpg' }],
    });

    const res = await authRequest(verifier)
      .put(`/api/admin/products/${pendingProduct._id.toString()}/verify`)
      .send({ verificationState: 'verified', verificationNotes: 'Looks good' });

    expect(res.status).toBe(200);
    expect(res.body.data.product.verificationState).toBe('verified');
  });

  it('allows admin to list users', async () => {
    const admin = await seedUser({ email: 'admin@test.com', role: 'admin' });
    await seedUser({ email: 'listed@test.com', role: 'customer' });

    const res = await authRequest(admin).get('/api/admin/users');
    expect(res.status).toBe(200);
    expect(res.body.data.users.length).toBeGreaterThanOrEqual(2);
  });
});
