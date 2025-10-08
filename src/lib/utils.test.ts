import { describe, it, expect } from 'vitest';
import { formatCurrency, truncate } from '@/lib/utils';

describe('utils', () => {
  it('formats currency in Ghana Cedis', () => {
    const formatted = formatCurrency(1500).replace(/\u00a0/g, ' ');
    const zeroFormatted = formatCurrency(0).replace(/\u00a0/g, ' ');

    expect(formatted).toMatch(/GH/i);
    expect(formatted).toContain('1,500.00');
    expect(zeroFormatted).toContain('0.00');
  });

  it('truncates long text with ellipsis', () => {
    expect(truncate('Supremo AC Services', 7)).toBe('Supremo...');
    expect(truncate('AC', 5)).toBe('AC');
  });
});
