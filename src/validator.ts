import { Rule } from './config';

export interface ValidationResult {
  valid: boolean;
  missingLabels: string[];
  missingTemplateSections: string[];
  errors: string[];
}

export function validatePRDescription(
  body: string,
  requiredSections: string[]
): string[] {
  const missing: string[] = [];
  for (const section of requiredSections) {
    const pattern = new RegExp(section, 'i');
    if (!pattern.test(body)) {
      missing.push(section);
    }
  }
  return missing;
}

export function validateLabels(
  currentLabels: string[],
  requiredLabels: string[]
): string[] {
  return requiredLabels.filter((label) => !currentLabels.includes(label));
}

export function buildValidationResult(
  body: string,
  currentLabels: string[],
  matchedRules: Rule[]
): ValidationResult {
  const errors: string[] = [];
  const missingLabels: string[] = [];
  const missingTemplateSections: string[] = [];

  for (const rule of matchedRules) {
    if (rule.labels && rule.labels.length > 0) {
      const missing = validateLabels(currentLabels, rule.labels);
      missingLabels.push(...missing);
    }

    if (rule.template_sections && rule.template_sections.length > 0) {
      const missing = validatePRDescription(body, rule.template_sections);
      missingTemplateSections.push(...missing);
    }
  }

  if (missingLabels.length > 0) {
    errors.push(`Missing required labels: ${missingLabels.join(', ')}`);
  }

  if (missingTemplateSections.length > 0) {
    errors.push(
      `PR description is missing required sections: ${missingTemplateSections.join(', ')}`
    );
  }

  return {
    valid: errors.length === 0,
    missingLabels: [...new Set(missingLabels)],
    missingTemplateSections: [...new Set(missingTemplateSections)],
    errors,
  };
}
