import { minimatch } from 'minimatch';

export interface RuleConfig {
  patterns: string[];
  labels?: string[];
  template?: string;
}

export interface MatchResult {
  matchedRules: RuleConfig[];
  requiredLabels: string[];
  requiredTemplates: string[];
}

/**
 * Matches changed file paths against configured rules and returns
 * the aggregated labels and templates that should be enforced.
 */
export function matchRules(
  changedFiles: string[],
  rules: RuleConfig[]
): MatchResult {
  const matchedRules: RuleConfig[] = [];
  const requiredLabels = new Set<string>();
  const requiredTemplates = new Set<string>();

  for (const rule of rules) {
    const matched = changedFiles.some((file) =>
      rule.patterns.some((pattern) => minimatch(file, pattern, { dot: true }))
    );

    if (matched) {
      matchedRules.push(rule);

      if (rule.labels) {
        rule.labels.forEach((label) => requiredLabels.add(label));
      }

      if (rule.template) {
        requiredTemplates.add(rule.template);
      }
    }
  }

  return {
    matchedRules,
    requiredLabels: Array.from(requiredLabels),
    requiredTemplates: Array.from(requiredTemplates),
  };
}

/**
 * Checks whether a PR's current labels satisfy all required labels.
 */
export function checkLabels(
  currentLabels: string[],
  requiredLabels: string[]
): { missing: string[]; satisfied: boolean } {
  const missing = requiredLabels.filter(
    (label) => !currentLabels.includes(label)
  );
  return { missing, satisfied: missing.length === 0 };
}
