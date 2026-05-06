import { Rule } from './config';
import { FilterOptions, filterRules, filterRulesByPaths, deduplicateRules } from './rule-filter';

export interface RuleFilterService {
  byOptions(options: FilterOptions): Rule[];
  byPaths(filePaths: string[]): Rule[];
  byOptionsAndPaths(options: FilterOptions, filePaths: string[]): Rule[];
}

/**
 * Creates a RuleFilterService bound to a fixed set of rules.
 * Deduplication is applied automatically on all results.
 */
export function createRuleFilterService(rules: Rule[]): RuleFilterService {
  return {
    byOptions(options: FilterOptions): Rule[] {
      return deduplicateRules(filterRules(rules, options));
    },

    byPaths(filePaths: string[]): Rule[] {
      return deduplicateRules(filterRulesByPaths(rules, filePaths));
    },

    byOptionsAndPaths(options: FilterOptions, filePaths: string[]): Rule[] {
      const byOpts = filterRules(rules, options);
      const byPath = filterRulesByPaths(byOpts, filePaths);
      return deduplicateRules(byPath);
    },
  };
}
