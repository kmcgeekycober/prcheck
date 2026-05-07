/**
 * Classifies changed file paths into categories based on glob-like patterns.
 */

export interface PathCategory {
  name: string;
  patterns: string[];
}

export interface ClassificationResult {
  path: string;
  categories: string[];
}

/**
 * Converts a simple glob pattern to a RegExp.
 * Supports * (any segment chars) and ** (any path chars).
 */
export function globToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '__DOUBLE_STAR__')
    .replace(/\*/g, '[^/]*')
    .replace(/__DOUBLE_STAR__/g, '.*');
  return new RegExp(`^${escaped}$`);
}

/**
 * Determines which categories a single file path belongs to.
 */
export function classifyPath(
  filePath: string,
  categories: PathCategory[]
): string[] {
  const matched: string[] = [];
  for (const category of categories) {
    const matches = category.patterns.some((pattern) =>
      globToRegex(pattern).test(filePath)
    );
    if (matches) {
      matched.push(category.name);
    }
  }
  return matched;
}

/**
 * Classifies all provided file paths against the given categories.
 */
export function classifyPaths(
  paths: string[],
  categories: PathCategory[]
): ClassificationResult[] {
  return paths.map((p) => ({
    path: p,
    categories: classifyPath(p, categories),
  }));
}

/**
 * Returns the unique set of category names matched across all paths.
 */
export function aggregateCategories(
  results: ClassificationResult[]
): string[] {
  const set = new Set<string>();
  for (const result of results) {
    for (const cat of result.categories) {
      set.add(cat);
    }
  }
  return Array.from(set).sort();
}
