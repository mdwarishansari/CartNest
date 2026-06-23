const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/modules/user/user.model');
const Product = require('../../src/modules/product/product.model');
const Category = require('../../src/modules/category/category.model');
const SellerProfile = require('../../src/modules/seller/sellerProfile.model');
const { generateCleanSlug } = require('../../src/utils/slugify');
const { createAuthToken } = require('../helpers/db');

const seedUser = async (overrides = {}) =>
  User.create({
    email: overrides.email || 'customer@test.com',
    name: overrides.name || 'Test Customer',
    role: overrides.role || 'customer',
    firebaseUid: overrides.firebaseUid || 'firebase-customer',
    isSeller: overrides.isSeller || false,
    ...overrides,
  });

const seedCategory = async (name = 'Handmade') =>
  Category.create({
    name,
    slug: generateCleanSlug(name),
  });

const seedSellerWithProduct = async () => {
  const sellerUser = await seedUser({
    email: 'seller@test.com',
    role: 'seller',
    isSeller: true,
    firebaseUid: 'firebase-seller',
  });

  const sellerProfile = await SellerProfile.create({
    userId: sellerUser._id,
    userEmail: sellerUser.email,
    shopName: 'Test Shop',
    shopSlug: 'test-shop',
  });

  sellerUser.sellerProfileId = sellerProfile._id;
  await sellerUser.save();

  const category = await seedCategory('Crafts');

  const product = await Product.create({
    sellerId: sellerProfile._id,
    sellerEmail: sellerUser.email,
    title: 'Test Product',
    slug: 'test-product-abc12',
    description: 'A verified test product',
    price: 499,
    mrp: 699,
    categoryId: category._id,
    stock: 10,
    verified: true,
    verificationState: 'verified',
    status: 'active',
    images: [{ public_id: 'test-id', url: 'https://example.com/product.jpg' }],
  });

  return { sellerUser, sellerProfile, category, product };
};

const authRequest = (user) => {
  const token = createAuthToken(user);
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url) => request(app).put(url).set('Authorization', `Bearer ${token}`),
    delete: (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
};

module.exports = {
  request,
  app,
  seedUser,
  seedCategory,
  seedSellerWithProduct,
  authRequest,
};
