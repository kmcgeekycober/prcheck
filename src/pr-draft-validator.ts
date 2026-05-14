export interface DraftValidationOptions {
  blockIfDraft?: boolean;
  warnIfDraft?: boolean;
  draftLabel?: string;
}

export interface DraftValidationResult {
  isDraft: boolean;
  blocked: boolean;
  warned: boolean;
  label: string | null;
  message: string | null;
}

export function validateDraftStatus(
  isDraft: boolean,
  options: DraftValidationOptions
): DraftValidationResult {
  const blockIfDraft = options.blockIfDraft ?? false;
  const warnIfDraft = options.warnIfDraft ?? false;
  const draftLabel = options.draftLabel ?? null;

  if (!isDraft) {
    return {
      isDraft: false,
      blocked: false,
      warned: false,
      label: null,
      message: null,
    };
  }

  const blocked = blockIfDraft;
  const warned = !blocked && warnIfDraft;
  const label = isDraft && draftLabel ? draftLabel : null;

  return {
    isDraft: true,
    blocked,
    warned,
    label,
    message: buildDraftValidationMessage(blocked, warned),
  };
}

export function buildDraftValidationMessage(
  blocked: boolean,
  warned: boolean
): string | null {
  if (blocked) {
    return "This pull request is still a draft. Please mark it as ready for review before merging.";
  }
  if (warned) {
    return "Warning: This pull request is currently a draft.";
  }
  return null;
}
