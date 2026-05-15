export interface LabelCountOptions {
  minLabels?: number;
  maxLabels?: number;
  required?: string[];
}

export interface LabelCountResult {
  valid: boolean;
  message?: string;
  appliedLabels: string[];
}

export function validateLabelCount(
  labels: string[],
  options: LabelCountOptions
): LabelCountResult {
  const { minLabels = 0, maxLabels = Infinity, required = [] } = options;

  if (labels.length < minLabels) {
    return {
      valid: false,
      message: buildLabelCountMessage(labels, options),
      appliedLabels: labels,
    };
  }

  if (labels.length > maxLabels) {
    return {
      valid: false,
      message: buildLabelCountMessage(labels, options),
      appliedLabels: labels,
    };
  }

  const missingRequired = required.filter((r) => !labels.includes(r));
  if (missingRequired.length > 0) {
    return {
      valid: false,
      message: `Missing required labels: ${missingRequired.join(", ")}.`,
      appliedLabels: labels,
    };
  }

  return { valid: true, appliedLabels: labels };
}

export function buildLabelCountMessage(
  labels: string[],
  options: LabelCountOptions
): string {
  const { minLabels, maxLabels } = options;
  const count = labels.length;

  if (minLabels !== undefined && count < minLabels) {
    return `PR must have at least ${minLabels} label(s), but found ${count}.`;
  }
  if (maxLabels !== undefined && count > maxLabels) {
    return `PR must have at most ${maxLabels} label(s), but found ${count}.`;
  }
  return `Label count ${count} is outside allowed range.`;
}
