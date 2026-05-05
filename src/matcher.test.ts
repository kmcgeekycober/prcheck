import { describe, it, expect } from 'vitest';
import { matchRules, checkLabels, RuleConfig } from './matcher';

const rules: RuleConfig[] = [
  {
    patterns: ['src/**/*.ts'],
    labels: ['typescript'],
    template: '.github/PULL_REQUEST_TEMPLATE/code_change.md',
  },
  {
    patterns: ['docs/**', '*.md'],
    labels: ['documentation'],
  },
  {
    patterns: ['src/**', 'tests/**'],
    labels: ['needs-review'],
  },
];

describe('matchRules', () => {
  it('returns empty results when no files match any rule', () => {
    const result = matchRules(['.github/workflows/ci.yml'], rules);
    expect(result.matchedRules).toHaveLength(0);
    expect(result.requiredLabels).toEqual([]);
    expect(result.requiredTemplates).toEqual([]);
  });

  it('matches a single rule correctly', () => {
    const result = matchRules(['docs/guide.md'], rules);
    expect(result.requiredLabels).toContain('documentation');
    expect(result.requiredLabels).not.toContain('typescript');
  });

  it('merges labels from multiple matching rules without duplicates', () => {
    const result = matchRules(['src/index.ts'], rules);
    expect(result.requiredLabels).toContain('typescript');
    expect(result.requiredLabels).toContain('needs-review');
    expect(result.requiredLabels).toHaveLength(2);
  });

  it('collects required templates from matched rules', () => {
    const result = matchRules(['src/utils.ts'], rules);
    expect(result.requiredTemplates).toContain(
      '.github/PULL_REQUEST_TEMPLATE/code_change.md'
    );
  });

  it('handles dot files with dot option enabled', () => {
    const dotRules: RuleConfig[] = [
      { patterns: ['**/.env*'], labels: ['config'] },
    ];
    const result = matchRules(['.env.local'], dotRules);
    expect(result.requiredLabels).toContain('config');
  });
});

describe('checkLabels', () => {
  it('returns satisfied when all required labels are present', () => {
    const { satisfied, missing } = checkLabels(
      ['typescript', 'needs-review'],
      ['typescript', 'needs-review']
    );
    expect(satisfied).toBe(true);
    expect(missing).toHaveLength(0);
  });

  it('returns missing labels when some are absent', () => {
    const { satisfied, missing } = checkLabels(
      ['typescript'],
      ['typescript', 'needs-review']
    );
    expect(satisfied).toBe(false);
    expect(missing).toEqual(['needs-review']);
  });

  it('returns satisfied when no labels are required', () => {
    const { satisfied } = checkLabels(['some-label'], []);
    expect(satisfied).toBe(true);
  });
});
