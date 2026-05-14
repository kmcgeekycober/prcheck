import {
  validateDraftStatus,
  buildDraftValidationMessage,
  DraftValidationOptions,
} from "./pr-draft-validator";

describe("validateDraftStatus", () => {
  it("returns no issues for non-draft PRs", () => {
    const result = validateDraftStatus(false, { blockIfDraft: true, warnIfDraft: true });
    expect(result.isDraft).toBe(false);
    expect(result.blocked).toBe(false);
    expect(result.warned).toBe(false);
    expect(result.label).toBeNull();
    expect(result.message).toBeNull();
  });

  it("blocks when blockIfDraft is true and PR is draft", () => {
    const result = validateDraftStatus(true, { blockIfDraft: true });
    expect(result.isDraft).toBe(true);
    expect(result.blocked).toBe(true);
    expect(result.warned).toBe(false);
    expect(result.message).toContain("draft");
  });

  it("warns when warnIfDraft is true and PR is draft", () => {
    const result = validateDraftStatus(true, { warnIfDraft: true });
    expect(result.isDraft).toBe(true);
    expect(result.blocked).toBe(false);
    expect(result.warned).toBe(true);
    expect(result.message).toContain("Warning");
  });

  it("block takes precedence over warn", () => {
    const result = validateDraftStatus(true, { blockIfDraft: true, warnIfDraft: true });
    expect(result.blocked).toBe(true);
    expect(result.warned).toBe(false);
  });

  it("applies draftLabel when PR is draft", () => {
    const result = validateDraftStatus(true, { draftLabel: "status: draft" });
    expect(result.label).toBe("status: draft");
  });

  it("does not apply draftLabel when PR is not draft", () => {
    const result = validateDraftStatus(false, { draftLabel: "status: draft" });
    expect(result.label).toBeNull();
  });

  it("returns no label when draftLabel is not set", () => {
    const result = validateDraftStatus(true, { blockIfDraft: true });
    expect(result.label).toBeNull();
  });

  it("returns null message when no options set and PR is draft", () => {
    const result = validateDraftStatus(true, {});
    expect(result.blocked).toBe(false);
    expect(result.warned).toBe(false);
    expect(result.message).toBeNull();
  });
});

describe("buildDraftValidationMessage", () => {
  it("returns block message when blocked", () => {
    const msg = buildDraftValidationMessage(true, false);
    expect(msg).toContain("ready for review");
  });

  it("returns warn message when warned", () => {
    const msg = buildDraftValidationMessage(false, true);
    expect(msg).toContain("Warning");
  });

  it("returns null when neither blocked nor warned", () => {
    const msg = buildDraftValidationMessage(false, false);
    expect(msg).toBeNull();
  });
});
