import { syncLabels } from './labeler';
import { MatchResult } from './matcher';

const makeOctokit = (overrides?: object) => ({
  rest: {
    issues: {
      addLabels: jest.fn().mockResolvedValue({}),
      removeLabel: jest.fn().mockResolvedValue({}),
    },
  },
  ...overrides,
});

const baseMatch: MatchResult = {
  matchedRules: [],
  requiredLabels: ['bug', 'needs-review'],
  removeLabels: [],
  templateSections: [],
};

describe('syncLabels', () => {
  it('adds missing labels and skips existing ones', async () => {
    const octokit = makeOctokit();
    const result = await syncLabels(
      octokit as any, 'owner', 'repo', 1,
      baseMatch, ['needs-review']
    );
    expect(result.added).toEqual(['bug']);
    expect(result.unchanged).toEqual(['needs-review']);
    expect(result.removed).toEqual([]);
    expect(octokit.rest.issues.addLabels).toHaveBeenCalledWith(
      expect.objectContaining({ labels: ['bug'] })
    );
  });

  it('removes labels listed in removeLabels', async () => {
    const octokit = makeOctokit();
    const match: MatchResult = { ...baseMatch, removeLabels: ['stale'] };
    const result = await syncLabels(
      octokit as any, 'owner', 'repo', 1,
      match, ['needs-review', 'stale']
    );
    expect(result.removed).toEqual(['stale']);
    expect(octokit.rest.issues.removeLabel).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'stale' })
    );
  });

  it('returns no changes when labels already match', async () => {
    const octokit = makeOctokit();
    const result = await syncLabels(
      octokit as any, 'owner', 'repo', 1,
      baseMatch, ['bug', 'needs-review']
    );
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.unchanged).toHaveLength(2);
    expect(octokit.rest.issues.addLabels).not.toHaveBeenCalled();
  });

  it('skips API calls in dry-run mode', async () => {
    const octokit = makeOctokit();
    const result = await syncLabels(
      octokit as any, 'owner', 'repo', 1,
      baseMatch, [], true
    );
    expect(result.added).toEqual(['bug', 'needs-review']);
    expect(octokit.rest.issues.addLabels).not.toHaveBeenCalled();
  });

  it('captures errors without throwing', async () => {
    const octokit = makeOctokit({
      rest: {
        issues: {
          addLabels: jest.fn().mockRejectedValue(new Error('API error')),
          removeLabel: jest.fn(),
        },
      },
    });
    const result = await syncLabels(
      octokit as any, 'owner', 'repo', 1,
      baseMatch, []
    );
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch('API error');
  });
});
