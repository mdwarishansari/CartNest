jest.mock('firebase-admin', () => ({
  apps: [],
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'firebase-test-uid',
      email: 'session@test.com',
      name: 'Session User',
      email_verified: true,
      firebase: { sign_in_provider: 'password' },
    }),
    deleteUser: jest.fn().mockResolvedValue(undefined),
  })),
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
}));

const {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
} = require('../helpers/db');
const { request, app, seedUser, authRequest } = require('../helpers/app');

describe('Health API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it('returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('CartNest API');
  });
});

describe('Auth API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it('creates a session from firebase token', async () => {
    const res = await request(app)
      .post('/api/auth/session')
      .send({ idToken: 'mock-firebase-token' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('session@test.com');
    expect(res.body.data.token).toBeDefined();
  });

  it('returns current user for authenticated requests', async () => {
    const user = await seedUser({ email: 'me@test.com' });
    const res = await authRequest(user).get('/api/auth/me');

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('me@test.com');
  });

  it('logs out authenticated users', async () => {
    const user = await seedUser({ email: 'logout@test.com' });
    const res = await authRequest(user).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Logged out');
  });
});
