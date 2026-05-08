/**
 * pr-checklist.ts
 * Validates that required checklist items in a PR description are checked.
 */

export interface ChecklistItem {
  text: string;
  checked: boolean;
}

export interface ChecklistResult {
  total: number;
  checked: number;
  unchecked: ChecklistItem[];
  allChecked: boolean;
}

// Matches lines like: - [x] item or - [ ] item
const CHECKLIST_REGEX = /^\s*-\s*\[(x| )\]\s+(.+)$/im;
const CHECKLIST_GLOBAL_REGEX = /^\s*-\s*\[(x| )\]\s+(.+)$/gim;

export function extractChecklistItems(body: string): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const matches = body.matchAll(CHECKLIST_GLOBAL_REGEX);
  for (const match of matches) {
    items.push({
      checked: match[1] === 'x',
      text: match[2].trim(),
    });
  }
  return items;
}

export function validateChecklist(
  body: string,
  requireAllChecked: boolean
): ChecklistResult {
  const items = extractChecklistItems(body);
  const unchecked = items.filter((i) => !i.checked);
  return {
    total: items.length,
    checked: items.length - unchecked.length,
    unchecked,
    allChecked: requireAllChecked ? unchecked.length === 0 : true,
  };
}

export function buildChecklistMessage(result: ChecklistResult): string {
  if (result.total === 0) return '';
  if (result.allChecked) return '✅ All checklist items are checked.';
  const lines = result.unchecked.map((i) => `- [ ] ${i.text}`);
  return `❌ The following checklist items must be checked:\n${lines.join('\n')}`;
}
