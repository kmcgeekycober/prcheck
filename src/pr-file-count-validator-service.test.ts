import * as core from '@actions/core';
import {
  loadFileCountOptionsFromInputs,
  createFileCountService,
} from './pr-file-count-validator-service';

jest.mock('@actions/core');

const mockCore = core as jest.Mocked<typeof core>;

function setupInputs(inputs: Record<string, string>) {
  mockCore.getInput.mockImplementation((name: string) => inputs[name] ?? '');
}

describe('loadFileCountOptionsFromInputs', () => {
  it('parses all numeric inputs', () => {
    setupInputs({ 'file-count-max': '30', 'file-count-min': '1', 'file-count-warn': '20' });
    const opts = loadFileCountOptionsFromInputs();
    expect(opts.maxFiles).toBe(30);
    expect(opts.minFiles).toBe(1);
    expect(opts.warnFiles).toBe(20);
  });

  it('returns undefined for missing inputs', () => {
    setupInputs({});
    const opts = loadFileCountOptionsFromInputs();
    expect(opts.maxFiles).toBeUndefined();
    expect(opts.minFiles).toBeUndefined();
    expect(opts.warnFiles).toBeUndefined();
  });
});

describe('createFileCountService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls setFailed when invalid', () => {
    const service = createFileCountService({ maxFiles: 10 });
    const result = service.validate(15);
    service.report(result);
    expect(mockCore.setFailed).toHaveBeenCalledWith(expect.stringContaining('15'));
  });

  it('calls core.warning when warning threshold exceeded', () => {
    const service = createFileCountService({ warnFiles: 5 });
    const result = service.validate(8);
    service.report(result);
    expect(mockCore.warning).toHaveBeenCalled();
    expect(mockCore.setFailed).not.toHaveBeenCalled();
  });

  it('calls core.info on success', () => {
    const service = createFileCountService({ maxFiles: 20 });
    const result = service.validate(5);
    service.report(result);
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining('5'));
  });
});
