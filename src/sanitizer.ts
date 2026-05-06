/**
 * Sanitizes and normalizes PR description and label inputs
 * before validation to ensure consistent matching.
 */

export interface SanitizeOptions {
  trimWhitespace?: boolean;
  normalizeNewlines?: boolean;
  stripHtmlComments?: boolean;
  maxLength?: number;
}

const DEFAULT_OPTIONS: Required<SanitizeOptions> = {
  trimWhitespace: true,
  normalizeNewlines: true,
  stripHtmlComments: true,
  maxLength: 65536,
};

/**
 * Strips HTML comments from a string (e.g. <!-- placeholder text -->).
 */
export function stripHtmlComments(input: string): string {
  return input.replace(/<!--[\s\S]*?-->/g, "");
}

/**
 * Normalizes line endings to Unix-style `\n`.
 */
export function normalizeNewlines(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Sanitizes a PR description string according to the provided options.
 */
export function sanitizeDescription(
  description: string,
  options: SanitizeOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let result = description;

  if (opts.stripHtmlComments) {
    result = stripHtmlComments(result);
  }

  if (opts.normalizeNewlines) {
    result = normalizeNewlines(result);
  }

  if (opts.trimWhitespace) {
    result = result.trim();
  }

  if (opts.maxLength && result.length > opts.maxLength) {
    result = result.slice(0, opts.maxLength);
  }

  return result;
}

/**
 * Sanitizes a list of label strings by trimming and lowercasing.
 */
export function sanitizeLabels(labels: string[]): string[] {
  return labels
    .map((l) => l.trim().toLowerCase())
    .filter((l) => l.length > 0);
}
