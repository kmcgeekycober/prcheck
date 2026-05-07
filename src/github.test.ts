import { getPRContext, setCheckStatus, PRContext } from './github';

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: {
    repo: { owner: 'testowner', repo: 'testrepo' },
    payload: {
      pull_request: {
        number: 42,
        title: 'feat: add new feature',
        body: 'This PR adds a new feature.\n## Checklist\n- [x] Tests added',
        labels: [{ name: 'enhancement' }, { name: 'ready' }],
        head: { sha: 'abc123def456' },
      },
    },
  },
}));

jest.mock('@actions/core', () => ({ debug: jest.fn() }));

const mockListFiles = jest.fn();
const mockCreateCommitStatus = jest.fn();

const mockOctokit = {
  rest: {
    pulls: { listFiles: mockListFiles },
    repos: { createCommitStatus: mockCreateCommitStatus },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  const github = require('@actions/github');
  (github.getOctokit as jest.Mock).mockReturnValue(mockOctokit);
});

describe('getPRContext', () => {
  it('returns correct PR context with changed files', async () => {
    mockListFiles.mockResolvedValue({
      data: [{ filename: 'src/index.ts' }, { filename: 'README.md' }],
    });

    const ctx = await getPRContext('fake-token');

    expect(ctx.owner).toBe('testowner');
    expect(ctx.repo).toBe('testrepo');
    expect(ctx.prNumber).toBe(42);
    expect(ctx.title).toBe('feat: add new feature');
    expect(ctx.labels).toEqual(['enhancement', 'ready']);
    expect(ctx.changedFiles).toEqual(['src/index.ts', 'README.md']);
  });

  it('returns correct body from PR payload', async () => {
    mockListFiles.mockResolvedValue({ data: [] });

    const ctx = await getPRContext('fake-token');

    expect(ctx.body).toBe('This PR adds a new feature.\n## Checklist\n- [x] Tests added');
  });

  it('returns empty changedFiles when PR has no file changes', async () => {
    mockListFiles.mockResolvedValue({ data: [] });

    const ctx = await getPRContext('fake-token');

    expect(ctx.changedFiles).toEqual([]);
  });

  it('throws when not in a PR context', async () => {
    const github = require('@actions/github');
    github.context.payload.pull_request = undefined;

    await expect(getPRContext('fake-token')).rejects.toThrow(
      'This action must be run in the context of a pull request.'
    );

    // restore
    github.context.payload.pull_request = {
      number: 42,
      title: 'feat: add new feature',
      body: 'This PR adds a new feature.\n## Checklist\n- [x] Tests added',
      labels: [{ name: 'enhancement' }, { name: 'ready' }],
      head: { sha: 'abc123def456' },
    };
  });
});

describe('setCheckStatus', () => {
  const ctx: PRContext = {
    owner: 'testowner',
    repo: 'testrepo',
    prNumber: 42,
    title: 'feat: test',
    body: '',
    labels: [],
    changedFiles: [],
  };

  it('sets success status', async () => {
    mockCreateCommitStatus.mockResolvedValue({});
    await setCheckStatus('fake-token', ctx, true, 'All checks passed');

    expect(mockCreateCommitStatus).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'success', context: 'prcheck' })
    );
  });

  it('sets failure status', async () => {
    mockCreateCommitStatus.mockResolvedValue({});
    await setCheckStatus('fake-token', ctx, false, 'Validation failed');

    expect(mockCreateCommitStatus).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'failure' })
    );
  });

  it('includes the description in the status call', async () => {
    mockCreateCommitStatus.mockResolvedValue({});
    await setCheckStatus('fake-token', ctx, true, 'All checks passed');

    expect(mockCreateCommitStatus).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'All checks passed' })
    );
  });
});
