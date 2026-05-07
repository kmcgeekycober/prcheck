import { createRulePriorityService } from './rule-priority-service';
import { globToRegex } from './path-classifier';

interface LabelRule {
  pattern: string;
  label: string;
}

/**
 * Integration test: combines rule-priority-service with glob matching
 * from path-classifier to simulate real label resolution.
 */
describe('rule-priority + path-classifier integration', () => {
  const service = createRulePriorityService<LabelRule>();

  const rules: LabelRule[] = [
    { pattern: '**', label: 'general' },
    { pattern: 'src/**', label: 'source' },
    { pattern: 'src/**/*.test.ts', label: 'tests' },
    { pattern: 'src/index.ts', label: 'entry-point' },
  ];

  function globMatch(rule: LabelRule, paths: string[]): boolean {
    const regex = globToRegex(rule.pattern);
    return paths.some((p) => regex.test(p));
  }

  it('selects entry-point label for src/index.ts', () => {
    const result = service.top(rules, globMatch, ['src/index.ts']);
    expect(result?.label).toBe('entry-point');
  });

  it('selects tests label for a test file', () => {
    const result = service.top(rules, globMatch, ['src/foo/bar.test.ts']);
    expect(result?.label).toBe('tests');
  });

  it('selects source label for a non-test src file', () => {
    const result = service.top(rules, globMatch, ['src/utils/helper.ts']);
    expect(result?.label).toBe('source');
  });

  it('selects general label for docs files', () => {
    const result = service.top(rules, globMatch, ['docs/guide.md']);
    expect(result?.label).toBe('general');
  });

  it('returns sorted rules with most specific first', () => {
    const sorted = service.sort(rules);
    expect(sorted[0].label).toBe('entry-point');
    expect(sorted[sorted.length - 1].label).toBe('general');
  });
});
