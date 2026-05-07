import {
  globToRegex,
  classifyPath,
  classifyPaths,
  aggregateCategories,
  PathCategory,
} from './path-classifier';

const categories: PathCategory[] = [
  { name: 'frontend', patterns: ['src/ui/**', '**/*.tsx', '**/*.css'] },
  { name: 'backend', patterns: ['src/api/**', 'src/server/**'] },
  { name: 'tests', patterns: ['**/*.test.ts', '**/*.spec.ts'] },
  { name: 'config', patterns: ['*.yml', '*.json', '.github/**'] },
];

describe('globToRegex', () => {
  it('matches exact file names', () => {
    expect(globToRegex('action.yml').test('action.yml')).toBe(true);
    expect(globToRegex('action.yml').test('other.yml')).toBe(false);
  });

  it('matches single-star wildcard within segment', () => {
    expect(globToRegex('src/*.ts').test('src/index.ts')).toBe(true);
    expect(globToRegex('src/*.ts').test('src/sub/index.ts')).toBe(false);
  });

  it('matches double-star wildcard across segments', () => {
    expect(globToRegex('src/**').test('src/a/b/c.ts')).toBe(true);
    expect(globToRegex('**/*.tsx').test('deep/nested/Component.tsx')).toBe(true);
  });

  it('does not match partial paths', () => {
    expect(globToRegex('*.yml').test('nested/action.yml')).toBe(false);
  });
});

describe('classifyPath', () => {
  it('returns matching categories for a path', () => {
    expect(classifyPath('src/ui/Button.tsx', categories)).toEqual(['frontend']);
  });

  it('returns multiple categories when applicable', () => {
    const result = classifyPath('src/api/handler.test.ts', categories);
    expect(result).toContain('backend');
    expect(result).toContain('tests');
  });

  it('returns empty array when no category matches', () => {
    expect(classifyPath('docs/README.md', categories)).toEqual([]);
  });
});

describe('classifyPaths', () => {
  it('classifies multiple paths correctly', () => {
    const results = classifyPaths(
      ['src/ui/App.tsx', 'src/api/routes.ts', 'jest.config.json'],
      categories
    );
    expect(results).toHaveLength(3);
    expect(results[0].categories).toContain('frontend');
    expect(results[1].categories).toContain('backend');
    expect(results[2].categories).toContain('config');
  });
});

describe('aggregateCategories', () => {
  it('returns unique sorted category names', () => {
    const results = classifyPaths(
      ['src/ui/App.tsx', 'src/api/routes.ts', 'src/api/routes.test.ts'],
      categories
    );
    expect(aggregateCategories(results)).toEqual(['backend', 'frontend', 'tests']);
  });

  it('returns empty array when no categories matched', () => {
    expect(aggregateCategories([{ path: 'foo.md', categories: [] }])).toEqual([]);
  });
});
