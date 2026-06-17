const slugifyLib = require("slugify");

/**
 * Generate a URL-friendly slug from a string.
 * Appends a short random suffix to avoid collisions.
 * @param {string} text
 * @returns {string}
 */
const generateSlug = (text) => {
  const base = slugifyLib(text, { lower: true, strict: true, trim: true });
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
};

/**
 * Generate a slug without random suffix (for categories / unique names).
 * @param {string} text
 * @returns {string}
 */
const generateCleanSlug = (text) => {
  return slugifyLib(text, { lower: true, strict: true, trim: true });
};

module.exports = { generateSlug, generateCleanSlug };
