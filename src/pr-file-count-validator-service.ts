import * as core from '@actions/core';
import {
  FileCountOptions,
  FileCountResult,
  validateFileCount,
} from './pr-file-count-validator';

export function loadFileCountOptionsFromInputs(): FileCountOptions {
  const maxRaw = core.getInput('file-count-max');
  const minRaw = core.getInput('file-count-min');
  const warnRaw = core.getInput('file-count-warn');

  return {
    maxFiles: maxRaw ? parseInt(maxRaw, 10) : undefined,
    minFiles: minRaw ? parseInt(minRaw, 10) : undefined,
    warnFiles: warnRaw ? parseInt(warnRaw, 10) : undefined,
  };
}

export interface FileCountService {
  validate(fileCount: number): FileCountResult;
  report(result: FileCountResult): void;
}

export function createFileCountService(
  options: FileCountOptions
): FileCountService {
  return {
    validate(fileCount: number): FileCountResult {
      return validateFileCount(fileCount, options);
    },

    report(result: FileCountResult): void {
      if (!result.valid) {
        core.setFailed(result.message ?? 'File count validation failed.');
      } else if (result.warning && result.message) {
        core.warning(result.message);
      } else {
        core.info(`File count check passed (${result.fileCount} files).`);
      }
    },
  };
}
