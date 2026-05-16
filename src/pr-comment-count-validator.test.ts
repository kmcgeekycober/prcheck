import {
  validateCommentCount,
  buildCommentCountMessage,
} from "./pr-comment-count-validator";

describe("validateCommentCount", () => {
  it("returns valid when no constraints are set", () => {
    const result = validateCommentCount(5, 2, {});
    expect(result.valid).toBe(true);
    expect(result.commentCount).toBe(5);
    expect(result.unresolvedCount).toBe(2);
  });

  it("fails when comment count is below minimum", () => {
    const result = validateCommentCount(1, 0, { minComments: 3 });
    expect(result.valid).toBe(false);
    expect(result.message).toContain("at least 3");
  });

  it("passes when comment count meets minimum", () => {
    const result = validateCommentCount(3, 0, { minComments: 3 });
    expect(result.valid).toBe(true);
  });

  it("fails when comment count exceeds maximum", () => {
    const result = validateCommentCount(10, 0, { maxComments: 5 });
    expect(result.valid).toBe(false);
    expect(result.message).toContain("exceeds the maximum of 5");
  });

  it("passes when comment count is within maximum", () => {
    const result = validateCommentCount(4, 0, { maxComments: 5 });
    expect(result.valid).toBe(true);
  });

  it("fails when unresolved comments exist and requireResolved is true", () => {
    const result = validateCommentCount(5, 3, { requireResolved: true });
    expect(result.valid).toBe(false);
    expect(result.message).toContain("3 unresolved comment(s)");
  });

  it("passes when all comments are resolved and requireResolved is true", () => {
    const result = validateCommentCount(5, 0, { requireResolved: true });
    expect(result.valid).toBe(true);
  });

  it("requireResolved check takes priority over count checks", () => {
    const result = validateCommentCount(5, 1, {
      minComments: 2,
      maxComments: 10,
      requireResolved: true,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain("unresolved");
  });
});

describe("buildCommentCountMessage", () => {
  it("returns unresolved message when requireResolved fails", () => {
    const msg = buildCommentCountMessage(4, 2, { requireResolved: true });
    expect(msg).toContain("2 unresolved");
  });

  it("returns min message when below minimum", () => {
    const msg = buildCommentCountMessage(1, 0, { minComments: 5 });
    expect(msg).toContain("at least 5");
  });

  it("returns max message when above maximum", () => {
    const msg = buildCommentCountMessage(8, 0, { maxComments: 6 });
    expect(msg).toContain("exceeds the maximum of 6");
  });

  it("returns fallback message when no specific condition matches", () => {
    const msg = buildCommentCountMessage(3, 1, {});
    expect(msg).toContain("Comment count validation failed");
  });
});
