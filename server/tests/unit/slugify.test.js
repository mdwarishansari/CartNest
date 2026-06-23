const { generateSlug, generateCleanSlug } = require('../../src/utils/slugify');

describe('slugify helpers', () => {
  it('generates a clean slug from text', () => {
    expect(generateCleanSlug('Hello World!')).toBe('hello-world');
  });

  it('generates a slug with random suffix', () => {
    const slug = generateSlug('Handmade Candle');
    expect(slug.startsWith('handmade-candle-')).toBe(true);
    expect(slug.length).toBeGreaterThan('handmade-candle-'.length);
  });
});
