import { Rule } from './config';

export interface FilterOptions {
  pathPrefix?: string;
  labelRequired?: boolean;
  templateRequired?: boolean;
}

/**
 * Filters rules based on provided options.
 */
export function filterRules(rules: Rule[], options: FilterOptions): Rule[] {
  return rules.filter((rule) => {
    if (options.pathPrefix !== undefined) {
      const matches = rule.paths.some((p) => p.startsWith(options.pathPrefix!));
      if (!matches) return false;
    }

    if (options.labelRequired === true) {
      if (!rule.labels || rule.labels.length === 0) return false;
    }

    if (options.labelRequired === false) {
      if (rule.labels && rule.labels.length > 0) return false;
    }

    if (options.templateRequired === true) {
      if (!rule.template) return false;
    }

    if (options.templateRequired === false) {
      if (rule.template) return false;
    }

    return true;
  });
}

/**
 * Returns rules that match at least one of the given file paths.
 */
export function filterRulesByPaths(rules: Rule[], filePaths: string[]): Rule[] {
  return rules.filter((rule) =>
    rule.paths.some((pattern) =>
      filePaths.some((fp) => fp.startsWith(pattern) || fp === pattern)
    )
  );
}

/**
 * Deduplicates rules by their name field.
 */
export function deduplicateRules(rules: Rule[]): Rule[] {
  const seen = new Set<string>();
  return rules.filter((rule) => {
    const key = rule.name ?? JSON.stringify(rule.paths);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
