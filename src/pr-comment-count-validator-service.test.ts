import { loadCommentCountOptionsFromInputs, createCommentCountService } from './pr-comment-count-validator-service';

const mockGetInput = jest.fn();
jest.mock('@actions/core', () => ({ getInput: (k: string) => mockGetInput(k) }));

function setupInputs(overrides: Record<string, string> = {}) {
  mockGetInput.mockImplementation((key: string) => overrides[key] ?? '');
}

describe('loadCommentCountOptionsFromInputs', () => {
  beforeEach(() => mockGetInput.mockReset());

  it('returns empty options when no inputs set', () => {
    setupInputs();
    const opts = loadCommentCountOptionsFromInputs();
    expect(opts.minComments).toBeUndefined();
    expect(opts.maxComments).toBeUndefined();
    expect(opts.requireResolved).toBe(false);
  });

  it('parses min and max comment counts', () => {
    setupInputs({ 'min-comments': '2', 'max-comments': '10' });
    const opts = loadCommentCountOptionsFromInputs();
    expect(opts.minComments).toBe(2);
    expect(opts.maxComments).toBe(10);
  });

  it('parses requireResolved flag', () => {
    setupInputs({ 'require-resolved-comments': 'true' });
    const opts = loadCommentCountOptionsFromInputs();
    expect(opts.requireResolved).toBe(true);
  });
});

describe('createCommentCountService', () => {
  it('returns valid when count is within range', () => {
    const svc = createCommentCountService({ minComments: 1, maxComments: 5 });
    const result = svc.validate(3);
    expect(result.valid).toBe(true);
    expect(result.commentCount).toBe(3);
  });

  it('returns invalid when count is below minimum', () => {
    const svc = createCommentCountService({ minComments: 3 });
    const result = svc.validate(1);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('1');
  });

  it('returns invalid when count exceeds maximum', () => {
    const svc = createCommentCountService({ maxComments: 5 });
    const result = svc.validate(8);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('8');
  });

  it('returns invalid when unresolved comments exist and requireResolved is true', () => {
    const svc = createCommentCountService({ requireResolved: true });
    const result = svc.validate(4, 2);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('2 unresolved');
  });

  it('returns valid when requireResolved is true and all comments resolved', () => {
    const svc = createCommentCountService({ requireResolved: true });
    const result = svc.validate(4, 0);
    expect(result.valid).toBe(true);
  });
});
