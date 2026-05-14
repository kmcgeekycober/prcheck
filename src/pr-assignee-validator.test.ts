import { validateAssignees, buildAssigneeValidationMessage } from "./pr-assignee-validator";

describe("validateAssignees", () => {
  it("passes when no requirements and no assignees", () => {
    const result = validateAssignees([]);
    expect(result.valid).toBe(true);
  });

  it("fails when requireAssignee is true and no assignees", () => {
    const result = validateAssignees([], { requireAssignee: true });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/at least one assignee/);
  });

  it("passes when requireAssignee is true and assignee present", () => {
    const result = validateAssignees(["alice"], { requireAssignee: true });
    expect(result.valid).toBe(true);
  });

  it("fails when fewer assignees than minAssignees", () => {
    const result = validateAssignees(["alice"], { minAssignees: 2 });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/at least 2/);
  });

  it("passes when assignees meet minAssignees", () => {
    const result = validateAssignees(["alice", "bob"], { minAssignees: 2 });
    expect(result.valid).toBe(true);
  });

  it("fails when more assignees than maxAssignees", () => {
    const result = validateAssignees(["a", "b", "c"], { maxAssignees: 2 });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/at most 2/);
  });

  it("fails when assignee not in allowedAssignees", () => {
    const result = validateAssignees(["alice", "charlie"], {
      allowedAssignees: ["alice", "bob"],
    });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/charlie/);
  });

  it("passes when all assignees are in allowedAssignees", () => {
    const result = validateAssignees(["alice", "bob"], {
      allowedAssignees: ["alice", "bob", "charlie"],
    });
    expect(result.valid).toBe(true);
  });

  it("passes with empty allowedAssignees list (no restriction)", () => {
    const result = validateAssignees(["anyone"], { allowedAssignees: [] });
    expect(result.valid).toBe(true);
  });
});

describe("buildAssigneeValidationMessage", () => {
  it("returns checkmark for valid result", () => {
    const msg = buildAssigneeValidationMessage({ valid: true, message: "Assignees are valid.", assignees: [] });
    expect(msg).toMatch(/^✅/);
  });

  it("returns cross for invalid result", () => {
    const msg = buildAssigneeValidationMessage({ valid: false, message: "PR must have at least one assignee.", assignees: [] });
    expect(msg).toMatch(/^❌/);
  });
});
