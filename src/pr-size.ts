/**
 * pr-size.ts
 * Classifies pull requests by size based on the number of changed files or lines.
 */

export type PRSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface PRSizeThresholds {
  xs: number;
  s: number;
  m: number;
  l: number;
}

export interface PRSizeResult {
  size: PRSize;
  changedFiles: number;
  label: string;
}

const DEFAULT_THRESHOLDS: PRSizeThresholds = {
  xs: 5,
  s: 15,
  m: 40,
  l: 100,
};

export function classifyPRSize(
  changedFiles: number,
  thresholds: PRSizeThresholds = DEFAULT_THRESHOLDS
): PRSize {
  if (changedFiles <= thresholds.xs) return 'XS';
  if (changedFiles <= thresholds.s) return 'S';
  if (changedFiles <= thresholds.m) return 'M';
  if (changedFiles <= thresholds.l) return 'L';
  return 'XL';
}

export function buildPRSizeLabel(size: PRSize, prefix = 'size'): string {
  return `${prefix}/${size}`;
}

export function computePRSize(
  changedFiles: number,
  thresholds?: PRSizeThresholds,
  labelPrefix = 'size'
): PRSizeResult {
  const size = classifyPRSize(changedFiles, thresholds);
  return {
    size,
    changedFiles,
    label: buildPRSizeLabel(size, labelPrefix),
  };
}

export function isSizeLabel(label: string, prefix = 'size'): boolean {
  return label.startsWith(`${prefix}/`);
}

export function filterSizeLabels(labels: string[], prefix = 'size'): string[] {
  return labels.filter((l) => isSizeLabel(l, prefix));
}
