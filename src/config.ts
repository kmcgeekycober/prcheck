import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

export interface Rule {
  paths: string[];
  labels?: string[];
  template_sections?: string[];
  message?: string;
}

export interface Config {
  rules: Rule[];
  fail_on_error?: boolean;
  annotate?: boolean;
}

const DEFAULT_CONFIG_PATH = '.prcheck.yml';

/**
 * Validates that each rule in the config has the required fields
 * and that `paths` is a non-empty array of strings.
 */
function validateRules(rules: Rule[]): void {
  rules.forEach((rule, index) => {
    if (!Array.isArray(rule.paths) || rule.paths.length === 0) {
      throw new Error(
        `Invalid config: rule at index ${index} must have a non-empty "paths" array`
      );
    }
    if (rule.paths.some((p) => typeof p !== 'string')) {
      throw new Error(
        `Invalid config: rule at index ${index} has non-string entries in "paths"`
      );
    }
  });
}

export function loadConfig(configPath?: string): Config {
  const resolvedPath = path.resolve(
    configPath ?? DEFAULT_CONFIG_PATH
  );

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf8');
  const parsed = yaml.load(raw) as Config;

  if (!parsed || !Array.isArray(parsed.rules)) {
    throw new Error('Invalid config: missing or malformed "rules" array');
  }

  validateRules(parsed.rules);

  return {
    fail_on_error: true,
    annotate: true,
    ...parsed,
  };
}
