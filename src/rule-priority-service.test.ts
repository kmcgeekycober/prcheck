import { createRulePriorityService } from './rule-priority-service';

interface TestRule {
  pattern: string;
  name: string;
}

describe('createRulePriorityService', () => {
  const service = createRulePriorityService<TestRule>();

  const rules: TestRule[] = [
    { pattern: '**', name: 'catch-all' },
    { pattern: 'src/**/*.ts', name: 'ts-files' },
    { pattern: 'src/main.ts', name: 'main-entry' },
  ];

  describe('sort', () => {
    it('returns rules sorted by descending priority', () => {
      const sorted = service.sort(rules);
      expect(sorted[0].name).toBe('main-entry');
      expect(sorted[sorted.length - 1].name).toBe('catch-all');
    });

    it('does not modify the original array', () => {
      const original = [...rules];
      service.sort(rules);
      expect(rules).toEqual(original);
    });
  });

  describe('top', () => {
    const exactMatch = (rule: TestRule, paths: string[]) =>
      paths.includes(rule.pattern) || rule.pattern === '**';

    it('picks the most specific matching rule', () => {
      const result = service.top(rules, exactMatch, ['src/main.ts']);
      expect(result?.name).toBe('main-entry');
    });

    it('falls back to catch-all when nothing specific matches', () => {
      const result = service.top(rules, exactMatch, ['other/file.js']);
      expect(result?.name).toBe('catch-all');
    });

    it('returns undefined when no rule matches', () => {
      const result = service.top(rules, () => false, ['anything']);
      expect(result).toBeUndefined();
    });
  });
});
