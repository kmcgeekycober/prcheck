import { createLinkedIssueValidatorService } from './pr-linked-issue-validator-service';
import { LinkedIssueOptions } from './pr-linked-issue-validator';

function makeService(options: LinkedIssueOptions) {
  return createLinkedIssueValidatorService(options);
}

describe('createLinkedIssueValidatorService', () => {
  it('returns valid result when issue is linked and required', () => {
    const svc = makeService({ required: true });
    const result = svc.validate('Fixes #10');
    expect(result.valid).toBe(true);
    expect(result.found).toContain('10');
  });

  it('returns invalid result when no issue linked and required', () => {
    const svc = makeService({ required: true });
    const result = svc.validate('Some description without issue');
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it('returns valid when not required regardless of body', () => {
    const svc = makeService({ required: false });
    const result = svc.validate('No issue here');
    expect(result.valid).toBe(true);
  });

  it('uses custom pattern when provided', () => {
    const svc = makeService({ required: true, pattern: 'TICKET-(\\d+)' });
    const result = svc.validate('TICKET-42 implemented');
    expect(result.valid).toBe(true);
    expect(result.found).toContain('42');
  });

  it('fails with custom pattern when body does not match', () => {
    const svc = makeService({ required: true, pattern: 'TICKET-(\\d+)' });
    const result = svc.validate('Closes #10');
    expect(result.valid).toBe(false);
  });

  it('includes custom prefixes in failure message', () => {
    const svc = makeService({ required: true, allowedPrefixes: ['Refs'] });
    const result = svc.validate('Nothing here');
    expect(result.message).toContain('Refs #123');
  });
});
