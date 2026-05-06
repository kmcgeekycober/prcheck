import * as core from '@actions/core';
import { loadConfig } from './config';
import { matchRules, checkLabels } from './matcher';
import { validatePRDescription, validateLabels, buildValidationResult } from './validator';
import { reportResults, reportSummary } from './reporter';
import { getPRContext, setCheckStatus } from './github';

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true });
    const configPath = core.getInput('config') || '.prcheck.yml';

    core.info(`Loading config from ${configPath}`);
    const config = await loadConfig(configPath);

    core.info('Fetching PR context...');
    const prContext = await getPRContext(token);

    core.info(`PR #${prContext.prNumber}: "${prContext.title}"`);
    core.info(`Changed files: ${prContext.changedFiles.length}`);

    const matchedRules = matchRules(config.rules, prContext.changedFiles);
    core.debug(`Matched rules: ${matchedRules.map((r) => r.name).join(', ')}`);

    const descriptionResult = validatePRDescription(prContext.body, matchedRules);
    const labelsResult = validateLabels(prContext.labels, checkLabels(matchedRules));

    const validationResult = buildValidationResult(descriptionResult, labelsResult);
    reportResults(validationResult);

    const summary = reportSummary(validationResult);
    const success = validationResult.passed;

    await setCheckStatus(token, prContext, success, summary);

    if (!success) {
      core.setFailed(summary);
    } else {
      core.info(summary);
    }
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();
