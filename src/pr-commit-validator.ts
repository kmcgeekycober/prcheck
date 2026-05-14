export interface CommitValidationOptions {
  requireConventional: boolean;
  allowedTypes?: string[];
  minCount?: number;
  maxCount?: number;
}

export interface CommitValidationResult {
  valid: boolean;
  commitCount: number;
  violations: string[];
}

const DEFAULT_CONVENTIONAL_TYPES = [
  "feat", "fix", "docs", "style", "refactor",
  "perf", "test", "chore", "ci", "build", "revert"
];

const CONVENTIONAL_COMMIT_RE = /^(\w+)(\([^)]+\))?!?: .+/;

export function validateCommitMessage(
  message: string,
  allowedTypes: string[]
): boolean {
  const match = CONVENTIONAL_COMMIT_RE.exec(message.trim());
  if (!match) return false;
  return allowedTypes.includes(match[1]);
}

export function validateCommits(
  messages: string[],
  options: CommitValidationOptions
): CommitValidationResult {
  const violations: string[] = [];
  const commitCount = messages.length;
  const allowedTypes = options.allowedTypes ?? DEFAULT_CONVENTIONAL_TYPES;

  if (options.minCount !== undefined && commitCount < options.minCount) {
    violations.push(`Expected at least ${options.minCount} commit(s), found ${commitCount}.`);
  }

  if (options.maxCount !== undefined && commitCount > options.maxCount) {
    violations.push(`Expected at most ${options.maxCount} commit(s), found ${commitCount}.`);
  }

  if (options.requireConventional) {
    for (const msg of messages) {
      if (!validateCommitMessage(msg, allowedTypes)) {
        violations.push(`Commit does not follow Conventional Commits: "${msg.slice(0, 72)}"`);
      }
    }
  }

  return { valid: violations.length === 0, commitCount, violations };
}

export function buildCommitValidationMessage(result: CommitValidationResult): string {
  if (result.valid) return "All commits passed validation.";
  return `Commit validation failed:\n${result.violations.map(v => `- ${v}`).join("\n")}`;
}
