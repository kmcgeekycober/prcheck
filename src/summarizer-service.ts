import * as core from '@actions/core';
import { MatchResult } from './matcher';
import { ValidationResult } from './validator';
import { summarizeResults, formatSummaryMarkdown, PRSummary } from './summarizer';

export interface SummarizerService {
  buildAndReport(matchResult: MatchResult, descResult: ValidationResult, labelsResult: ValidationResult): PRSummary;
}

export function createSummarizerService(debug = false): SummarizerService {
  return {
    buildAndReport(
      matchResult: MatchResult,
      descResult: ValidationResult,
      labelsResult: ValidationResult
    ): PRSummary {
      const summary = summarizeResults(matchResult, descResult, labelsResult);
      const markdown = formatSummaryMarkdown(summary);

      if (debug) {
        core.debug('[summarizer] Summary computed');
        core.debug(`[summarizer] overallPass=${summary.overallPass}`);
        core.debug(`[summarizer] rulesMatched=${summary.totalRulesMatched}`);
      }

      core.summary.addRaw(markdown).write().catch((err) => {
        core.warning(`Failed to write job summary: ${(err as Error).message}`);
      });

      core.setOutput('summary_pass', String(summary.overallPass));
      core.setOutput('rules_matched', String(summary.totalRulesMatched));
      core.setOutput('rules_missed', String(summary.totalRulesMissed));
      core.setOutput('missing_labels', summary.missingLabels.join(','));
      core.setOutput('missing_sections', summary.missingDescriptionSections.join(','));

      return summary;
    },
  };
}
