import * as core from "@actions/core";
import {
  validateBaseBranch,
  buildBaseBranchMessage,
} from "./pr-base-branch-validator";

export interface BaseBranchOptions {
  allowedPatterns: string[];
  blockedPatterns: string[];
  requirePattern?: string;
}

export function loadBaseBranchOptionsFromInputs(): BaseBranchOptions {
  const allowedRaw = core.getInput("base-branch-allowed");
  const blockedRaw = core.getInput("base-branch-blocked");
  const requirePattern = core.getInput("base-branch-require") || undefined;

  const allowedPatterns = allowedRaw
    ? allowedRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const blockedPatterns = blockedRaw
    ? blockedRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return { allowedPatterns, blockedPatterns, requirePattern };
}

export interface BaseBranchValidatorService {
  validate(baseBranch: string): { valid: boolean; message: string };
}

export function createBaseBranchValidatorService(
  options: BaseBranchOptions
): BaseBranchValidatorService {
  return {
    validate(baseBranch: string) {
      const result = validateBaseBranch(baseBranch, options);
      const message = buildBaseBranchMessage(result);
      return { valid: result.valid, message };
    },
  };
}
