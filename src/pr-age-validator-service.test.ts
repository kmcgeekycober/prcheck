import { createAgeValidatorService } from './pr-age-validator-service';

jest.mock('@actions/core', () => ({
  getInput: jest.fn().mockReturnValue(''),
}));

const BASE = new Date('2024-03-01T00:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

function ageOf(days: number) {
  return {
    createdAt: BASE,
    updatedAt: BASE,
    now: new Date(BASE.getTime() + days * DAY_MS),
  };
}

describe('createAgeValidatorService', () => {
  it('passes when no options are configured', () => {
    const svc = createAgeValidatorService({});
    const result = svc.validate(ageOf(999));
    expect(result.valid).toBe(true);
    expect(result.ageDays).toBe(999);
  });

  it('fails when over maxAgeDays', () => {
    const svc = createAgeValidatorService({ maxAgeDays: 14 });
    const result = svc.validate(ageOf(20));
    expect(result.valid).toBe(false);
    expect(result.message).toBeDefined();
  });

  it('warns when over warnAgeDays but under maxAgeDays', () => {
    const svc = createAgeValidatorService({ maxAgeDays: 60, warnAgeDays: 14 });
    const result = svc.validate(ageOf(30));
    expect(result.valid).toBe(true);
    expect(result.warning).toBe(true);
  });

  it('ignores draft PRs when ignoreIfDraft is true', () => {
    const svc = createAgeValidatorService({ maxAgeDays: 7, ignoreIfDraft: true });
    const result = svc.validate(ageOf(100), true);
    expect(result.valid).toBe(true);
    expect(result.warning).toBe(false);
  });

  it('validates draft PRs when ignoreIfDraft is false', () => {
    const svc = createAgeValidatorService({ maxAgeDays: 7, ignoreIfDraft: false });
    const result = svc.validate(ageOf(100), true);
    expect(result.valid).toBe(false);
  });

  it('returns correct ageDays in result', () => {
    const svc = createAgeValidatorService({ maxAgeDays: 30 });
    const result = svc.validate(ageOf(10));
    expect(result.ageDays).toBe(10);
  });
});
