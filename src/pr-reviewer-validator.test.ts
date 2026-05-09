import {
  validateReviewers,
  buildReviewerValidationMessage,
} from './pr-reviewer-validator';

describe('validateReviewers', () => {
  it('passes when enough individual reviewers are assigned', () => {
    const result = validateReviewers(['alice', 'bob'], [], { minReviewers: 2 });
    expect(result.valid).toBe(true);
  });

  it('passes when team reviewers count toward minimum', () => {
    const result = validateReviewers(['alice'], ['team-core'], { minReviewers: 2 });
    expect(result.valid).toBe(true);
  });

  it('fails when fewer than minReviewers assigned', () => {
    const result = validateReviewers(['alice'], [], { minReviewers: 2 });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/requires at least 2/);
  });

  it('fails when requireTeamReviewer is true but no teams assigned', () => {
    const result = validateReviewers(['alice', 'bob'], [], {
      minReviewers: 1,
      requireTeamReviewer: true,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/team reviewer/);
  });

  it('passes when requireTeamReviewer is true and a team is assigned', () => {
    const result = validateReviewers(['alice'], ['team-core'], {
      minReviewers: 1,
      requireTeamReviewer: true,
    });
    expect(result.valid).toBe(true);
  });

  it('fails when team is not in allowedTeams list', () => {
    const result = validateReviewers([], ['team-unknown'], {
      minReviewers: 1,
      allowedTeams: ['team-core', 'team-infra'],
    });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/not allowed/);
    expect(result.message).toMatch(/team-unknown/);
  });

  it('passes when team is in allowedTeams list', () => {
    const result = validateReviewers([], ['team-core'], {
      minReviewers: 1,
      allowedTeams: ['team-core', 'team-infra'],
    });
    expect(result.valid).toBe(true);
  });

  it('returns reviewer lists in result', () => {
    const result = validateReviewers(['alice'], ['team-core'], { minReviewers: 1 });
    expect(result.requestedReviewers).toEqual(['alice']);
    expect(result.requestedTeams).toEqual(['team-core']);
  });
});

describe('buildReviewerValidationMessage', () => {
  it('includes actual and required counts', () => {
    const msg = buildReviewerValidationMessage(1, { minReviewers: 3 });
    expect(msg).toContain('3');
    expect(msg).toContain('1');
  });
});
