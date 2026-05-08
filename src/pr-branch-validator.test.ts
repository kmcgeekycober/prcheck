import {
  validateBranchName,
  buildBranchValidationMessage,
  BranchValidationOptions,
} from './pr-branch-validator';

describe('validateBranchName', () => {
  it('passes when no patterns are specified', () => {
    const result = validateBranchName('my-branch', {});
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  it('passes when branch matches an allowed pattern', () => {
    const opts: BranchValidationOptions = {
      allowedPatterns: ['^feat/', '^fix/'],
    };
    expect(validateBranchName('feat/my-feature', opts).valid).toBe(true);
    expect(validateBranchName('fix/bug-123', opts).valid).toBe(true);
  });

  it('fails when branch does not match any allowed pattern', () => {
    const opts: BranchValidationOptions = { allowedPatterns: ['^feat/', '^fix/'] };
    const result = validateBranchName('random-branch', opts);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('random-branch');
    expect(result.message).toContain('^feat/');
  });

  it('fails when branch matches a forbidden pattern', () => {
    const opts: BranchValidationOptions = { forbiddenPatterns: ['^main$', '^master$'] };
    const result = validateBranchName('main', opts);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('main');
    expect(result.message).toContain('^main$');
  });

  it('forbidden check takes precedence over allowed', () => {
    const opts: BranchValidationOptions = {
      allowedPatterns: ['^main$'],
      forbiddenPatterns: ['^main$'],
    };
    const result = validateBranchName('main', opts);
    expect(result.valid).toBe(false);
  });

  it('uses custom failureMessage when provided', () => {
    const opts: BranchValidationOptions = {
      allowedPatterns: ['^feat/'],
      failureMessage: 'Custom error message',
    };
    const result = validateBranchName('bad-branch', opts);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Custom error message');
  });
});

describe('buildBranchValidationMessage', () => {
  it('returns empty string for valid result', () => {
    expect(buildBranchValidationMessage({ valid: true, branchName: 'feat/x', message: '' })).toBe('');
  });

  it('returns formatted markdown for invalid result', () => {
    const msg = buildBranchValidationMessage({
      valid: false,
      branchName: 'bad',
      message: 'Branch "bad" does not match',
    });
    expect(msg).toContain('### Branch Name Violation');
    expect(msg).toContain('Branch "bad" does not match');
  });
});
