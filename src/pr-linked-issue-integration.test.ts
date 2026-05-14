import { extractLinkedIssues, validateLinkedIssue } from './pr-linked-issue-validator';
import { createLinkedIssueValidatorService } from './pr-linked-issue-validator-service';

describe('linked issue — integration', () => {
  const realWorldBodies = [
    { body: 'Closes #101\n\n## Summary\nDid the thing.', expectIssue: '101' },
    { body: 'fixes #202 and resolves #303', expectIssue: '202' },
    { body: 'This PR resolves owner/repo#7', expectIssue: 'owner/repo#7' },
  ];

  it.each(realWorldBodies)('extracts issue from real-world body', ({ body, expectIssue }) => {
    const found = extractLinkedIssues(body);
    expect(found).toContain(expectIssue);
  });

  it('end-to-end: service validates multi-issue PR body', () => {
    const svc = createLinkedIssueValidatorService({ required: true });
    const body = 'Closes #1\nFixes #2\n\nDid a lot of work.';
    const result = svc.validate(body);
    expect(result.valid).toBe(true);
    expect(result.found.length).toBeGreaterThanOrEqual(2);
  });

  it('end-to-end: service rejects body with no issue when required', () => {
    const svc = createLinkedIssueValidatorService({ required: true });
    const result = svc.validate('## What\nJust some changes.');
    expect(result.valid).toBe(false);
  });

  it('validateLinkedIssue with not-required skips extraction entirely', () => {
    const result = validateLinkedIssue('', { required: false });
    expect(result.valid).toBe(true);
    expect(result.found).toEqual([]);
  });
});
