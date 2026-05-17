import { createCommentCountService } from './pr-comment-count-validator-service';
import { validateCommentCount, buildCommentCountMessage } from './pr-comment-count-validator';

describe('comment count integration', () => {
  it('service and validator agree on validity', () => {
    const options = { minComments: 2, maxComments: 8 };
    const svc = createCommentCountService(options);

    const counts = [0, 1, 2, 5, 8, 9, 15];
    for (const count of counts) {
      const svcResult = svc.validate(count);
      const rawResult = validateCommentCount(count, options);
      expect(svcResult.valid).toBe(rawResult.valid);
    }
  });

  it('service message matches buildCommentCountMessage on failure', () => {
    const options = { maxComments: 3 };
    const svc = createCommentCountService(options);
    const count = 7;
    const svcResult = svc.validate(count);
    const expectedMsg = buildCommentCountMessage(count, options);
    expect(svcResult.valid).toBe(false);
    expect(svcResult.message).toBe(expectedMsg);
  });

  it('unresolved check takes precedence over count validity', () => {
    const options = { minComments: 1, requireResolved: true };
    const svc = createCommentCountService(options);
    const result = svc.validate(5, 3);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/unresolved/i);
  });

  it('returns empty message when valid', () => {
    const svc = createCommentCountService({ minComments: 1, maxComments: 10 });
    const result = svc.validate(4);
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });
});
