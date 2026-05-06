import * as core from '@actions/core';

export interface PRMetrics {
  totalRulesEvaluated: number;
  matchedRules: number;
  unmatchedRequiredRules: number;
  labelsChecked: number;
  missingLabels: number;
  descriptionChecked: boolean;
  descriptionValid: boolean;
  durationMs: number;
}

let startTime: number = Date.now();

export function startTimer(): void {
  startTime = Date.now();
}

export function buildMetrics(
  totalRules: number,
  matchedRules: number,
  unmatchedRequired: number,
  labelsChecked: number,
  missingLabels: number,
  descriptionChecked: boolean,
  descriptionValid: boolean
): PRMetrics {
  return {
    totalRulesEvaluated: totalRules,
    matchedRules,
    unmatchedRequiredRules: unmatchedRequired,
    labelsChecked,
    missingLabels,
    descriptionChecked,
    descriptionValid,
    durationMs: Date.now() - startTime,
  };
}

export function emitMetrics(metrics: PRMetrics): void {
  core.setOutput('total_rules_evaluated', String(metrics.totalRulesEvaluated));
  core.setOutput('matched_rules', String(metrics.matchedRules));
  core.setOutput('unmatched_required_rules', String(metrics.unmatchedRequiredRules));
  core.setOutput('labels_checked', String(metrics.labelsChecked));
  core.setOutput('missing_labels', String(metrics.missingLabels));
  core.setOutput('description_valid', String(metrics.descriptionValid));
  core.setOutput('duration_ms', String(metrics.durationMs));

  core.debug(`[prcheck metrics] ${JSON.stringify(metrics)}`);
}
