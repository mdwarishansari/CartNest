const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let mongoServer;

const connectTestDB = async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  await mongoServer.waitUntilRunning();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  return uri;
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

const createAuthToken = (user) => {
  const { signToken } = require('../../src/utils/generateToken');
  return signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });
};

module.exports = {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
  createAuthToken,
};
