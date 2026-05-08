/**
 * Validates PR description length against configured min/max thresholds.
 */

export interface PRBodyLengthConfig {
  minLength?: number;
  maxLength?: number;
}

export interface PRBodyLengthResult {
  valid: boolean;
  length: number;
  minLength?: number;
  maxLength?: number;
  message?: string;
}

export function measureBodyLength(body: string): number {
  return body.trim().length;
}

export function validateBodyLength(
  body: string,
  config: PRBodyLengthConfig
): PRBodyLengthResult {
  const length = measureBodyLength(body);
  const { minLength, maxLength } = config;

  if (minLength !== undefined && length < minLength) {
    return {
      valid: false,
      length,
      minLength,
      maxLength,
      message: `PR description is too short (${length} chars). Minimum required: ${minLength} chars.`,
    };
  }

  if (maxLength !== undefined && length > maxLength) {
    return {
      valid: false,
      length,
      minLength,
      maxLength,
      message: `PR description is too long (${length} chars). Maximum allowed: ${maxLength} chars.`,
    };
  }

  return { valid: true, length, minLength, maxLength };
}

export function buildBodyLengthMessage(result: PRBodyLengthResult): string {
  if (result.valid) {
    return `PR description length (${result.length} chars) is within acceptable range.`;
  }
  return result.message ?? `PR description length validation failed.`;
}
