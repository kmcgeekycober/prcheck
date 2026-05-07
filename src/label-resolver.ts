import { Rule } from './config';

export interface LabelResolution {
  toAdd: string[];
  toRemove: string[];
  existing: string[];
}

/**
 * Resolves which labels should be added or removed based on matched rules
 * and the current set of labels on the PR.
 */
export function resolveLabels(
  matchedRules: Rule[],
  existingLabels: string[]
): LabelResolution {
  const requiredLabels = new Set<string>();

  for (const rule of matchedRules) {
    if (rule.labels) {
      for (const label of rule.labels) {
        requiredLabels.add(label);
      }
    }
  }

  const existingSet = new Set(existingLabels);

  const toAdd = [...requiredLabels].filter((l) => !existingSet.has(l));
  const toRemove = existingLabels.filter(
    (l) => !requiredLabels.has(l) && isManagedLabel(l, matchedRules)
  );

  return {
    toAdd,
    toRemove,
    existing: existingLabels.filter((l) => requiredLabels.has(l)),
  };
}

/**
 * Returns true if the label was ever declared in any rule,
 * meaning prcheck "owns" it and may remove it.
 */
export function isManagedLabel(label: string, rules: Rule[]): boolean {
  for (const rule of rules) {
    if (rule.labels && rule.labels.includes(label)) {
      return true;
    }
  }
  return false;
}

/**
 * Collects every unique label declared across all rules.
 */
export function collectAllLabels(rules: Rule[]): string[] {
  const all = new Set<string>();
  for (const rule of rules) {
    if (rule.labels) {
      for (const l of rule.labels) all.add(l);
    }
  }
  return [...all];
}
