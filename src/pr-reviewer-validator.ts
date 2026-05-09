/**
 * Validates that a PR has the required number of requested reviewers.
 */

export interface ReviewerValidationOptions {
  minReviewers: number;
  requireTeamReviewer?: boolean;
  allowedTeams?: string[];
}

export interface ReviewerValidationResult {
  valid: boolean;
  requestedReviewers: string[];
  requestedTeams: string[];
  message: string;
}

export function validateReviewers(
  requestedReviewers: string[],
  requestedTeams: string[],
  options: ReviewerValidationOptions
): ReviewerValidationResult {
  const totalReviewers = requestedReviewers.length + requestedTeams.length;

  if (totalReviewers < options.minReviewers) {
    return {
      valid: false,
      requestedReviewers,
      requestedTeams,
      message: buildReviewerValidationMessage(totalReviewers, options),
    };
  }

  if (options.requireTeamReviewer && requestedTeams.length === 0) {
    return {
      valid: false,
      requestedReviewers,
      requestedTeams,
      message: 'At least one team reviewer is required.',
    };
  }

  if (
    options.allowedTeams &&
    options.allowedTeams.length > 0 &&
    requestedTeams.length > 0
  ) {
    const invalidTeams = requestedTeams.filter(
      (t) => !options.allowedTeams!.includes(t)
    );
    if (invalidTeams.length > 0) {
      return {
        valid: false,
        requestedReviewers,
        requestedTeams,
        message: `Reviewer teams not allowed: ${invalidTeams.join(', ')}. Allowed: ${options.allowedTeams.join(', ')}.`,
      };
    }
  }

  return {
    valid: true,
    requestedReviewers,
    requestedTeams,
    message: 'Reviewer requirements satisfied.',
  };
}

export function buildReviewerValidationMessage(
  actual: number,
  options: ReviewerValidationOptions
): string {
  return `PR requires at least ${options.minReviewers} reviewer(s), but only ${actual} assigned.`;
}
