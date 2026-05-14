import * as core from '@actions/core';
import {
  validateLinkedIssue,
  LinkedIssueOptions,
  LinkedIssueResult,
} from './pr-linked-issue-validator';

export function loadLinkedIssueOptionsFromInputs(): LinkedIssueOptions {
  const required = core.getInput('linked_issue_required').toLowerCase() === 'true';
  const pattern = core.getInput('linked_issue_pattern') || undefined;
  const prefixesRaw = core.getInput('linked_issue_prefixes');
  const allowedPrefixes = prefixesRaw
    ? prefixesRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

  return { required, pattern, allowedPrefixes };
}

export interface LinkedIssueService {
  validate(body: string): LinkedIssueResult;
}

export function createLinkedIssueValidatorService(
  options?: LinkedIssueOptions
): LinkedIssueService {
  const resolvedOptions = options ?? loadLinkedIssueOptionsFromInputs();

  return {
    validate(body: string): LinkedIssueResult {
      return validateLinkedIssue(body, resolvedOptions);
    },
  };
}
