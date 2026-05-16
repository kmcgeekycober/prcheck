import * as core from '@actions/core';
import { validatePRAge, AgeValidationOptions, AgeValidationResult, PRAge } from './pr-age-validator';

export function loadAgeOptionsFromInputs(): AgeValidationOptions {
  const maxAgeDays = core.getInput('max_age_days');
  const warnAgeDays = core.getInput('warn_age_days');
  const ignoreIfDraft = core.getInput('age_ignore_draft');

  return {
    maxAgeDays: maxAgeDays ? parseInt(maxAgeDays, 10) : undefined,
    warnAgeDays: warnAgeDays ? parseInt(warnAgeDays, 10) : undefined,
    ignoreIfDraft: ignoreIfDraft === 'true',
  };
}

export interface AgeValidatorService {
  validate(age: PRAge, isDraft?: boolean): AgeValidationResult;
}

export function createAgeValidatorService(
  options?: AgeValidationOptions
): AgeValidatorService {
  const resolvedOptions: AgeValidationOptions =
    options ?? loadAgeOptionsFromInputs();

  return {
    validate(age: PRAge, isDraft: boolean = false): AgeValidationResult {
      if (
        resolvedOptions.maxAgeDays === undefined &&
        resolvedOptions.warnAgeDays === undefined
      ) {
        const ageDays = Math.floor(
          ((age.now ?? new Date()).getTime() - age.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return { valid: true, ageDays, warning: false };
      }
      return validatePRAge(age, resolvedOptions, isDraft);
    },
  };
}
