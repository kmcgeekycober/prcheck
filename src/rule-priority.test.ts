import { computePriority, sortByPriority, topPriorityRule } from './rule-priority';

describe('computePriority', () => {
  it('gives higher score to patterns without wildcards', () => {
    expect(computePriority('src/index.ts')).toBeGreaterThan(computePriority('src/**'));
  });

  it('gives higher score to deeper paths', () => {
    expect(computePriority('src/foo/bar.ts')).toBeGreaterThan(computePriority('src/bar.ts'));
  });

  it('rewards file extension specificity', () => {
    expect(computePriority('src/foo.ts')).toBeGreaterThan(computePriority('src/foo'));
  });

  it('penalizes multiple wildcards', () => {
    const single = computePriority('src/**/*.ts');
    const double = computePriority('**/**/*.ts');
    expect(single).toBeGreaterThan(double);
  });
});

describe('sortByPriority', () => {
  it('sorts rules so most specific comes first', () => {
    const rules = [
      { pattern: '**' },
      { pattern: 'src/index.ts' },
      { pattern: 'src/**/*.ts' },
    ];
    const sorted = sortByPriority(rules);
    expect(sorted[0].pattern).toBe('src/index.ts');
  });

  it('does not mutate the original array', () => {
    const rules = [{ pattern: '**' }, { pattern: 'src/foo.ts' }];
    const copy = [...rules];
    sortByPriority(rules);
    expect(rules).toEqual(copy);
  });
});

describe('topPriorityRule', () => {
  const rules = [
    { pattern: '**', label: 'any' },
    { pattern: 'src/**/*.ts', label: 'typescript' },
    { pattern: 'src/index.ts', label: 'entry' },
  ];

  const matchFn = (rule: { pattern: string }, paths: string[]) =>
    paths.some((p) => p === rule.pattern || rule.pattern === '**');

  it('returns the highest priority matching rule', () => {
    const result = topPriorityRule(rules, matchFn, ['src/index.ts']);
    expect(result?.label).toBe('entry');
  });

  it('falls back to lower priority when specific rule does not match', () => {
    const result = topPriorityRule(rules, matchFn, ['docs/readme.md']);
    expect(result?.label).toBe('any');
  });

  it('returns undefined when no rule matches', () => {
    const noMatchFn = () => false;
    const result = topPriorityRule(rules, noMatchFn, ['anything']);
    expect(result).toBeUndefined();
  });
});
