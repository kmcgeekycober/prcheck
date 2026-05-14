import * as core from "@actions/core";
import { validateMilestone, buildMilestoneValidationMessage, MilestoneOptions } from "./pr-milestone-validator";

export interface MilestoneValidatorService {
  validate(milestone: { title: string } | null): { valid: boolean; message: string };
}

export function loadMilestoneOptionsFromInputs(): MilestoneOptions {
  const requireMilestone = core.getInput("require_milestone") === "true";
  const allowedPattern = core.getInput("milestone_pattern") || undefined;
  const blockedPatterns = core
    .getInput("blocked_milestone_patterns")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    requireMilestone,
    allowedPattern: allowedPattern ? new RegExp(allowedPattern) : undefined,
    blockedPatterns: blockedPatterns.map((p) => new RegExp(p)),
  };
}

export function createMilestoneValidatorService(
  options: MilestoneOptions
): MilestoneValidatorService {
  return {
    validate(milestone) {
      const result = validateMilestone(milestone, options);
      const message = buildMilestoneValidationMessage(result);
      return { valid: result.valid, message };
    },
  };
}
