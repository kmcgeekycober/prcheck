import { validatePRTitle, buildTitleValidationMessage } from './pr-title-validator';
import { Rule } from './config';

const makeRule = (name: string, titlePattern?: string): Rule => ({
  name,
  paths: [],
  titlePattern,
} as unknown as Rule);

describe('validatePRTitle', () => {
  it('returns invalid for empty title', () => {
    const result = validatePRTitle('', []);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/must not be empty/);
  });

  it('returns invalid for whitespace-only title', () => {
    const result = validatePRTitle('   ', []);
    expect(result.valid).toBe(false);
  });

  it('returns valid when no rules have titlePattern', () => {
    const rules = [makeRule('any-rule')];
    const result = validatePRTitle('some title', rules);
    expect(result.valid).toBe(true);
    expect(result.matchedRule).toBeNull();
  });

  it('returns valid and matched rule when title matches pattern', () => {
    const rules = [makeRule('feat-rule', '^feat:')];
    const result = validatePRTitle('feat: add new feature', rules);
    expect(result.valid).toBe(true);
    expect(result.matchedRule).toBe('feat-rule');
  });

  it('returns invalid when title does not match any pattern', () => {
    const rules = [makeRule('feat-rule', '^feat:'), makeRule('fix-rule', '^fix:')];
    const result = validatePRTitle('wip: something', rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/does not match/);
    expect(result.errors[0]).toMatch(/\^feat:/);
  });

  it('matches first applicable rule', () => {
    const rules = [makeRule('feat-rule', '^feat:'), makeRule('any-rule', '.*')];
    const result = validatePRTitle('feat: something', rules);
    expect(result.matchedRule).toBe('feat-rule');
  });

  it('trims whitespace from title before validation', () => {
    const rules = [makeRule('feat-rule', '^feat:')];
    const result = validatePRTitle('  feat: trimmed  ', rules);
    expect(result.valid).toBe(true);
    expect(result.title).toBe('feat: trimmed');
  });
});

describe('buildTitleValidationMessage', () => {
  it('returns success message for valid result', () => {
    const msg = buildTitleValidationMessage({
      valid: true,
      title: 'feat: ok',
      matchedRule: 'feat-rule',
      errors: [],
    });
    expect(msg).toMatch(/✅/);
    expect(msg).toMatch(/feat-rule/);
  });

  it('returns error message for invalid result', () => {
    const msg = buildTitleValidationMessage({
      valid: false,
      title: 'bad title',
      matchedRule: null,
      errors: ['does not match'],
    });
    expect(msg).toMatch(/❌/);
    expect(msg).toMatch(/does not match/);
  });
});
