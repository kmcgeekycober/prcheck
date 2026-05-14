export interface LinkedIssueOptions {
  required: boolean;
  pattern?: string;
  allowedPrefixes?: string[];
}

export interface LinkedIssueResult {
  valid: boolean;
  found: string[];
  message?: string;
}

const DEFAULT_PATTERNS = [
  /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi,
  /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#\d+)/gi,
];

export function extractLinkedIssues(
  body: string,
  pattern?: string
): string[] {
  const found: string[] = [];
  const patterns = pattern ? [new RegExp(pattern, 'gi')] : DEFAULT_PATTERNS;

  for (const re of patterns) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(body)) !== null) {
      found.push(match[1] ?? match[0]);
    }
  }

  return [...new Set(found)];
}

export function validateLinkedIssue(
  body: string,
  options: LinkedIssueOptions
): LinkedIssueResult {
  if (!options.required) {
    return { valid: true, found: [] };
  }

  const found = extractLinkedIssues(body, options.pattern);

  if (found.length === 0) {
    return {
      valid: false,
      found: [],
      message: buildLinkedIssueMessage(options),
    };
  }

  return { valid: true, found };
}

export function buildLinkedIssueMessage(options: LinkedIssueOptions): string {
  const prefixes = options.allowedPrefixes ?? ['Closes', 'Fixes', 'Resolves'];
  const examples = prefixes.map((p) => `${p} #123`).join(', ');
  return `PR body must reference a linked issue (e.g. ${examples}).`;
}
