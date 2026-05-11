/**
 * Validates that a PR has a milestone assigned when required.
 */

export interface MilestoneValidationOptions {
  required: boolean;
  allowedMilestones?: string[];
}

export interface MilestoneValidationResult {
  valid: boolean;
  message: string | null;
  milestone: string | null;
}

export function validateMilestone(
  milestone: string | null | undefined,
  options: MilestoneValidationOptions
): MilestoneValidationResult {
  const resolved = milestone?.trim() || null;

  if (options.required && !resolved) {
    return {
      valid: false,
      message: "A milestone must be assigned to this PR.",
      milestone: null,
    };
  }

  if (
    resolved &&
    options.allowedMilestones &&
    options.allowedMilestones.length > 0
  ) {
    const allowed = options.allowedMilestones.map((m) => m.trim().toLowerCase());
    if (!allowed.includes(resolved.toLowerCase())) {
      return {
        valid: false,
        message: `Milestone "${resolved}" is not in the allowed list: ${options.allowedMilestones.join(", ")}.`,
        milestone: resolved,
      };
    }
  }

  return {
    valid: true,
    message: null,
    milestone: resolved,
  };
}

export function buildMilestoneValidationMessage(
  result: MilestoneValidationResult
): string {
  if (result.valid) {
    return result.milestone
      ? `✅ Milestone is set: "${result.milestone}".`
      : "✅ No milestone required.";
  }
  return `❌ Milestone validation failed: ${result.message}`;
}
