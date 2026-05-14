import * as core from "@actions/core";
import {
  createCommitValidatorService,
  loadCommitOptionsFromInputs,
} from "./pr-commit-validator-service";

jest.mock("@actions/core");

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

function setupInputs(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    require_conventional_commits: "true",
    conventional_commit_types: "",
    min_commits: "",
    max_commits: "",
  };
  mockGetInput.mockImplementation((key) => overrides[key] ?? defaults[key] ?? "");
}

describe("loadCommitOptionsFromInputs", () => {
  it("loads defaults", () => {
    setupInputs();
    const opts = loadCommitOptionsFromInputs();
    expect(opts.requireConventional).toBe(true);
    expect(opts.allowedTypes).toBeUndefined();
    expect(opts.minCount).toBeUndefined();
    expect(opts.maxCount).toBeUndefined();
  });

  it("parses custom types", () => {
    setupInputs({ conventional_commit_types: "feat, fix, chore" });
    const opts = loadCommitOptionsFromInputs();
    expect(opts.allowedTypes).toEqual(["feat", "fix", "chore"]);
  });

  it("parses min and max counts", () => {
    setupInputs({ min_commits: "1", max_commits: "5" });
    const opts = loadCommitOptionsFromInputs();
    expect(opts.minCount).toBe(1);
    expect(opts.maxCount).toBe(5);
  });

  it("disables conventional when set to false", () => {
    setupInputs({ require_conventional_commits: "false" });
    const opts = loadCommitOptionsFromInputs();
    expect(opts.requireConventional).toBe(false);
  });
});

describe("createCommitValidatorService", () => {
  it("validates commits using provided options", () => {
    const svc = createCommitValidatorService({ requireConventional: true });
    const result = svc.validate(["feat: something"]);
    expect(result.valid).toBe(true);
  });

  it("returns failure message on invalid commits", () => {
    const svc = createCommitValidatorService({ requireConventional: true });
    const result = svc.validate(["bad commit"]);
    const msg = svc.message(result);
    expect(result.valid).toBe(false);
    expect(msg).toContain("Commit validation failed");
  });

  it("returns success message on valid commits", () => {
    const svc = createCommitValidatorService({ requireConventional: false });
    const result = svc.validate(["anything goes"]);
    const msg = svc.message(result);
    expect(result.valid).toBe(true);
    expect(msg).toBe("All commits passed validation.");
  });
});
