import { createReviewerValidatorService, loadReviewerOptionsFromInputs } from './pr-reviewer-validator-service';

jest.mock('@actions/core', () => ({
  getInput: jest.fn((name: string) => {
    const inputs: Record<string, string> = {
      min_reviewers: '2',
      require_team_reviewer: 'false',
      allowed_reviewer_teams: 'team-core,team-infra',
    };
    return inputs[name] ?? '';
  }),
  warning: jest.fn(),
}));

import * as core from '@actions/core';

describe('loadReviewerOptionsFromInputs', () => {
  it('reads min_reviewers from inputs', () => {
    const opts = loadReviewerOptionsFromInputs();
    expect(opts.minReviewers).toBe(2);
  });

  it('reads require_team_reviewer from inputs', () => {
    const opts = loadReviewerOptionsFromInputs();
    expect(opts.requireTeamReviewer).toBe(false);
  });

  it('parses allowed_reviewer_teams from comma-separated input', () => {
    const opts = loadReviewerOptionsFromInputs();
    expect(opts.allowedTeams).toEqual(['team-core', 'team-infra']);
  });
});

describe('createReviewerValidatorService', () => {
  it('returns valid result when requirements are met', () => {
    const service = createReviewerValidatorService({ minReviewers: 1 });
    const result = service.validate(['alice'], []);
    expect(result.valid).toBe(true);
  });

  it('returns invalid result and emits warning when requirements not met', () => {
    const service = createReviewerValidatorService({ minReviewers: 3 });
    const result = service.validate(['alice'], []);
    expect(result.valid).toBe(false);
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringContaining('reviewer validation failed')
    );
  });

  it('uses provided options over inputs', () => {
    const service = createReviewerValidatorService({
      minReviewers: 2,
      requireTeamReviewer: true,
    });
    const result = service.validate(['alice', 'bob'], []);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/team reviewer/);
  });

  it('passes with team reviewer when required', () => {
    const service = createReviewerValidatorService({
      minReviewers: 1,
      requireTeamReviewer: true,
    });
    const result = service.validate([], ['team-core']);
    expect(result.valid).toBe(true);
  });
});
