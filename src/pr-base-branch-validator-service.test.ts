import {
  loadBaseBranchOptionsFromInputs,
  createBaseBranchValidatorService,
  BaseBranchOptions,
} from "./pr-base-branch-validator-service";

const mockGetInput = jest.fn();
jest.mock("@actions/core", () => ({ getInput: (k: string) => mockGetInput(k) }));

function setupInputs(map: Record<string, string>) {
  mockGetInput.mockImplementation((k: string) => map[k] ?? "");
}

describe("loadBaseBranchOptionsFromInputs", () => {
  it("parses allowed and blocked patterns from inputs", () => {
    setupInputs({
      "base-branch-allowed": "main, develop",
      "base-branch-blocked": "master",
      "base-branch-require": "",
    });
    const opts = loadBaseBranchOptionsFromInputs();
    expect(opts.allowedPatterns).toEqual(["main", "develop"]);
    expect(opts.blockedPatterns).toEqual(["master"]);
    expect(opts.requirePattern).toBeUndefined();
  });

  it("sets requirePattern when provided", () => {
    setupInputs({
      "base-branch-allowed": "",
      "base-branch-blocked": "",
      "base-branch-require": "^main$",
    });
    const opts = loadBaseBranchOptionsFromInputs();
    expect(opts.requirePattern).toBe("^main$");
  });

  it("returns empty arrays when inputs are blank", () => {
    setupInputs({});
    const opts = loadBaseBranchOptionsFromInputs();
    expect(opts.allowedPatterns).toEqual([]);
    expect(opts.blockedPatterns).toEqual([]);
  });
});

describe("createBaseBranchValidatorService", () => {
  const options: BaseBranchOptions = {
    allowedPatterns: ["main", "develop"],
    blockedPatterns: ["master"],
  };

  it("returns valid for an allowed branch", () => {
    const svc = createBaseBranchValidatorService(options);
    const result = svc.validate("main");
    expect(result.valid).toBe(true);
  });

  it("returns invalid for a blocked branch", () => {
    const svc = createBaseBranchValidatorService(options);
    const result = svc.validate("master");
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it("returns invalid for a branch not in allowed list", () => {
    const svc = createBaseBranchValidatorService(options);
    const result = svc.validate("feature/foo");
    expect(result.valid).toBe(false);
  });

  it("returns valid when no restrictions are set", () => {
    const svc = createBaseBranchValidatorService({
      allowedPatterns: [],
      blockedPatterns: [],
    });
    const result = svc.validate("any-branch");
    expect(result.valid).toBe(true);
  });
});
