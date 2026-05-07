import { createPathClassifierService } from './path-classifier-service';
import { PathCategory } from './path-classifier';

const categories: PathCategory[] = [
  { name: 'infra', patterns: ['terraform/**', '.github/**'] },
  { name: 'docs', patterns: ['docs/**', '**/*.md'] },
  { name: 'source', patterns: ['src/**'] },
];

describe('createPathClassifierService', () => {
  const service = createPathClassifierService(categories);

  describe('classify', () => {
    it('returns classification results for each path', () => {
      const results = service.classify(['src/index.ts', 'docs/guide.md']);
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ path: 'src/index.ts', categories: ['source'] });
      expect(results[1]).toEqual({ path: 'docs/guide.md', categories: ['docs'] });
    });

    it('returns empty categories for unmatched paths', () => {
      const results = service.classify(['random/file.xyz']);
      expect(results[0].categories).toEqual([]);
    });

    it('handles empty paths array', () => {
      expect(service.classify([])).toEqual([]);
    });
  });

  describe('getMatchedCategories', () => {
    it('returns unique category names across all paths', () => {
      const cats = service.getMatchedCategories([
        'src/api.ts',
        'terraform/main.tf',
        'docs/setup.md',
      ]);
      expect(cats).toEqual(['docs', 'infra', 'source']);
    });

    it('returns empty array when nothing matches', () => {
      expect(service.getMatchedCategories(['unknown/path.bin'])).toEqual([]);
    });

    it('deduplicates categories matched by multiple paths', () => {
      const cats = service.getMatchedCategories([
        'src/a.ts',
        'src/b.ts',
        'src/c.ts',
      ]);
      expect(cats).toEqual(['source']);
    });
  });
});
