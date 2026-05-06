import * as core from '@actions/core';
import { reportResults, reportSummary } from './reporter';
import { ValidationResult } from './validator';

jest.mock('@actions/core');

const mockedCore = core as jest.Mocked<typeof core>;

const validResult: ValidationResult = {
  valid: true,
  missingLabels: [],
  missingTemplateSections: [],
  errors: [],
};

const invalidResult: ValidationResult = {
  valid: false,
  missingLabels: ['frontend'],
  missingTemplateSections: ['Testing'],
  errors: [
    'Missing required labels: frontend',
    'PR description is missing required sections: Testing',
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('reportResults', () => {
  it('logs info on valid result', () => {
    reportResults(validResult);
    expect(mockedCore.info).toHaveBeenCalledWith(expect.stringContaining('passed'));
    expect(mockedCore.setFailed).not.toHaveBeenCalled();
  });

  it('calls setFailed on invalid result when failOnError is true', () => {
    reportResults(invalidResult, { failOnError: true, annotate: true });
    expect(mockedCore.setFailed).toHaveBeenCalled();
  });

  it('does not call setFailed when failOnError is false', () => {
    reportResults(invalidResult, { failOnError: false, annotate: false });
    expect(mockedCore.setFailed).not.toHaveBeenCalled();
  });

  it('calls core.error when annotate is true', () => {
    reportResults(invalidResult, { failOnError: false, annotate: true });
    expect(mockedCore.error).toHaveBeenCalledTimes(invalidResult.errors.length);
  });

  it('calls core.warning when annotate is false', () => {
    reportResults(invalidResult, { failOnError: false, annotate: false });
    expect(mockedCore.warning).toHaveBeenCalledTimes(invalidResult.errors.length);
  });
});

describe('reportSummary', () => {
  it('returns success message for valid result', () => {
    expect(reportSummary(validResult)).toContain('passed');
  });

  it('returns failure message with errors for invalid result', () => {
    const summary = reportSummary(invalidResult);
    expect(summary).toContain('failed');
    expect(summary).toContain('Missing required labels');
  });
});
