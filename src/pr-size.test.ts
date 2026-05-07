import {
  classifyPRSize,
  buildPRSizeLabel,
  computePRSize,
  isSizeLabel,
  filterSizeLabels,
  PRSizeThresholds,
} from './pr-size';

describe('classifyPRSize', () => {
  it('returns XS for files <= 5', () => {
    expect(classifyPRSize(0)).toBe('XS');
    expect(classifyPRSize(5)).toBe('XS');
  });

  it('returns S for files <= 15', () => {
    expect(classifyPRSize(6)).toBe('S');
    expect(classifyPRSize(15)).toBe('S');
  });

  it('returns M for files <= 40', () => {
    expect(classifyPRSize(16)).toBe('M');
    expect(classifyPRSize(40)).toBe('M');
  });

  it('returns L for files <= 100', () => {
    expect(classifyPRSize(41)).toBe('L');
    expect(classifyPRSize(100)).toBe('L');
  });

  it('returns XL for files > 100', () => {
    expect(classifyPRSize(101)).toBe('XL');
    expect(classifyPRSize(500)).toBe('XL');
  });

  it('respects custom thresholds', () => {
    const thresholds: PRSizeThresholds = { xs: 2, s: 5, m: 10, l: 20 };
    expect(classifyPRSize(2, thresholds)).toBe('XS');
    expect(classifyPRSize(3, thresholds)).toBe('S');
    expect(classifyPRSize(10, thresholds)).toBe('M');
    expect(classifyPRSize(15, thresholds)).toBe('L');
    expect(classifyPRSize(21, thresholds)).toBe('XL');
  });
});

describe('buildPRSizeLabel', () => {
  it('builds label with default prefix', () => {
    expect(buildPRSizeLabel('M')).toBe('size/M');
  });

  it('builds label with custom prefix', () => {
    expect(buildPRSizeLabel('XL', 'pr-size')).toBe('pr-size/XL');
  });
});

describe('computePRSize', () => {
  it('returns full result object', () => {
    const result = computePRSize(10);
    expect(result.size).toBe('S');
    expect(result.changedFiles).toBe(10);
    expect(result.label).toBe('size/S');
  });

  it('uses custom label prefix', () => {
    const result = computePRSize(3, undefined, 'pr');
    expect(result.label).toBe('pr/XS');
  });
});

describe('isSizeLabel', () => {
  it('returns true for size labels', () => {
    expect(isSizeLabel('size/M')).toBe(true);
    expect(isSizeLabel('size/XL')).toBe(true);
  });

  it('returns false for non-size labels', () => {
    expect(isSizeLabel('bug')).toBe(false);
    expect(isSizeLabel('enhancement')).toBe(false);
  });

  it('respects custom prefix', () => {
    expect(isSizeLabel('pr-size/L', 'pr-size')).toBe(true);
    expect(isSizeLabel('size/L', 'pr-size')).toBe(false);
  });
});

describe('filterSizeLabels', () => {
  it('filters only size labels from a mixed list', () => {
    const labels = ['bug', 'size/S', 'enhancement', 'size/M'];
    expect(filterSizeLabels(labels)).toEqual(['size/S', 'size/M']);
  });

  it('returns empty array when no size labels present', () => {
    expect(filterSizeLabels(['bug', 'feature'])).toEqual([]);
  });
});
