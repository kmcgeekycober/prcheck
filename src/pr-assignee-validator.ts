export interface AssigneeOptions {
  requireAssignee: boolean;
  minAssignees: number;
  maxAssignees: number;
  allowedAssignees: string[];
}

export interface AssigneeValidationResult {
  valid: boolean;
  message: string;
  assignees: string[];
}

export const DEFAULT_ASSIGNEE_OPTIONS: AssigneeOptions = {
  requireAssignee: false,
  minAssignees: 0,
  maxAssignees: 10,
  allowedAssignees: [],
};

export function validateAssignees(
  assignees: string[],
  options: Partial<AssigneeOptions> = {}
): AssigneeValidationResult {
  const opts = { ...DEFAULT_ASSIGNEE_OPTIONS, ...options };

  if (opts.requireAssignee && assignees.length === 0) {
    return { valid: false, message: "PR must have at least one assignee.", assignees };
  }

  if (assignees.length < opts.minAssignees) {
    return {
      valid: false,
      message: `PR must have at least ${opts.minAssignees} assignee(s), found ${assignees.length}.`,
      assignees,
    };
  }

  if (assignees.length > opts.maxAssignees) {
    return {
      valid: false,
      message: `PR must have at most ${opts.maxAssignees} assignee(s), found ${assignees.length}.`,
      assignees,
    };
  }

  if (opts.allowedAssignees.length > 0) {
    const disallowed = assignees.filter((a) => !opts.allowedAssignees.includes(a));
    if (disallowed.length > 0) {
      return {
        valid: false,
        message: `Assignee(s) not allowed: ${disallowed.join(", ")}.`,
        assignees,
      };
    }
  }

  return { valid: true, message: "Assignees are valid.", assignees };
}

export function buildAssigneeValidationMessage(result: AssigneeValidationResult): string {
  if (result.valid) {
    return `✅ ${result.message}`;
  }
  return `❌ ${result.message}`;
}
