import { summarizeResults, formatSummaryMarkdown, PRSummary } from './summarizer';
import { MatchResult } from './matcher';
import { ValidationResult } from './validator';

const makeMatchResult = (matched: string[], unmatched: string[]): MatchResult => ({
  matched: matched.map((name) => ({ name, pattern: name, labels: [], descriptionTemplate: '' })),
  unmatched: unmatched.map((name) => ({ name, pattern: name, labels: [], descriptionTemplate: '' })),
});

const makeValidationResult = (valid: boolean, violations: { expected: string }[] = []): ValidationResult => ({
  valid,
  violations: violations.map((v) => ({ message: `Missing: ${v.expected}`, expected: v.expected, actual: '' })),
});

describe('summarizeResults', () => {
  it('returns overallPass true when both validations pass', () => {
    const result = summarizeResults(
      makeMatchResult(['rule-a'], []),
      makeValidationResult(true),
      makeValidationResult(true)
    );
    expect(result.overallPass).toBe(true);
    expect(result.descriptionValid).toBe(true);
    expect(result.labelsValid).toBe(true);
  });

  it('returns overallPass false when description validation fails', () => {
    const result = summarizeResults(
      makeMatchResult(['rule-a'], []),
      makeValidationResult(false, [{ expected: '## Summary' }]),
      makeValidationResult(true)
    );
    expect(result.overallPass).toBe(false);
    expect(result.missingDescriptionSections).toEqual(['## Summary']);
  });

  it('returns overallPass false when labels validation fails', () => {
    const result = summarizeResults(
      makeMatchResult([], ['rule-b']),
      makeValidationResult(true),
      makeValidationResult(false, [{ expected: 'bug' }])
    );
    expect(result.overallPass).toBe(false);
    expect(result.missingLabels).toEqual(['bug']);
    expect(result.totalRulesMissed).toBe(1);
  });

  it('populates details with matched and unmatched rule names', () => {
    const result = summarizeResults(
      makeMatchResult(['rule-a'], ['rule-b']),
      makeValidationResult(true),
      makeValidationResult(true)
    );
    expect(result.details.some((d) => d.includes('rule-a'))).toBe(true);
    expect(result.details.some((d) => d.includes('rule-b'))).toBe(true);
  });
});

describe('formatSummaryMarkdown', () => {
  it('includes pass icon when overallPass is true', () => {
    const summary: PRSummary = {
      totalRulesMatched: 2,
      totalRulesMissed: 0,
      descriptionValid: true,
      labelsValid: true,
      missingLabels: [],
      missingDescriptionSections: [],
      overallPass: true,
      details: [],
    };
    const md = formatSummaryMarkdown(summary);
    expect(md).toContain('✅');
    expect(md).toContain('PR Check Summary');
  });

  it('includes fail icon and details when overallPass is false', () => {
    const summary: PRSummary = {
      totalRulesMatched: 0,
      totalRulesMissed: 1,
      descriptionValid: false,
      labelsValid: false,
      missingLabels: ['bug'],
      missingDescriptionSections: ['## Summary'],
      overallPass: false,
      details: ['Missing labels: bug', 'Missing description sections: ## Summary'],
    };
    const md = formatSummaryMarkdown(summary);
    expect(md).toContain('❌');
    expect(md).toContain('Missing labels: bug');
  });
});
