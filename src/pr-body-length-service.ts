import { getInput } from "@actions/core";
import {
  validateBodyLength,
  buildBodyLengthMessage,
  PRBodyLengthConfig,
  PRBodyLengthResult,
} from "./pr-body-length";

export interface PRBodyLengthService {
  validate(body: string): PRBodyLengthResult;
  getMessage(result: PRBodyLengthResult): string;
}

export function createPRBodyLengthService(
  config?: PRBodyLengthConfig
): PRBodyLengthService {
  const resolvedConfig: PRBodyLengthConfig = config ?? loadConfigFromInputs();

  return {
    validate(body: string): PRBodyLengthResult {
      return validateBodyLength(body, resolvedConfig);
    },
    getMessage(result: PRBodyLengthResult): string {
      return buildBodyLengthMessage(result);
    },
  };
}

function loadConfigFromInputs(): PRBodyLengthConfig {
  const minRaw = getInput("min-description-length");
  const maxRaw = getInput("max-description-length");

  const minLength = minRaw ? parseInt(minRaw, 10) : undefined;
  const maxLength = maxRaw ? parseInt(maxRaw, 10) : undefined;

  return {
    minLength: isFinite(minLength as number) ? minLength : undefined,
    maxLength: isFinite(maxLength as number) ? maxLength : undefined,
  };
}
