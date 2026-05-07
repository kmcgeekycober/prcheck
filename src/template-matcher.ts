import { Rule } from './config';

export interface TemplateMatch {
  rule: Rule;
  missingSection: string | null;
  hasRequiredContent: boolean;
}

export interface TemplateSectionResult {
  section: string;
  found: boolean;
  pattern: RegExp;
}

/**
 * Extracts section headers from a PR description template.
 * Sections are identified by markdown headings (## or ###).
 */
export function extractTemplateSections(template: string): string[] {
  const lines = template.split('\n');
  return lines
    .filter(line => /^#{2,3}\s+/.test(line))
    .map(line => line.replace(/^#{2,3}\s+/, '').trim());
}

/**
 * Checks whether a PR description contains all required sections
 * from the rule's template.
 */
export function checkTemplateSections(
  description: string,
  template: string
): TemplateSectionResult[] {
  const sections = extractTemplateSections(template);
  return sections.map(section => {
    const pattern = new RegExp(`#{2,3}\\s+${escapeRegex(section)}`, 'i');
    return {
      section,
      found: pattern.test(description),
      pattern,
    };
  });
}

/**
 * Returns the first missing required section from a description,
 * or null if all sections are present.
 */
export function findMissingSection(
  description: string,
  template: string
): string | null {
  const results = checkTemplateSections(description, template);
  const missing = results.find(r => !r.found);
  return missing ? missing.section : null;
}

/**
 * Determines whether the PR description satisfies the template
 * defined in the given rule.
 */
export function matchTemplate(description: string, rule: Rule): TemplateMatch {
  if (!rule.template) {
    return { rule, missingSection: null, hasRequiredContent: true };
  }
  const missingSection = findMissingSection(description, rule.template);
  return {
    rule,
    missingSection,
    hasRequiredContent: missingSection === null,
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
