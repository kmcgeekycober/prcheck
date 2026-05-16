export interface CommentCountOptions {
  minComments?: number;
  maxComments?: number;
  requireResolved?: boolean;
}

export interface CommentCountResult {
  valid: boolean;
  commentCount: number;
  unresolvedCount: number;
  message?: string;
}

export function validateCommentCount(
  commentCount: number,
  unresolvedCount: number,
  options: CommentCountOptions
): CommentCountResult {
  const { minComments, maxComments, requireResolved } = options;

  if (minComments !== undefined && commentCount < minComments) {
    return {
      valid: false,
      commentCount,
      unresolvedCount,
      message: buildCommentCountMessage(commentCount, unresolvedCount, options),
    };
  }

  if (maxComments !== undefined && commentCount > maxComments) {
    return {
      valid: false,
      commentCount,
      unresolvedCount,
      message: buildCommentCountMessage(commentCount, unresolvedCount, options),
    };
  }

  if (requireResolved && unresolvedCount > 0) {
    return {
      valid: false,
      commentCount,
      unresolvedCount,
      message: buildCommentCountMessage(commentCount, unresolvedCount, options),
    };
  }

  return { valid: true, commentCount, unresolvedCount };
}

export function buildCommentCountMessage(
  commentCount: number,
  unresolvedCount: number,
  options: CommentCountOptions
): string {
  const { minComments, maxComments, requireResolved } = options;

  if (requireResolved && unresolvedCount > 0) {
    return `PR has ${unresolvedCount} unresolved comment(s). All comments must be resolved before merging.`;
  }

  if (minComments !== undefined && commentCount < minComments) {
    return `PR has ${commentCount} comment(s) but requires at least ${minComments}.`;
  }

  if (maxComments !== undefined && commentCount > maxComments) {
    return `PR has ${commentCount} comment(s) which exceeds the maximum of ${maxComments}.`;
  }

  return `Comment count validation failed (count: ${commentCount}, unresolved: ${unresolvedCount}).`;
}
