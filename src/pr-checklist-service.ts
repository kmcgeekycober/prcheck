/**
 * pr-checklist-service.ts
 * Wraps checklist validation with config-driven options.
 */

import * as core from '@actions/core';
import {
  validateChecklist,
  buildChecklistMessage,
  ChecklistResult,
} from './pr-checklist';

export interface ChecklistServiceOptions {
  requireAllChecked: boolean;
  enabled: boolean;
}

export interface ChecklistService {
  validate(body: string): ChecklistResult | null;
  report(result: ChecklistResult): void;
}

export function createChecklistService(
  options: ChecklistServiceOptions
): ChecklistService {
  return {
    validate(body: string): ChecklistResult | null {
      if (!options.enabled) return null;
      return validateChecklist(body, options.requireAllChecked);
    },

    report(result: ChecklistResult): void {
      const message = buildChecklistMessage(result);
      if (!message) return;
      if (!result.allChecked) {
        core.warning(message);
      } else {
        core.info(message);
      }
    },
  };
}

export function loadChecklistOptionsFromInputs(): ChecklistServiceOptions {
  const enabled = core.getInput('checklist_enabled') !== 'false';
  const requireAllChecked =
    core.getInput('checklist_require_all_checked') !== 'false';
  return { enabled, requireAllChecked };
}
