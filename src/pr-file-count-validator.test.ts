import { validateFileCount, buildFileCountMessage } from './pr-file-count-validator';

describe('validateFileCount', () => {
  it('returns valid when no constraints set', () => {
    const result = validateFileCount(10, {});
    expect(result.valid).toBe(true);
    expect(result.warning).toBe(false);
  });

  it('fails when fileCount exceeds maxFiles', () => {
    const result = validateFileCount(25, { maxFiles: 20 });
    expect(result.valid).toBe(false);
    expect(result.warning).toBe(false);
    expect(result.message).toContain('25');
    expect(result.message).toContain('20');
  });

  it('passes when fileCount equals maxFiles', () => {
    const result = validateFileCount(20, { maxFiles: 20 });
    expect(result.valid).toBe(true);
  });

  it('fails when fileCount is below minFiles', () => {
    const result = validateFileCount(1, { minFiles: 2 });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('1');
    expect(result.message).toContain('2');
  });

  it('warns when fileCount exceeds warnFiles but not maxFiles', () => {
    const result = validateFileCount(15, { warnFiles: 10, maxFiles: 30 });
    expect(result.valid).toBe(true);
    expect(result.warning).toBe(true);
    expect(result.message).toContain('15');
  });

  it('does not warn when fileCount is within warnFiles threshold', () => {
    const result = validateFileCount(8, { warnFiles: 10 });
    expect(result.valid).toBe(true);
    expect(result.warning).toBe(false);
    expect(result.message).toBeUndefined();
  });

  it('prefers maxFiles failure over warnFiles warning', () => {
    const result = validateFileCount(35, { warnFiles: 10, maxFiles: 30 });
    expect(result.valid).toBe(false);
    expect(result.warning).toBe(false);
  });
});

describe('buildFileCountMessage', () => {
  it('mentions split suggestion when exceeding max', () => {
    const msg = buildFileCountMessage(50, { maxFiles: 20 });
    expect(msg).toContain('splitting');
  });

  it('mentions required minimum when below min', () => {
    const msg = buildFileCountMessage(0, { minFiles: 1 });
    expect(msg).toContain('required');
  });
});
