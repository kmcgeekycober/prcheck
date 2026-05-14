import {
  validateCommitMessage,
  validateCommits,
  buildCommitValidationMessage,
  CommitValidationOptions,
} from "./pr-commit-validator";

describe("validateCommitMessage", () => {
  const types = ["feat", "fix", "chore", "docs"];

  it("accepts a valid conventional commit", () => {
    expect(validateCommitMessage("feat: add login page", types)).toBe(true);
  });

  it("accepts a scoped commit", () => {
    expect(validateCommitMessage("fix(auth): handle token expiry", types)).toBe(true);
  });

  it("accepts a breaking change commit", () => {
    expect(validateCommitMessage("feat!: remove legacy API", types)).toBe(true);
  });

  it("rejects a commit with unknown type", () => {
    expect(validateCommitMessage("wip: something", types)).toBe(false);
  });

  it("rejects a plain message", () => {
    expect(validateCommitMessage("updated stuff", types)).toBe(false);
  });
});

describe("validateCommits", () => {
  const base: CommitValidationOptions = { requireConventional: true };

  it("returns valid when all commits conform", () => {
    const result = validateCommits(["feat: new feature", "fix: bug"], base);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("reports non-conforming commits", () => {
    const result = validateCommits(["WIP stuff"], base);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("WIP stuff");
  });

  it("enforces minCount", () => {
    const result = validateCommits([], { ...base, minCount: 1 });
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("at least 1");
  });

  it("enforces maxCount", () => {
    const msgs = ["feat: a", "feat: b", "feat: c"];
    const result = validateCommits(msgs, { ...base, maxCount: 2 });
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain("at most 2");
  });

  it("skips conventional check when disabled", () => {
    const result = validateCommits(["random message"], { requireConventional: false });
    expect(result.valid).toBe(true);
  });
});

describe("buildCommitValidationMessage", () => {
  it("returns success message when valid", () => {
    const msg = buildCommitValidationMessage({ valid: true, commitCount: 2, violations: [] });
    expect(msg).toBe("All commits passed validation.");
  });

  it("lists violations when invalid", () => {
    const msg = buildCommitValidationMessage({
      valid: false,
      commitCount: 1,
      violations: ["Commit does not follow Conventional Commits: \"bad msg\""],
    });
    expect(msg).toContain("Commit validation failed");
    expect(msg).toContain("- Commit does not follow");
  });
});
