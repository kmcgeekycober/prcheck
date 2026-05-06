import { MatchResult } from './matcher';
import { ValidationResult } from './validator';

export interface PRSummary {
  totalRulesMatched: number;
  totalRulesMissed: number;
  descriptionValid: boolean;
  labelsValid: boolean;
  missingLabels: string[];
  missingDescriptionSections: string[];
  overallPass: boolean;
  details: string[];
}

export function summarizeResults(
  matchResult: MatchResult,
  descriptionResult: ValidationResult,
  labelsResult: ValidationResult
): PRSummary {
  const missingLabels = labelsResult.violations.map((v) => v.expected).filter(Boolean) as string[];
  const missingDescriptionSections = descriptionResult.violations
    .map((v) => v.expected)
    .filter(Boolean) as string[];

  const details: string[] = [];

  if (matchResult.matched.length > 0) {
    details.push(`Matched rules: ${matchResult.matched.map((r) => r.name).join(', ')}`);
  }
  if (matchResult.unmatched.length > 0) {
    details.push(`Unmatched rules: ${matchResult.unmatched.map((r) => r.name).join(', ')}`);
  }
  if (missingLabels.length > 0) {
    details.push(`Missing labels: ${missingLabels.join(', ')}`);
  }
  if (missingDescriptionSections.length > 0) {
    details.push(`Missing description sections: ${missingDescriptionSections.join(', ')}`);
  }

  const overallPass = descriptionResult.valid && labelsResult.valid;

  return {
    totalRulesMatched: matchResult.matched.length,
    totalRulesMissed: matchResult.unmatched.length,
    descriptionValid: descriptionResult.valid,
    labelsValid: labelsResult.valid,
    missingLabels,
    missingDescriptionSections,
    overallPass,
    details,
  };
}

export function formatSummaryMarkdown(summary: PRSummary): string {
  const icon = summary.overallPass ? '✅' : '❌';
  const lines: string[] = [
    `## ${icon} PR Check Summary`,
    '',
    `| Check | Status |`,
    `|-------|--------|`,
    `| Description | ${summary.descriptionValid ? '✅ Valid' : '❌ Invalid'} |`,
    `| Labels | ${summary.labelsValid ? '✅ Valid' : '❌ Invalid'} |`,
    `| Rules matched | ${summary.totalRulesMatched} |`,
    `| Rules missed | ${summary.totalRulesMissed} |`,
  ];

  if (summary.details.length > 0) {
    lines.push('', '### Details', '');
    summary.details.forEach((d) => lines.push(`- ${d}`));
  }

  return lines.join('\n');
}
