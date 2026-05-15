export interface FileCountOptions {
  maxFiles?: number;
  minFiles?: number;
  warnFiles?: number;
}

export interface FileCountResult {
  valid: boolean;
  warning: boolean;
  fileCount: number;
  message?: string;
}

export function validateFileCount(
  fileCount: number,
  options: FileCountOptions
): FileCountResult {
  const { maxFiles, minFiles, warnFiles } = options;

  if (minFiles !== undefined && fileCount < minFiles) {
    return {
      valid: false,
      warning: false,
      fileCount,
      message: buildFileCountMessage(fileCount, options),
    };
  }

  if (maxFiles !== undefined && fileCount > maxFiles) {
    return {
      valid: false,
      warning: false,
      fileCount,
      message: buildFileCountMessage(fileCount, options),
    };
  }

  if (warnFiles !== undefined && fileCount > warnFiles) {
    return {
      valid: true,
      warning: true,
      fileCount,
      message: `PR touches ${fileCount} files, which exceeds the warning threshold of ${warnFiles}.`,
    };
  }

  return { valid: true, warning: false, fileCount };
}

export function buildFileCountMessage(
  fileCount: number,
  options: FileCountOptions
): string {
  const { maxFiles, minFiles } = options;
  if (maxFiles !== undefined && fileCount > maxFiles) {
    return `PR touches ${fileCount} files, which exceeds the maximum of ${maxFiles}. Consider splitting this PR.`;
  }
  if (minFiles !== undefined && fileCount < minFiles) {
    return `PR touches only ${fileCount} file(s), but at least ${minFiles} are required.`;
  }
  return `File count ${fileCount} is out of the allowed range.`;
}
