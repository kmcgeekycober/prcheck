/**
 * Service wrapper for path classification, integrating with config-defined categories.
 */

import {
  PathCategory,
  ClassificationResult,
  classifyPaths,
  aggregateCategories,
} from './path-classifier';

export interface PathClassifierService {
  classify(paths: string[]): ClassificationResult[];
  getMatchedCategories(paths: string[]): string[];
}

/**
 * Creates a PathClassifierService bound to the provided categories.
 */
export function createPathClassifierService(
  categories: PathCategory[]
): PathClassifierService {
  return {
    classify(paths: string[]): ClassificationResult[] {
      return classifyPaths(paths, categories);
    },

    getMatchedCategories(paths: string[]): string[] {
      const results = classifyPaths(paths, categories);
      return aggregateCategories(results);
    },
  };
}
