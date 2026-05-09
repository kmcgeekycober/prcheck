import * as core from '@actions/core';
import { validateReviewers, ReviewerValidationOptions, ReviewerValidationResult } from './pr-reviewer-validator';

export interface ReviewerValidatorService {
  validate(reviewers: string[], teams: string[]): ReviewerValidationResult;
}

export function loadReviewerOptionsFromInputs(): ReviewerValidationOptions {
  const minReviewers = parseInt(core.getInput('min_reviewers') || '1', 10);
  const requireTeamReviewer = core.getInput('require_team_reviewer') === 'true';
  const allowedTeamsRaw = core.getInput('allowed_reviewer_teams');
  const allowedTeams = allowedTeamsRaw
    ? allowedTeamsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : undefined;

  return {
    minReviewers: isNaN(minReviewers) ? 1 : minReviewers,
    requireTeamReviewer,
    ...(allowedTeams && allowedTeams.length > 0 ? { allowedTeams } : {}),
  };
}

export function createReviewerValidatorService(
  options?: ReviewerValidationOptions
): ReviewerValidatorService {
  const resolvedOptions = options ?? loadReviewerOptionsFromInputs();

  return {
    validate(reviewers: string[], teams: string[]): ReviewerValidationResult {
      const result = validateReviewers(reviewers, teams, resolvedOptions);
      if (!result.valid) {
        core.warning(`[prcheck] reviewer validation failed: ${result.message}`);
      }
      return result;
    },
  };
}
