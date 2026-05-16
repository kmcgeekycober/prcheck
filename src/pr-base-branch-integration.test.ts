import { createBaseBranchValidatorService } from "./pr-base-branch-validator-service";

describe("base branch validator integration", () => {
  it("blocks a PR targeting master when only main is allowed", () => {
    const svc = createBaseBranchValidatorService({
      allowedPatterns: ["main"],
      blockedPatterns: [],
    });
    const { valid, message } = svc.validate("master");
    expect(valid).toBe(false);
    expect(message).toMatch(/master/);
  });

  it("allows a PR targeting develop when develop matches allowed glob", () => {
    const svc = createBaseBranchValidatorService({
      allowedPatterns: ["develop", "release/*"],
      blockedPatterns: [],
    });
    expect(svc.validate("develop").valid).toBe(true);
    expect(svc.validate("release/1.0").valid).toBe(true);
  });

  it("blocked pattern takes precedence over allowed", () => {
    const svc = createBaseBranchValidatorService({
      allowedPatterns: ["release/*"],
      blockedPatterns: ["release/old"],
    });
    expect(svc.validate("release/new").valid).toBe(true);
    expect(svc.validate("release/old").valid).toBe(false);
  });

  it("requirePattern enforces exact format", () => {
    const svc = createBaseBranchValidatorService({
      allowedPatterns: [],
      blockedPatterns: [],
      requirePattern: "^(main|develop)$",
    });
    expect(svc.validate("main").valid).toBe(true);
    expect(svc.validate("feature/foo").valid).toBe(false);
  });
});
