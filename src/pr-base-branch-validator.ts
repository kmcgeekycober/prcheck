/**
 * Validates that a PR targets an allowed base branch.
 */

export interface BaseBranchOptions {
  allowedBases: string[];
  forbiddenBases: string[];
}

export interface BaseBranchResult {
  valid: boolean;
  baseBranch: string;
  message?: string;
}

export function validateBaseBranch(
  baseBranch: string,
  options: BaseBranchOptions
): BaseBranchResult {
  const { allowedBases, forbiddenBases } = options;

  if (forbiddenBases.length > 0) {
    const isForbidden = forbiddenBases.some((pattern) =>
      matchBranchPattern(baseBranch, pattern)
    );
    if (isForbidden) {
      return {
        valid: false,
        baseBranch,
        message: buildBaseBranchMessage(baseBranch, options),
      };
    }
  }

  if (allowedBases.length > 0) {
    const isAllowed = allowedBases.some((pattern) =>
      matchBranchPattern(baseBranch, pattern)
    );
    if (!isAllowed) {
      return {
        valid: false,
        baseBranch,
        message: buildBaseBranchMessage(baseBranch, options),
      };
    }
  }

  return { valid: true, baseBranch };
}

export function buildBaseBranchMessage(
  baseBranch: string,
  options: BaseBranchOptions
): string {
  const { allowedBases, forbiddenBases } = options;

  if (
    forbiddenBases.length > 0 &&
    forbiddenBases.some((p) => matchBranchPattern(baseBranch, p))
  ) {
    return `Base branch "${baseBranch}" is not allowed. Forbidden bases: ${forbiddenBases.join(', ')}.`;
  }

  return `Base branch "${baseBranch}" is not in the allowed list: ${allowedBases.join(', ')}.`;
}

function matchBranchPattern(branch: string, pattern: string): boolean {
  if (pattern.includes('*')) {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`).test(branch);
  }
  return branch === pattern;
}
