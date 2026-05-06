import * as core from '@actions/core';
import * as github from '@actions/github';
import { MatchResult } from './matcher';

export interface LabelSyncResult {
  added: string[];
  removed: string[];
  unchanged: string[];
  errors: string[];
}

export async function syncLabels(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  prNumber: number,
  matchResult: MatchResult,
  currentLabels: string[],
  dryRun = false
): Promise<LabelSyncResult> {
  const desired = new Set(matchResult.requiredLabels);
  const current = new Set(currentLabels);

  const toAdd = [...desired].filter((l) => !current.has(l));
  const toRemove = matchResult.removeLabels
    ? [...current].filter((l) => matchResult.removeLabels!.includes(l))
    : [];
  const unchanged = [...desired].filter((l) => current.has(l));
  const errors: string[] = [];

  if (dryRun) {
    core.info(`[dry-run] Would add labels: ${toAdd.join(', ')}`);
    core.info(`[dry-run] Would remove labels: ${toRemove.join(', ')}`);
    return { added: toAdd, removed: toRemove, unchanged, errors };
  }

  if (toAdd.length > 0) {
    try {
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels: toAdd,
      });
      core.info(`Added labels: ${toAdd.join(', ')}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to add labels: ${msg}`);
    }
  }

  for (const label of toRemove) {
    try {
      await octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: prNumber,
        name: label,
      });
      core.info(`Removed label: ${label}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to remove label "${label}": ${msg}`);
    }
  }

  return { added: toAdd, removed: toRemove, unchanged, errors };
}
