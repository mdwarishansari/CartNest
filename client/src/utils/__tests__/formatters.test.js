import { formatCurrency, formatOrderId, truncateText } from '../formatters';

describe('formatters', () => {
  it('formats currency and order ids', () => {
    expect(formatCurrency(1200)).toContain('1');
    expect(formatOrderId('cn-abc123')).toBe('CN-ABC123');
  });

  it('truncates long text', () => {
    expect(truncateText('short')).toBe('short');
    expect(truncateText('a'.repeat(120), 20).endsWith('…')).toBe(true);
  });
});
