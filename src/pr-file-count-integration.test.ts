import { validateFileCount } from './pr-file-count-validator';
import { createFileCountService } from './pr-file-count-validator-service';
import * as core from '@actions/core';

jest.mock('@actions/core');

const mockCore = core as jest.Mocked<typeof core>;

describe('file count integration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('full flow: oversized PR triggers setFailed', () => {
    const service = createFileCountService({ maxFiles: 15, warnFiles: 10 });
    const filenames = Array.from({ length: 20 }, (_, i) => `src/file${i}.ts`);
    const result = service.validate(filenames.length);
    service.report(result);
    expect(result.valid).toBe(false);
    expect(mockCore.setFailed).toHaveBeenCalled();
  });

  it('full flow: moderately large PR triggers warning only', () => {
    const service = createFileCountService({ maxFiles: 20, warnFiles: 10 });
    const filenames = Array.from({ length: 12 }, (_, i) => `src/file${i}.ts`);
    const result = service.validate(filenames.length);
    service.report(result);
    expect(result.valid).toBe(true);
    expect(result.warning).toBe(true);
    expect(mockCore.warning).toHaveBeenCalled();
    expect(mockCore.setFailed).not.toHaveBeenCalled();
  });

  it('full flow: small PR passes cleanly', () => {
    const service = createFileCountService({ maxFiles: 20, warnFiles: 10 });
    const result = validateFileCount(3, { maxFiles: 20, warnFiles: 10 });
    service.report(result);
    expect(result.valid).toBe(true);
    expect(result.warning).toBe(false);
    expect(mockCore.info).toHaveBeenCalled();
  });
});
