import { extractFilenames, ChangedFile } from './diff';

describe('extractFilenames', () => {
  it('returns filenames from changed files', () => {
    const files: ChangedFile[] = [
      { filename: 'src/index.ts', status: 'modified', additions: 5, deletions: 2 },
      { filename: 'README.md', status: 'modified', additions: 1, deletions: 0 },
    ];
    expect(extractFilenames(files)).toEqual(['src/index.ts', 'README.md']);
  });

  it('returns empty array for no files', () => {
    expect(extractFilenames([])).toEqual([]);
  });

  it('includes added and removed files', () => {
    const files: ChangedFile[] = [
      { filename: 'new-file.ts', status: 'added', additions: 10, deletions: 0 },
      { filename: 'old-file.ts', status: 'removed', additions: 0, deletions: 20 },
    ];
    expect(extractFilenames(files)).toEqual(['new-file.ts', 'old-file.ts']);
  });

  it('handles renamed files', () => {
    const files: ChangedFile[] = [
      { filename: 'src/renamed.ts', status: 'renamed', additions: 0, deletions: 0 },
    ];
    expect(extractFilenames(files)).toEqual(['src/renamed.ts']);
  });
});

describe('getChangedFiles (mock)', () => {
  it('maps API response to ChangedFile shape', async () => {
    const mockOctokit = {
      rest: {
        pulls: {
          listFiles: jest.fn().mockResolvedValueOnce({
            data: [
              { filename: 'src/foo.ts', status: 'added', additions: 3, deletions: 0 },
            ],
          }).mockResolvedValueOnce({ data: [] }),
        },
      },
    } as any;

    const { getChangedFiles } = await import('./diff');
    const result = await getChangedFiles(mockOctokit, 'owner', 'repo', 1);
    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe('src/foo.ts');
    expect(result[0].status).toBe('added');
  });
});
