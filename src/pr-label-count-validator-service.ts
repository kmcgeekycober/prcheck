import * as core from "@actions/core";
import {
  LabelCountOptions,
  LabelCountResult,
  validateLabelCount,
} from "./pr-label-count-validator";

export function loadLabelCountOptionsFromInputs(): LabelCountOptions {
  const minRaw = core.getInput("label_min_count");
  const maxRaw = core.getInput("label_max_count");
  const requiredRaw = core.getInput("required_labels");

  const options: LabelCountOptions = {};

  if (minRaw) {
    const min = parseInt(minRaw, 10);
    if (!isNaN(min)) options.minLabels = min;
  }

  if (maxRaw) {
    const max = parseInt(maxRaw, 10);
    if (!isNaN(max)) options.maxLabels = max;
  }

  if (requiredRaw) {
    options.required = requiredRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return options;
}

export interface LabelCountService {
  validate(labels: string[]): LabelCountResult;
  options: LabelCountOptions;
}

export function createLabelCountService(
  options: LabelCountOptions
): LabelCountService {
  return {
    options,
    validate(labels: string[]): LabelCountResult {
      return validateLabelCount(labels, options);
    },
  };
}
