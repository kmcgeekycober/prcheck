import * as core from "@actions/core";
import {
  validateAssignees,
  buildAssigneeValidationMessage,
  AssigneeOptions,
  AssigneeValidationResult,
} from "./pr-assignee-validator";

export function loadAssigneeOptionsFromInputs(): Partial<AssigneeOptions> {
  const requireAssignee = core.getInput("require-assignee") === "true";
  const minRaw = core.getInput("min-assignees");
  const maxRaw = core.getInput("max-assignees");
  const allowedRaw = core.getInput("allowed-assignees");

  const opts: Partial<AssigneeOptions> = {};

  if (requireAssignee) opts.requireAssignee = true;

  if (minRaw) {
    const min = parseInt(minRaw, 10);
    if (!isNaN(min)) opts.minAssignees = min;
  }

  if (maxRaw) {
    const max = parseInt(maxRaw, 10);
    if (!isNaN(max)) opts.maxAssignees = max;
  }

  if (allowedRaw) {
    opts.allowedAssignees = allowedRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return opts;
}

export interface AssigneeValidatorService {
  validate(assignees: string[]): AssigneeValidationResult;
  formatMessage(result: AssigneeValidationResult): string;
}

export function createAssigneeValidatorService(
  options: Partial<AssigneeOptions> = {}
): AssigneeValidatorService {
  return {
    validate(assignees: string[]): AssigneeValidationResult {
      return validateAssignees(assignees, options);
    },
    formatMessage(result: AssigneeValidationResult): string {
      return buildAssigneeValidationMessage(result);
    },
  };
}
