const Redis = require("ioredis");

let redis = null;

const connectRedis = () => {
  try {
    if (!process.env.REDIS_URL) {
      console.warn("⚠️  REDIS_URL not set — Redis features disabled");
      return null;
    }

    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.warn(
            "⚠️  Redis connection failed after 3 retries — running without Redis",
          );
          return null; // stop retrying
        }
        return Math.min(times * 500, 2000);
      },
    });

    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => console.error("❌ Redis error:", err.message));

    return redis;
  } catch (error) {
    console.warn("⚠️  Redis init error:", error.message);
    return null;
  }
};

const getRedis = () => redis;

module.exports = { connectRedis, getRedis };
