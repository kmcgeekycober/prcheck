import { validateMilestone, buildMilestoneValidationMessage } from "./pr-milestone-validator";
import { createMilestoneValidatorService } from "./pr-milestone-validator-service";

describe("milestone validation integration", () => {
  it("full flow: required milestone missing produces a non-empty message", () => {
    const options = { requireMilestone: true };
    const raw = validateMilestone(null, options);
    expect(raw.valid).toBe(false);
    const msg = buildMilestoneValidationMessage(raw);
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("full flow: valid milestone with pattern passes", () => {
    const options = { requireMilestone: true, allowedPattern: /^Sprint \d+$/ };
    const raw = validateMilestone({ title: "Sprint 42" }, options);
    expect(raw.valid).toBe(true);
    const msg = buildMilestoneValidationMessage(raw);
    expect(msg).toBe("");
  });

  it("service and direct validator agree on blocked milestone", () => {
    const options = { requireMilestone: false, blockedPatterns: [/^HOLD/] };
    const svc = createMilestoneValidatorService(options);
    const directResult = validateMilestone({ title: "HOLD release" }, options);
    const svcResult = svc.validate({ title: "HOLD release" });
    expect(svcResult.valid).toBe(directResult.valid);
    expect(svcResult.valid).toBe(false);
  });

  it("service returns empty message for passing milestone", () => {
    const options = { requireMilestone: false };
    const svc = createMilestoneValidatorService(options);
    const result = svc.validate({ title: "Anything" });
    expect(result.valid).toBe(true);
    expect(result.message).toBe("");
  });

  it("blocked pattern takes precedence even when allowedPattern matches", () => {
    const options = {
      requireMilestone: true,
      allowedPattern: /^v\d+/,
      blockedPatterns: [/^v0\./],
    };
    const svc = createMilestoneValidatorService(options);
    const result = svc.validate({ title: "v0.1" });
    expect(result.valid).toBe(false);
  });
});
