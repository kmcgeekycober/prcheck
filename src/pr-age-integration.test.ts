import { createAgeValidatorService } from './pr-age-validator-service';
import { buildAgeValidationMessage } from './pr-age-validator';

jest.mock('@actions/core', () => ({
  getInput: jest.fn().mockReturnValue(''),
}));

const BASE = new Date('2024-06-01T00:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

function makeAge(days: number) {
  return { createdAt: BASE, updatedAt: BASE, now: new Date(BASE.getTime() + days * DAY_MS) };
}

describe('PR age integration', () => {
  it('full warn+fail lifecycle', () => {
    const svc = createAgeValidatorService({ maxAgeDays: 30, warnAgeDays: 14 });

    const fresh = svc.validate(makeAge(3));
    expect(fresh.valid).toBe(true);
    expect(fresh.warning).toBe(false);

    const stale = svc.validate(makeAge(20));
    expect(stale.valid).toBe(true);
    expect(stale.warning).toBe(true);
    expect(stale.message).toBe(buildAgeValidationMessage(20, 14, true));

    const old = svc.validate(makeAge(45));
    expect(old.valid).toBe(false);
    expect(old.message).toBe(buildAgeValidationMessage(45, 30, false));
  });

  it('draft bypass skips all checks', () => {
    const svc = createAgeValidatorService({ maxAgeDays: 1, warnAgeDays: 1, ignoreIfDraft: true });
    const result = svc.validate(makeAge(365), true);
    expect(result.valid).toBe(true);
    expect(result.warning).toBe(false);
    expect(result.message).toBeUndefined();
  });
});
