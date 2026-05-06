import {
  validatePRDescription,
  validateLabels,
  buildValidationResult,
} from './validator';
import { Rule } from './config';

describe('validatePRDescription', () => {
  it('returns empty array when all sections are present', () => {
    const body = '## Summary\nsome text\n## Testing\ntest steps';
    const result = validatePRDescription(body, ['Summary', 'Testing']);
    expect(result).toEqual([]);
  });

  it('returns missing sections', () => {
    const body = '## Summary\nsome text';
    const result = validatePRDescription(body, ['Summary', 'Testing']);
    expect(result).toEqual(['Testing']);
  });

  it('is case-insensitive', () => {
    const body = '## summary\nsome text';
    const result = validatePRDescription(body, ['Summary']);
    expect(result).toEqual([]);
  });
});

describe('validateLabels', () => {
  it('returns empty array when all labels are present', () => {
    const result = validateLabels(['bug', 'frontend'], ['bug']);
    expect(result).toEqual([]);
  });

  it('returns missing labels', () => {
    const result = validateLabels(['bug'], ['bug', 'reviewed']);
    expect(result).toEqual(['reviewed']);
  });

  it('returns all labels when none match', () => {
    const result = validateLabels([], ['bug', 'frontend']);
    expect(result).toEqual(['bug', 'frontend']);
  });
});

describe('buildValidationResult', () => {
  const rules: Rule[] = [
    {
      paths: ['src/**'],
      labels: ['frontend'],
      template_sections: ['Summary', 'Testing'],
    },
  ];

  it('returns valid result when everything is satisfied', () => {
    const body = '## Summary\nfoo\n## Testing\nbar';
    const result = buildValidationResult(body, ['frontend'], rules);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns invalid result with missing labels', () => {
    const body = '## Summary\nfoo\n## Testing\nbar';
    const result = buildValidationResult(body, [], rules);
    expect(result.valid).toBe(false);
    expect(result.missingLabels).toContain('frontend');
  });

  it('returns invalid result with missing sections', () => {
    const body = '## Summary\nfoo';
    const result = buildValidationResult(body, ['frontend'], rules);
    expect(result.valid).toBe(false);
    expect(result.missingTemplateSections).toContain('Testing');
  });

  it('deduplicates missing labels across rules', () => {
    const dupRules: Rule[] = [
      { paths: ['src/**'], labels: ['frontend'] },
      { paths: ['src/**'], labels: ['frontend'] },
    ];
    const result = buildValidationResult('', [], dupRules);
    expect(result.missingLabels.filter((l) => l === 'frontend')).toHaveLength(1);
  });
});
