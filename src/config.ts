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

  return {
    fail_on_error: true,
    annotate: true,
    ...parsed,
  };
}
