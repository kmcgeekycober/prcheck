import {
  validateMilestone,
  buildMilestoneValidationMessage,
} from "./pr-milestone-validator";

describe("validateMilestone", () => {
  it("passes when milestone is not required and none is set", () => {
    const result = validateMilestone(null, { required: false });
    expect(result.valid).toBe(true);
    expect(result.milestone).toBeNull();
    expect(result.message).toBeNull();
  });

  it("fails when milestone is required and none is set", () => {
    const result = validateMilestone(undefined, { required: true });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/must be assigned/);
  });

  it("passes when milestone is required and is set", () => {
    const result = validateMilestone("v1.2", { required: true });
    expect(result.valid).toBe(true);
    expect(result.milestone).toBe("v1.2");
  });

  it("passes when milestone matches allowed list (case-insensitive)", () => {
    const result = validateMilestone("V1.2", {
      required: true,
      allowedMilestones: ["v1.2", "v2.0"],
    });
    expect(result.valid).toBe(true);
    expect(result.milestone).toBe("V1.2");
  });

  it("fails when milestone is not in the allowed list", () => {
    const result = validateMilestone("v3.0", {
      required: false,
      allowedMilestones: ["v1.2", "v2.0"],
    });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/not in the allowed list/);
    expect(result.message).toContain("v1.2");
  });

  it("trims whitespace from milestone value", () => {
    const result = validateMilestone("  v1.2  ", { required: true });
    expect(result.valid).toBe(true);
    expect(result.milestone).toBe("v1.2");
  });
});

describe("buildMilestoneValidationMessage", () => {
  it("returns success message when valid with milestone", () => {
    const msg = buildMilestoneValidationMessage({
      valid: true,
      message: null,
      milestone: "v2.0",
    });
    expect(msg).toContain("✅");
    expect(msg).toContain("v2.0");
  });

  it("returns no-milestone-required message when valid without milestone", () => {
    const msg = buildMilestoneValidationMessage({
      valid: true,
      message: null,
      milestone: null,
    });
    expect(msg).toContain("No milestone required");
  });

  it("returns failure message when invalid", () => {
    const msg = buildMilestoneValidationMessage({
      valid: false,
      message: "A milestone must be assigned to this PR.",
      milestone: null,
    });
    expect(msg).toContain("❌");
    expect(msg).toContain("milestone validation failed");
  });
});
