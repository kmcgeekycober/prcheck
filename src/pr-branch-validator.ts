/**
 * Validates PR branch names against configurable patterns.
 */

export interface BranchValidationOptions {
  /** Regex patterns that the branch name must match (at least one). */
  allowedPatterns?: string[];
  /** Regex patterns that the branch name must NOT match. */
  forbiddenPatterns?: string[];
  /** Custom message shown when validation fails. */
  failureMessage?: string;
}

export interface BranchValidationResult {
  valid: boolean;
  branchName: string;
  message: string;
}

export function validateBranchName(
  branchName: string,
  options: BranchValidationOptions
): BranchValidationResult {
  const { allowedPatterns = [], forbiddenPatterns = [], failureMessage } = options;

  for (const pattern of forbiddenPatterns) {
    if (new RegExp(pattern).test(branchName)) {
      return {
        valid: false,
        branchName,
        message:
          failureMessage ??
          `Branch "${branchName}" matches forbidden pattern: ${pattern}`,
      };
    }
  }

  if (allowedPatterns.length > 0) {
    const isAllowed = allowedPatterns.some((p) => new RegExp(p).test(branchName));
    if (!isAllowed) {
      return {
        valid: false,
        branchName,
        message:
          failureMessage ??
          `Branch "${branchName}" does not match any allowed pattern: ${allowedPatterns.join(', ')}`,
      };
    }
  }

  return { valid: true, branchName, message: '' };
}

export function buildBranchValidationMessage(result: BranchValidationResult): string {
  if (result.valid) return '';
  return `### Branch Name Violation\n\n${result.message}`;
}
