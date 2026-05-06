import { filterRules, filterRulesByPaths, deduplicateRules } from './rule-filter';
import { Rule } from './config';

const makeRule = (overrides: Partial<Rule> & { paths: string[] }): Rule => ({
  name: 'test-rule',
  paths: [],
  labels: [],
  template: undefined,
  ...overrides,
});

describe('filterRules', () => {
  const rules: Rule[] = [
    makeRule({ name: 'frontend', paths: ['src/ui/'], labels: ['frontend'] }),
    makeRule({ name: 'backend', paths: ['src/api/'], labels: [] }),
    makeRule({ name: 'docs', paths: ['docs/'], labels: ['documentation'], template: 'docs-template' }),
    makeRule({ name: 'infra', paths: ['infra/'], labels: [], template: 'infra-template' }),
  ];

  it('filters by pathPrefix', () => {
    const result = filterRules(rules, { pathPrefix: 'src/' });
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(['frontend', 'backend']);
  });

  it('filters by labelRequired true', () => {
    const result = filterRules(rules, { labelRequired: true });
    expect(result.map((r) => r.name)).toEqual(['frontend', 'docs']);
  });

  it('filters by labelRequired false', () => {
    const result = filterRules(rules, { labelRequired: false });
    expect(result.map((r) => r.name)).toEqual(['backend', 'infra']);
  });

  it('filters by templateRequired true', () => {
    const result = filterRules(rules, { templateRequired: true });
    expect(result.map((r) => r.name)).toEqual(['docs', 'infra']);
  });

  it('filters by templateRequired false', () => {
    const result = filterRules(rules, { templateRequired: false });
    expect(result.map((r) => r.name)).toEqual(['frontend', 'backend']);
  });

  it('combines multiple filter options', () => {
    const result = filterRules(rules, { pathPrefix: 'docs/', labelRequired: true, templateRequired: true });
    expect(result.map((r) => r.name)).toEqual(['docs']);
  });

  it('returns empty when nothing matches', () => {
    const result = filterRules(rules, { pathPrefix: 'nonexistent/' });
    expect(result).toHaveLength(0);
  });
});

describe('filterRulesByPaths', () => {
  const rules: Rule[] = [
    makeRule({ name: 'frontend', paths: ['src/ui/'] }),
    makeRule({ name: 'backend', paths: ['src/api/'] }),
    makeRule({ name: 'root-file', paths: ['README.md'] }),
  ];

  it('returns rules matching any file path', () => {
    const result = filterRulesByPaths(rules, ['src/ui/Button.tsx', 'src/api/routes.ts']);
    expect(result.map((r) => r.name)).toEqual(['frontend', 'backend']);
  });

  it('matches exact file path', () => {
    const result = filterRulesByPaths(rules, ['README.md']);
    expect(result.map((r) => r.name)).toEqual(['root-file']);
  });

  it('returns empty when no paths match', () => {
    const result = filterRulesByPaths(rules, ['unrelated/file.ts']);
    expect(result).toHaveLength(0);
  });
});

describe('deduplicateRules', () => {
  it('removes duplicate rules by name', () => {
    const rules: Rule[] = [
      makeRule({ name: 'frontend', paths: ['src/ui/'] }),
      makeRule({ name: 'frontend', paths: ['src/components/'] }),
      makeRule({ name: 'backend', paths: ['src/api/'] }),
    ];
    const result = deduplicateRules(rules);
    expect(result).toHaveLength(2);
    expect(result[0].paths).toEqual(['src/ui/']);
  });

  it('uses path JSON as key when name is absent', () => {
    const rules: Rule[] = [
      makeRule({ name: undefined, paths: ['src/ui/'] }),
      makeRule({ name: undefined, paths: ['src/ui/'] }),
      makeRule({ name: undefined, paths: ['src/api/'] }),
    ];
    const result = deduplicateRules(rules);
    expect(result).toHaveLength(2);
  });
});
