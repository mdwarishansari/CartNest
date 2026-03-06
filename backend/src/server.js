require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const initFirebase = require("./config/firebase");
const { configureCloudinary } = require("./config/cloudinary");
const { initRazorpay } = require("./config/razorpay");
const { seedAdmin } = require("./modules/admin/admin.seed");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Initialize services (graceful — won't crash if not configured)
  connectRedis();
  initFirebase();
  configureCloudinary();
  initRazorpay();

  // Seed admin user if needed
  await seedAdmin();

  // Start Express
  app.listen(PORT, () => {
    console.log(`\n🚀 CartNest API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
};

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
