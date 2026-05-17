import * as core from '@actions/core';
import { validateCommentCount, buildCommentCountMessage } from './pr-comment-count-validator';

export interface CommentCountOptions {
  minComments?: number;
  maxComments?: number;
  requireResolved?: boolean;
}

export interface CommentCountServiceResult {
  valid: boolean;
  message: string;
  commentCount: number;
}

export function loadCommentCountOptionsFromInputs(): CommentCountOptions {
  const minRaw = core.getInput('min-comments');
  const maxRaw = core.getInput('max-comments');
  const requireResolved = core.getInput('require-resolved-comments') === 'true';

  return {
    minComments: minRaw ? parseInt(minRaw, 10) : undefined,
    maxComments: maxRaw ? parseInt(maxRaw, 10) : undefined,
    requireResolved,
  };
}

export function createCommentCountService(options: CommentCountOptions) {
  return {
    validate(commentCount: number, unresolvedCount = 0): CommentCountServiceResult {
      const result = validateCommentCount(commentCount, options);

      if (result.valid && options.requireResolved && unresolvedCount > 0) {
        return {
          valid: false,
          message: `PR has ${unresolvedCount} unresolved comment(s). All comments must be resolved before merging.`,
          commentCount,
        };
      }

      return {
        valid: result.valid,
        message: result.valid ? '' : buildCommentCountMessage(commentCount, options),
        commentCount,
      };
    },
  };
}
