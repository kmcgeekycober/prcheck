import { validateBaseBranch, buildBaseBranchMessage } from './pr-base-branch-validator';

describe('validateBaseBranch', () => {
  it('passes when no restrictions are configured', () => {
    const result = validateBaseBranch('main', { allowedBases: [], forbiddenBases: [] });
    expect(result.valid).toBe(true);
    expect(result.baseBranch).toBe('main');
  });

  it('passes when base is in allowed list', () => {
    const result = validateBaseBranch('main', {
      allowedBases: ['main', 'develop'],
      forbiddenBases: [],
    });
    expect(result.valid).toBe(true);
  });

  it('fails when base is not in allowed list', () => {
    const result = validateBaseBranch('feature/x', {
      allowedBases: ['main', 'develop'],
      forbiddenBases: [],
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('feature/x');
    expect(result.message).toContain('main');
  });

  it('fails when base matches a forbidden pattern', () => {
    const result = validateBaseBranch('hotfix/urgent', {
      allowedBases: [],
      forbiddenBases: ['hotfix/*'],
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('hotfix/urgent');
    expect(result.message).toContain('Forbidden');
  });

  it('passes when base does not match forbidden pattern', () => {
    const result = validateBaseBranch('develop', {
      allowedBases: [],
      forbiddenBases: ['hotfix/*'],
    });
    expect(result.valid).toBe(true);
  });

  it('forbidden check takes precedence over allowed', () => {
    const result = validateBaseBranch('main', {
      allowedBases: ['main'],
      forbiddenBases: ['main'],
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Forbidden');
  });

  it('supports wildcard in allowed bases', () => {
    const result = validateBaseBranch('release/1.2', {
      allowedBases: ['main', 'release/*'],
      forbiddenBases: [],
    });
    expect(result.valid).toBe(true);
  });
});

describe('buildBaseBranchMessage', () => {
  it('mentions forbidden bases when branch is forbidden', () => {
    const msg = buildBaseBranchMessage('hotfix/x', {
      allowedBases: [],
      forbiddenBases: ['hotfix/*'],
    });
    expect(msg).toContain('hotfix/x');
    expect(msg).toContain('hotfix/*');
  });

  it('mentions allowed bases when branch is not allowed', () => {
    const msg = buildBaseBranchMessage('random', {
      allowedBases: ['main', 'develop'],
      forbiddenBases: [],
    });
    expect(msg).toContain('main');
    expect(msg).toContain('develop');
  });
});
