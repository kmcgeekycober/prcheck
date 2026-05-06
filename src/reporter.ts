import * as core from '@actions/core';
import { ValidationResult } from './validator';

export interface ReportOptions {
  failOnError: boolean;
  annotate: boolean;
}

export function reportResults(
  result: ValidationResult,
  options: ReportOptions = { failOnError: true, annotate: true }
): void {
  if (result.valid) {
    core.info('✅ PR validation passed.');
    return;
  }

  for (const error of result.errors) {
    if (options.annotate) {
      core.error(error);
    } else {
      core.warning(error);
    }
  }

  if (result.missingLabels.length > 0) {
    core.info(
      `ℹ️  Add the following labels: ${result.missingLabels.join(', ')}`
    );
  }

  if (result.missingTemplateSections.length > 0) {
    core.info(
      `ℹ️  Add the following sections to your PR description: ${result.missingTemplateSections.join(', ')}`
    );
  }

  if (options.failOnError) {
    core.setFailed(
      `PR validation failed with ${result.errors.length} error(s).`
    );
  }
}

export function reportSummary(result: ValidationResult): string {
  if (result.valid) {
    return '✅ All checks passed.';
  }
  const lines = ['❌ PR validation failed:', ...result.errors.map((e) => `  - ${e}`)];
  return lines.join('\n');
}
