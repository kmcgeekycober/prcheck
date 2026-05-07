import {
  buildCommentHeader,
  buildDescriptionSection,
  buildLabelSection,
  renderSection,
  buildComment,
} from './comment-builder';
import { ValidationResult } from './validator';

function makeResult(overrides: Partial<ValidationResult> = {}): ValidationResult {
  return {
    passed: true,
    descriptionErrors: [],
    labelErrors: [],
    matchedRules: [],
    ...overrides,
  };
}

describe('buildCommentHeader', () => {
  it('returns passed header when true', () => {
    expect(buildCommentHeader(true)).toContain('✅');
    expect(buildCommentHeader(true)).toContain('Passed');
  });

  it('returns failed header when false', () => {
    expect(buildCommentHeader(false)).toContain('❌');
    expect(buildCommentHeader(false)).toContain('Failed');
  });
});

describe('buildDescriptionSection', () => {
  it('returns null when no errors', () => {
    expect(buildDescriptionSection(makeResult())).toBeNull();
  });

  it('includes each error as a list item', () => {
    const result = makeResult({ descriptionErrors: ['Missing summary', 'No ticket link'] });
    const section = buildDescriptionSection(result)!;
    expect(section.body).toContain('- Missing summary');
    expect(section.body).toContain('- No ticket link');
  });
});

describe('buildLabelSection', () => {
  it('returns null when no label errors', () => {
    expect(buildLabelSection(makeResult())).toBeNull();
  });

  it('includes each label error', () => {
    const result = makeResult({ labelErrors: ['Missing label: bug'] });
    const section = buildLabelSection(result)!;
    expect(section.body).toContain('- Missing label: bug');
    expect(section.emoji).toBe('🏷️');
  });
});

describe('renderSection', () => {
  it('formats title and body correctly', () => {
    const rendered = renderSection({ title: 'Test', emoji: '🔍', body: '- item' });
    expect(rendered).toBe('### 🔍 Test\n- item');
  });
});

describe('buildComment', () => {
  it('includes success message when no errors', () => {
    const comment = buildComment(makeResult());
    expect(comment).toContain('✅');
    expect(comment).toContain('Great job!');
  });

  it('includes failure footer and error sections when errors exist', () => {
    const result = makeResult({
      passed: false,
      descriptionErrors: ['Missing ## Summary section'],
      labelErrors: ['Missing label: type/bug'],
    });
    const comment = buildComment(result);
    expect(comment).toContain('❌');
    expect(comment).toContain('Missing ## Summary section');
    expect(comment).toContain('Missing label: type/bug');
    expect(comment).toContain('Please address the issues');
  });
});
