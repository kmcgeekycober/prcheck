import { sortByPriority, topPriorityRule } from './rule-priority';

export interface RulePriorityService<T extends { pattern: string }> {
  sort(rules: T[]): T[];
  top(
    rules: T[],
    matchFn: (rule: T, paths: string[]) => boolean,
    paths: string[]
  ): T | undefined;
}

/**
 * Factory that creates a RulePriorityService.
 * Useful for dependency injection in tests and the main action runner.
 */
export function createRulePriorityService<
  T extends { pattern: string }
>(): RulePriorityService<T> {
  return {
    sort(rules: T[]): T[] {
      return sortByPriority(rules);
    },
    top(
      rules: T[],
      matchFn: (rule: T, paths: string[]) => boolean,
      paths: string[]
    ): T | undefined {
      return topPriorityRule(rules, matchFn, paths);
    },
  };
}
