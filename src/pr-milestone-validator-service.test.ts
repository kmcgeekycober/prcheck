import { createMilestoneValidatorService, loadMilestoneOptionsFromInputs } from "./pr-milestone-validator-service";
import * as core from "@actions/core";

jest.mock("@actions/core");

const mockGetInput = core.getInput as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("loadMilestoneOptionsFromInputs", () => {
  it("returns defaults when inputs are empty", () => {
    mockGetInput.mockReturnValue("");
    const opts = loadMilestoneOptionsFromInputs();
    expect(opts.requireMilestone).toBe(false);
    expect(opts.allowedPattern).toBeUndefined();
    expect(opts.blockedPatterns).toEqual([]);
  });

  it("parses requireMilestone=true", () => {
    mockGetInput.mockImplementation((key: string) => {
      if (key === "require_milestone") return "true";
      return "";
    });
    const opts = loadMilestoneOptionsFromInputs();
    expect(opts.requireMilestone).toBe(true);
  });

  it("parses milestone_pattern into a RegExp", () => {
    mockGetInput.mockImplementation((key: string) => {
      if (key === "milestone_pattern") return "^v\\d+\\.\\d+";
      return "";
    });
    const opts = loadMilestoneOptionsFromInputs();
    expect(opts.allowedPattern).toBeInstanceOf(RegExp);
    expect(opts.allowedPattern!.test("v1.2")).toBe(true);
  });

  it("parses blocked_milestone_patterns into RegExp array", () => {
    mockGetInput.mockImplementation((key: string) => {
      if (key === "blocked_milestone_patterns") return "^WIP,^DRAFT";
      return "";
    });
    const opts = loadMilestoneOptionsFromInputs();
    expect(opts.blockedPatterns).toHaveLength(2);
    expect(opts.blockedPatterns![0].test("WIP sprint")).toBe(true);
  });
});

describe("createMilestoneValidatorService", () => {
  it("returns valid when milestone is present and no constraints", () => {
    const svc = createMilestoneValidatorService({ requireMilestone: false });
    const result = svc.validate({ title: "v1.0" });
    expect(result.valid).toBe(true);
  });

  it("returns invalid when milestone required but missing", () => {
    const svc = createMilestoneValidatorService({ requireMilestone: true });
    const result = svc.validate(null);
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it("returns invalid when milestone matches blocked pattern", () => {
    const svc = createMilestoneValidatorService({
      requireMilestone: false,
      blockedPatterns: [/^WIP/],
    });
    const result = svc.validate({ title: "WIP milestone" });
    expect(result.valid).toBe(false);
  });

  it("returns valid when milestone matches allowed pattern", () => {
    const svc = createMilestoneValidatorService({
      requireMilestone: true,
      allowedPattern: /^v\d+\.\d+/,
    });
    const result = svc.validate({ title: "v2.3" });
    expect(result.valid).toBe(true);
  });
});
