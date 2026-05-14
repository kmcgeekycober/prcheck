import * as core from "@actions/core";
import {
  validateCommits,
  buildCommitValidationMessage,
  CommitValidationOptions,
  CommitValidationResult,
} from "./pr-commit-validator";

export function loadCommitOptionsFromInputs(): CommitValidationOptions {
  const requireConventional =
    core.getInput("require_conventional_commits").toLowerCase() !== "false";

  const rawTypes = core.getInput("conventional_commit_types");
  const allowedTypes = rawTypes
    ? rawTypes.split(",").map((t) => t.trim()).filter(Boolean)
    : undefined;

  const minRaw = core.getInput("min_commits");
  const maxRaw = core.getInput("max_commits");

  return {
    requireConventional,
    allowedTypes,
    minCount: minRaw ? parseInt(minRaw, 10) : undefined,
    maxCount: maxRaw ? parseInt(maxRaw, 10) : undefined,
  };
}

export interface CommitValidatorService {
  validate(messages: string[]): CommitValidationResult;
  message(result: CommitValidationResult): string;
}

export function createCommitValidatorService(
  options?: CommitValidationOptions
): CommitValidatorService {
  const opts = options ?? loadCommitOptionsFromInputs();
  return {
    validate(messages: string[]): CommitValidationResult {
      return validateCommits(messages, opts);
    },
    message(result: CommitValidationResult): string {
      return buildCommitValidationMessage(result);
    },
  };
}
