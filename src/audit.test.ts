import {
  recordEvent,
  getAuditLog,
  clearAuditLog,
  summarizeAuditLog,
  AuditEvent,
} from './audit';

jest.mock('@actions/core', () => ({ debug: jest.fn() }));

describe('audit', () => {
  beforeEach(() => {
    clearAuditLog();
  });

  describe('recordEvent', () => {
    it('records an event and returns it', () => {
      const event = recordEvent('config_loaded', 42, { file: '.prcheck.yml' });
      expect(event.type).toBe('config_loaded');
      expect(event.prNumber).toBe(42);
      expect(event.details).toEqual({ file: '.prcheck.yml' });
      expect(event.timestamp).toBeTruthy();
    });

    it('appends multiple events to the log', () => {
      recordEvent('config_loaded', 1);
      recordEvent('rules_matched', 1, { count: 3 });
      recordEvent('validation_passed', 1);
      expect(getAuditLog()).toHaveLength(3);
    });

    it('records events for different PRs', () => {
      recordEvent('validation_passed', 10);
      recordEvent('validation_failed', 11, { reason: 'missing section' });
      const log = getAuditLog();
      expect(log[0].prNumber).toBe(10);
      expect(log[1].prNumber).toBe(11);
    });
  });

  describe('getAuditLog', () => {
    it('returns empty array initially', () => {
      expect(getAuditLog()).toHaveLength(0);
    });

    it('returns a readonly view of the log', () => {
      recordEvent('pr_checked', 5);
      const log = getAuditLog();
      expect(log).toHaveLength(1);
    });
  });

  describe('summarizeAuditLog', () => {
    it('returns message when no events exist for PR', () => {
      const result = summarizeAuditLog(99);
      expect(result).toBe('No audit events for PR #99');
    });

    it('includes only events for the given PR', () => {
      recordEvent('validation_passed', 7);
      recordEvent('labels_applied', 8, { labels: ['bug'] });
      recordEvent('validation_failed', 7, { reason: 'bad format' });
      const summary = summarizeAuditLog(7);
      expect(summary).toContain('PR #7');
      expect(summary).toContain('validation_passed');
      expect(summary).toContain('validation_failed');
      expect(summary).not.toContain('labels_applied');
    });

    it('formats each event with timestamp and details', () => {
      recordEvent('config_loaded', 3, { file: 'test.yml' });
      const summary = summarizeAuditLog(3);
      expect(summary).toMatch(/\d{4}-\d{2}-\d{2}T/);
      expect(summary).toContain('test.yml');
    });
  });
});
