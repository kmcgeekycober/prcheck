import {
  extractTemplateSections,
  checkTemplateSections,
  findMissingSection,
  matchTemplate,
} from './template-matcher';
import { Rule } from './config';

const sampleTemplate = `## Summary
<!-- Describe the changes -->

## Testing
<!-- How was this tested? -->

### Checklist
- [ ] Tests added
`;

const completeDescription = `## Summary
Fixed a bug in the parser.

## Testing
Ran unit tests locally.

### Checklist
- [x] Tests added
`;

const incompleteDescription = `## Summary
Fixed a bug in the parser.
`;

describe('extractTemplateSections', () => {
  it('extracts all markdown heading sections', () => {
    const sections = extractTemplateSections(sampleTemplate);
    expect(sections).toEqual(['Summary', 'Testing', 'Checklist']);
  });

  it('returns empty array for template with no headings', () => {
    expect(extractTemplateSections('Just some text.')).toEqual([]);
  });
});

describe('checkTemplateSections', () => {
  it('marks all sections as found when description is complete', () => {
    const results = checkTemplateSections(completeDescription, sampleTemplate);
    expect(results.every(r => r.found)).toBe(true);
  });

  it('marks missing sections as not found', () => {
    const results = checkTemplateSections(incompleteDescription, sampleTemplate);
    const notFound = results.filter(r => !r.found).map(r => r.section);
    expect(notFound).toContain('Testing');
    expect(notFound).toContain('Checklist');
  });
});

describe('findMissingSection', () => {
  it('returns null when all sections are present', () => {
    expect(findMissingSection(completeDescription, sampleTemplate)).toBeNull();
  });

  it('returns the first missing section name', () => {
    const missing = findMissingSection(incompleteDescription, sampleTemplate);
    expect(missing).toBe('Testing');
  });
});

describe('matchTemplate', () => {
  const baseRule: Rule = { pattern: 'src/**', template: sampleTemplate, labels: [] };

  it('returns hasRequiredContent true for a complete description', () => {
    const result = matchTemplate(completeDescription, baseRule);
    expect(result.hasRequiredContent).toBe(true);
    expect(result.missingSection).toBeNull();
  });

  it('returns hasRequiredContent false when sections are missing', () => {
    const result = matchTemplate(incompleteDescription, baseRule);
    expect(result.hasRequiredContent).toBe(false);
    expect(result.missingSection).toBe('Testing');
  });

  it('returns hasRequiredContent true when rule has no template', () => {
    const noTemplateRule: Rule = { pattern: 'docs/**', labels: [] };
    const result = matchTemplate(incompleteDescription, noTemplateRule);
    expect(result.hasRequiredContent).toBe(true);
    expect(result.missingSection).toBeNull();
  });
});
