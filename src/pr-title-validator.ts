import { Rule } from './config';

export interface PRTitleValidationResult {
  valid: boolean;
  title: string;
  matchedRule: string | null;
  errors: string[];
}

export function validatePRTitle(
  title: string,
  rules: Rule[]
): PRTitleValidationResult {
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    return {
      valid: false,
      title,
      matchedRule: null,
      errors: ['PR title must not be empty'],
    };
  }

  const trimmed = title.trim();

  for (const rule of rules) {
    if (!rule.titlePattern) continue;

    const regex = new RegExp(rule.titlePattern);
    if (regex.test(trimmed)) {
      return {
        valid: true,
        title: trimmed,
        matchedRule: rule.name,
        errors: [],
      };
    }
  }

  const rulesWithPattern = rules.filter((r) => r.titlePattern);
  if (rulesWithPattern.length === 0) {
    return { valid: true, title: trimmed, matchedRule: null, errors: [] };
  }

  errors.push(
    `PR title "${trimmed}" does not match any required pattern: ` +
      rulesWithPattern.map((r) => r.titlePattern).join(', ')
  );

  return { valid: false, title: trimmed, matchedRule: null, errors };
}

export function buildTitleValidationMessage(
  result: PRTitleValidationResult
): string {
  if (result.valid) {
    const matched = result.matchedRule ? ` (matched rule: ${result.matchedRule})` : '';
    return `✅ PR title is valid${matched}.`;
  }
  return `❌ PR title validation failed:\n${result.errors.map((e) => `  - ${e}`).join('\n')}`;
}
