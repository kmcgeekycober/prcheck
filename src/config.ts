import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

export interface RuleConfig {
  pattern: string;
  labels?: string[];
  descriptionTemplate?: string;
}

export interface PrCheckConfig {
  rules: RuleConfig[];
  defaultTemplate?: string;
}

export function loadConfig(configPath: string): PrCheckConfig {
  const resolvedPath = path.resolve(configPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf8');
  const parsed = yaml.load(raw) as PrCheckConfig;

  if (!parsed || !Array.isArray(parsed.rules)) {
    throw new Error('Invalid config: "rules" must be an array');
  }

  for (const rule of parsed.rules) {
    if (typeof rule.pattern !== 'string' || rule.pattern.trim() === '') {
      throw new Error('Each rule must have a non-empty "pattern" string');
    }
  }

  return parsed;
}
