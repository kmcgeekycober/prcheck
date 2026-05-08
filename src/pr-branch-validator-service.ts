/**
 * Service wrapper for branch name validation, reading options from action inputs.
 */

import * as core from '@actions/core';
import {
  BranchValidationOptions,
  BranchValidationResult,
  validateBranchName,
} from './pr-branch-validator';

export interface BranchValidatorService {
  validate(branchName: string): BranchValidationResult;
}

export function loadBranchOptionsFromInputs(): BranchValidationOptions {
  const allowedRaw = core.getInput('branch_allowed_patterns');
  const forbiddenRaw = core.getInput('branch_forbidden_patterns');
  const failureMessage = core.getInput('branch_failure_message') || undefined;

  const allowedPatterns = allowedRaw
    ? allowedRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const forbiddenPatterns = forbiddenRaw
    ? forbiddenRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return { allowedPatterns, forbiddenPatterns, failureMessage };
}

export function createBranchValidatorService(
  options: BranchValidationOptions
): BranchValidatorService {
  return {
    validate(branchName: string): BranchValidationResult {
      return validateBranchName(branchName, options);
    },
  };
}
