export interface PriorityRule {
  pattern: string;
  priority: number;
}

/**
 * Assigns a numeric priority to a rule based on pattern specificity.
 * More specific patterns (longer, no wildcards) get higher priority.
 */
export function computePriority(pattern: string): number {
  let score = 0;
  // Longer patterns are more specific
  score += pattern.length;
  // Penalize wildcards
  const wildcards = (pattern.match(/\*/g) || []).length;
  score -= wildcards * 10;
  // Reward explicit path separators (deeper paths)
  const separators = (pattern.match(/\//g) || []).length;
  score += separators * 5;
  // Reward file extension specificity
  if (/\.[a-z]+$/.test(pattern)) {
    score += 15;
  }
  return score;
}

/**
 * Sorts rules by descending priority so the most specific rule wins.
 */
export function sortByPriority<T extends { pattern: string }>(rules: T[]): T[] {
  return [...rules].sort(
    (a, b) => computePriority(b.pattern) - computePriority(a.pattern)
  );
}

/**
 * Returns the highest-priority rule matching any of the given paths,
 * or undefined if none match.
 */
export function topPriorityRule<T extends { pattern: string }>(
  rules: T[],
  matchFn: (rule: T, paths: string[]) => boolean,
  paths: string[]
): T | undefined {
  const sorted = sortByPriority(rules);
  return sorted.find((rule) => matchFn(rule, paths));
}
