import { describe, it, expect } from 'vitest';
import { formatDate, formatPH, formatSalinity } from '../formatters';

describe('formatPH', () => {
  it('formats to 1 decimal place', () => {
    expect(formatPH(8.3)).toBe('8.3');
    expect(formatPH(7)).toBe('7.0');
  });

  it('rounds to nearest tenth', () => {
    expect(formatPH(8.36)).toBe('8.4');
    expect(formatPH(8.34)).toBe('8.3');
  });
});

describe('formatSalinity', () => {
  it('formats to 3 decimal places', () => {
    expect(formatSalinity(35)).toBe('35.000');
    expect(formatSalinity(35.123)).toBe('35.123');
  });

  it('rounds to nearest thousandth', () => {
    expect(formatSalinity(35.1236)).toBe('35.124');
    expect(formatSalinity(35.1234)).toBe('35.123');
  });
});

describe('formatDate', () => {
  it('formats ISO date to locale string', () => {
    expect(formatDate('2024-03-15T10:30:00.000Z')).toBe('Mar 15, 2024');
  });
});
