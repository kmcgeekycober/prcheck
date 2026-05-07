import * as core from "@actions/core";
import {
  classifyPRSize,
  buildPRSizeLabel,
  computePRSize,
  isSizeLabel,
  filterSizeLabels,
} from "./pr-size";
import type { PRSizeConfig } from "./pr-size";

export interface PRSizeService {
  computeAndLabel(
    additions: number,
    deletions: number,
    changedFiles: number
  ): string | null;
  getCurrentSizeLabel(labels: string[]): string | null;
  shouldUpdateLabel(currentLabel: string | null, newLabel: string | null): boolean;
  getLabelsToRemove(labels: string[]): string[];
}

export function createPRSizeService(config?: PRSizeConfig): PRSizeService {
  return {
    computeAndLabel(
      additions: number,
      deletions: number,
      changedFiles: number
    ): string | null {
      const size = computePRSize(additions, deletions, changedFiles);
      const category = classifyPRSize(size, config);
      if (!category) {
        core.debug(`PR size ${size} did not match any category`);
        return null;
      }
      const label = buildPRSizeLabel(category);
      core.debug(`PR size ${size} classified as '${category}' -> label '${label}'`);
      return label;
    },

    getCurrentSizeLabel(labels: string[]): string | null {
      const sizeLabels = filterSizeLabels(labels);
      return sizeLabels.length > 0 ? sizeLabels[0] : null;
    },

    shouldUpdateLabel(
      currentLabel: string | null,
      newLabel: string | null
    ): boolean {
      if (newLabel === null) return false;
      return currentLabel !== newLabel;
    },

    getLabelsToRemove(labels: string[]): string[] {
      return labels.filter(isSizeLabel);
    },
  };
}
