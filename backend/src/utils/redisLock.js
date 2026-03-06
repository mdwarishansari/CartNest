const { getRedis } = require("../config/redis");

/**
 * Acquire a distributed lock using Redis SETNX.
 * @param {string} key - Lock key (e.g., 'lock:product:abc123')
 * @param {number} ttlMs - Lock TTL in milliseconds (default: 5000)
 * @returns {Promise<boolean>} true if lock acquired
 */
const acquireLock = async (key, ttlMs = 5000) => {
  const redis = getRedis();
  if (!redis) return true; // If Redis not available, allow operation (fallback to Mongo atomics)

  const result = await redis.set(key, "1", "PX", ttlMs, "NX");
  return result === "OK";
};

/**
 * Release a distributed lock.
 * @param {string} key - Lock key
 */
const releaseLock = async (key) => {
  const redis = getRedis();
  if (!redis) return;

  await redis.del(key);
};

/**
 * Execute a function while holding a lock.
 * Automatically acquires and releases the lock.
 * @param {string} key
 * @param {Function} fn - Async function to execute
 * @param {number} ttlMs - Lock TTL
 * @param {number} retries - Number of retry attempts
 * @param {number} retryDelayMs - Delay between retries
 * @returns {Promise<*>} Result of fn
 */
const withLock = async (
  key,
  fn,
  ttlMs = 5000,
  retries = 3,
  retryDelayMs = 200,
) => {
  for (let i = 0; i <= retries; i++) {
    const acquired = await acquireLock(key, ttlMs);
    if (acquired) {
      try {
        return await fn();
      } finally {
        await releaseLock(key);
      }
    }
    // Wait before retry
    if (i < retries) {
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelayMs * (i + 1)),
      );
    }
  }
  throw new Error(`Could not acquire lock: ${key}`);
};

module.exports = { acquireLock, releaseLock, withLock };
