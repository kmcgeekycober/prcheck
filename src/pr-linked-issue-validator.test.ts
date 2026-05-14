import {
  extractLinkedIssues,
  validateLinkedIssue,
  buildLinkedIssueMessage,
  LinkedIssueOptions,
} from './pr-linked-issue-validator';

describe('extractLinkedIssues', () => {
  it('detects Closes #123', () => {
    expect(extractLinkedIssues('Closes #123')).toEqual(['123']);
  });

  it('detects Fixes #42 and Resolves #7', () => {
    const found = extractLinkedIssues('Fixes #42\nResolves #7');
    expect(found).toContain('42');
    expect(found).toContain('7');
  });

  it('detects cross-repo references', () => {
    const found = extractLinkedIssues('Closes owner/repo#55');
    expect(found).toContain('owner/repo#55');
  });

  it('deduplicates identical references', () => {
    const found = extractLinkedIssues('Closes #10\nCloses #10');
    expect(found).toHaveLength(1);
  });

  it('returns empty array when no issue referenced', () => {
    expect(extractLinkedIssues('No references here')).toEqual([]);
  });

  it('uses custom pattern when provided', () => {
    const found = extractLinkedIssues('JIRA-123 done', 'JIRA-(\\d+)');
    expect(found).toContain('123');
  });
});

describe('validateLinkedIssue', () => {
  const opts: LinkedIssueOptions = { required: true };

  it('passes when issue is linked', () => {
    const result = validateLinkedIssue('Closes #99', opts);
    expect(result.valid).toBe(true);
    expect(result.found).toContain('99');
  });

  it('fails when no issue is linked and required', () => {
    const result = validateLinkedIssue('Just a description', opts);
    expect(result.valid).toBe(false);
    expect(result.message).toBeDefined();
  });

  it('passes when not required and no issue linked', () => {
    const result = validateLinkedIssue('Just a description', { required: false });
    expect(result.valid).toBe(true);
  });
});

describe('buildLinkedIssueMessage', () => {
  it('includes default prefixes in message', () => {
    const msg = buildLinkedIssueMessage({ required: true });
    expect(msg).toContain('Closes #123');
  });

  it('uses custom allowedPrefixes', () => {
    const msg = buildLinkedIssueMessage({ required: true, allowedPrefixes: ['Refs'] });
    expect(msg).toContain('Refs #123');
  });
});
