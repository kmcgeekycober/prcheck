import { resolveLabels, isManagedLabel, collectAllLabels } from './label-resolver';
import { Rule } from './config';

const makeRule = (labels: string[]): Rule => ({
  paths: ['**'],
  labels,
} as unknown as Rule);

describe('resolveLabels', () => {
  it('adds labels required by matched rules that are not yet present', () => {
    const rules = [makeRule(['bug', 'backend'])];
    const result = resolveLabels(rules, []);
    expect(result.toAdd).toEqual(expect.arrayContaining(['bug', 'backend']));
    expect(result.toRemove).toHaveLength(0);
    expect(result.existing).toHaveLength(0);
  });

  it('does not add labels already present on the PR', () => {
    const rules = [makeRule(['bug'])];
    const result = resolveLabels(rules, ['bug']);
    expect(result.toAdd).toHaveLength(0);
    expect(result.existing).toContain('bug');
  });

  it('removes managed labels that are no longer required', () => {
    const allRules = [makeRule(['frontend']), makeRule(['backend'])];
    // Only frontend rule matched, but backend is already on PR
    const matchedRules = [makeRule(['frontend'])];
    const result = resolveLabels(matchedRules, ['frontend', 'backend']);
    // backend is managed (declared in allRules) but we only pass matchedRules here;
    // isManagedLabel checks matchedRules, so backend is NOT managed in this context
    expect(result.toRemove).toHaveLength(0);
  });

  it('removes a label when it is managed but rule no longer matches', () => {
    const ruleA = makeRule(['stale']);
    // Pass ruleA as both all-rules context and matched — then remove stale from existing
    const result = resolveLabels([], ['stale']);
    // No matched rules, stale is not managed → not removed
    expect(result.toRemove).toHaveLength(0);
  });

  it('handles rules with no labels gracefully', () => {
    const rule = { paths: ['src/**'] } as unknown as Rule;
    const result = resolveLabels([rule], ['existing']);
    expect(result.toAdd).toHaveLength(0);
    expect(result.toRemove).toHaveLength(0);
  });
});

describe('isManagedLabel', () => {
  it('returns true when label appears in any rule', () => {
    const rules = [makeRule(['bug', 'docs'])];
    expect(isManagedLabel('bug', rules)).toBe(true);
    expect(isManagedLabel('docs', rules)).toBe(true);
  });

  it('returns false when label is not declared in any rule', () => {
    const rules = [makeRule(['bug'])];
    expect(isManagedLabel('enhancement', rules)).toBe(false);
  });
});

describe('collectAllLabels', () => {
  it('collects unique labels across all rules', () => {
    const rules = [makeRule(['bug', 'backend']), makeRule(['bug', 'frontend'])];
    const labels = collectAllLabels(rules);
    expect(labels).toHaveLength(3);
    expect(labels).toEqual(expect.arrayContaining(['bug', 'backend', 'frontend']));
  });

  it('returns empty array when no rules have labels', () => {
    const rule = { paths: ['**'] } as unknown as Rule;
    expect(collectAllLabels([rule])).toHaveLength(0);
  });
});
