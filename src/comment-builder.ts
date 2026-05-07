/**
 * Builds formatted GitHub PR comment bodies from validation results.
 */

import { ValidationResult } from './validator';

export interface CommentSection {
  title: string;
  body: string;
  emoji: string;
}

export function buildCommentHeader(passed: boolean): string {
  return passed
    ? '## ✅ PR Check Passed'
    : '## ❌ PR Check Failed';
}

export function buildDescriptionSection(result: ValidationResult): CommentSection | null {
  if (result.descriptionErrors.length === 0) return null;
  const lines = result.descriptionErrors.map(e => `- ${e}`);
  return {
    title: 'Description Issues',
    emoji: '📝',
    body: lines.join('\n'),
  };
}

export function buildLabelSection(result: ValidationResult): CommentSection | null {
  if (result.labelErrors.length === 0) return null;
  const lines = result.labelErrors.map(e => `- ${e}`);
  return {
    title: 'Label Issues',
    emoji: '🏷️',
    body: lines.join('\n'),
  };
}

export function renderSection(section: CommentSection): string {
  return `### ${section.emoji} ${section.title}\n${section.body}`;
}

export function buildComment(result: ValidationResult): string {
  const passed = result.descriptionErrors.length === 0 && result.labelErrors.length === 0;
  const parts: string[] = [buildCommentHeader(passed)];

  const descSection = buildDescriptionSection(result);
  if (descSection) parts.push(renderSection(descSection));

  const labelSection = buildLabelSection(result);
  if (labelSection) parts.push(renderSection(labelSection));

  if (passed) {
    parts.push('All checks passed. Great job! 🎉');
  } else {
    parts.push('---\n_Please address the issues above and update your PR._');
  }

  return parts.join('\n\n');
}
