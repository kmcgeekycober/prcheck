export interface PRAge {
  createdAt: Date;
  updatedAt: Date;
  now?: Date;
}

export interface AgeValidationOptions {
  maxAgeDays?: number;
  warnAgeDays?: number;
  ignoreIfDraft?: boolean;
}

export interface AgeValidationResult {
  valid: boolean;
  ageDays: number;
  warning: boolean;
  message?: string;
}

export function computeAgeDays(createdAt: Date, now: Date): number {
  const ms = now.getTime() - createdAt.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function validatePRAge(
  age: PRAge,
  options: AgeValidationOptions,
  isDraft: boolean = false
): AgeValidationResult {
  const now = age.now ?? new Date();
  const ageDays = computeAgeDays(age.createdAt, now);

  if (isDraft && options.ignoreIfDraft) {
    return { valid: true, ageDays, warning: false };
  }

  const maxAge = options.maxAgeDays;
  const warnAge = options.warnAgeDays;

  if (maxAge !== undefined && ageDays > maxAge) {
    return {
      valid: false,
      ageDays,
      warning: false,
      message: buildAgeValidationMessage(ageDays, maxAge, false),
    };
  }

  if (warnAge !== undefined && ageDays > warnAge) {
    return {
      valid: true,
      ageDays,
      warning: true,
      message: buildAgeValidationMessage(ageDays, warnAge, true),
    };
  }

  return { valid: true, ageDays, warning: false };
}

export function buildAgeValidationMessage(
  ageDays: number,
  threshold: number,
  isWarning: boolean
): string {
  const level = isWarning ? 'Warning' : 'Error';
  return `${level}: PR is ${ageDays} day(s) old (threshold: ${threshold} day(s)). Consider updating or closing this PR.`;
}
