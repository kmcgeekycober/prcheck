import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadConfig } from './config';

function writeTempYaml(content: string): string {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, `prcheck-test-${Date.now()}.yml`);
  fs.writeFileSync(tmpFile, content, 'utf8');
  return tmpFile;
}

describe('loadConfig', () => {
  it('loads a valid config file', () => {
    const file = writeTempYaml(`
rules:
  - pattern: 'src/**'
    labels:
      - frontend
    descriptionTemplate: 'templates/frontend.md'
  - pattern: 'infra/**'
    labels:
      - infrastructure
`);
    const config = loadConfig(file);
    expect(config.rules).toHaveLength(2);
    expect(config.rules[0].pattern).toBe('src/**');
    expect(config.rules[0].labels).toContain('frontend');
    fs.unlinkSync(file);
  });

  it('throws if file does not exist', () => {
    expect(() => loadConfig('/nonexistent/path.yml')).toThrow('Config file not found');
  });

  it('throws if rules is missing', () => {
    const file = writeTempYaml('defaultTemplate: tmpl.md\n');
    expect(() => loadConfig(file)).toThrow('"rules" must be an array');
    fs.unlinkSync(file);
  });

  it('throws if a rule has no pattern', () => {
    const file = writeTempYaml(`
rules:
  - labels:
      - bug
`);
    expect(() => loadConfig(file)).toThrow('non-empty "pattern" string');
    fs.unlinkSync(file);
  });

  it('loads optional defaultTemplate', () => {
    const file = writeTempYaml(`
defaultTemplate: 'templates/default.md'
rules:
  - pattern: '**'
`);
    const config = loadConfig(file);
    expect(config.defaultTemplate).toBe('templates/default.md');
    fs.unlinkSync(file);
  });
});
