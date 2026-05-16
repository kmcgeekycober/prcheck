import {
  computeAgeDays,
  validatePRAge,
  buildAgeValidationMessage,
} from './pr-age-validator';

const BASE = new Date('2024-01-01T00:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

function daysLater(days: number): Date {
  return new Date(BASE.getTime() + days * DAY_MS);
}

describe('computeAgeDays', () => {
  it('returns 0 for same day', () => {
    expect(computeAgeDays(BASE, BASE)).toBe(0);
  });

  it('returns correct days', () => {
    expect(computeAgeDays(BASE, daysLater(10))).toBe(10);
  });

  it('floors partial days', () => {
    const almost2 = new Date(BASE.getTime() + 1.9 * DAY_MS);
    expect(computeAgeDays(BASE, almost2)).toBe(1);
  });
});

describe('validatePRAge', () => {
  const age = (days: number) => ({ createdAt: BASE, updatedAt: BASE, now: daysLater(days) });

  it('passes when under all thresholds', () => {
    const result = validatePRAge(age(5), { maxAgeDays: 30, warnAgeDays: 14 });
    expect(result.valid).toBe(true);
    expect(result.warning).toBe(false);
    expect(result.ageDays).toBe(5);
  });

  it('warns when over warnAgeDays', () => {
    const result = validatePRAge(age(20), { maxAgeDays: 30, warnAgeDays: 14 });
    expect(result.valid).toBe(true);
    expect(result.warning).toBe(true);
    expect(result.message).toContain('Warning');
  });

  it('fails when over maxAgeDays', () => {
    const result = validatePRAge(age(35), { maxAgeDays: 30, warnAgeDays: 14 });
    expect(result.valid).toBe(false);
    expect(result.warning).toBe(false);
    expect(result.message).toContain('Error');
  });

  it('skips validation for drafts when ignoreIfDraft is true', () => {
    const result = validatePRAge(age(100), { maxAgeDays: 30 }, true);
    expect(result.valid).toBe(true);
    expect(result.warning).toBe(false);
  });

  it('still validates drafts when ignoreIfDraft is false', () => {
    const result = validatePRAge(age(100), { maxAgeDays: 30, ignoreIfDraft: false }, true);
    expect(result.valid).toBe(false);
  });
});

describe('buildAgeValidationMessage', () => {
  it('builds warning message', () => {
    const msg = buildAgeValidationMessage(20, 14, true);
    expect(msg).toContain('Warning');
    expect(msg).toContain('20');
    expect(msg).toContain('14');
  });

  it('builds error message', () => {
    const msg = buildAgeValidationMessage(35, 30, false);
    expect(msg).toContain('Error');
    expect(msg).toContain('35');
  });
});
