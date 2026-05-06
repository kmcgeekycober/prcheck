import * as github from '@actions/github';
import * as core from '@actions/core';

export interface PRContext {
  owner: string;
  repo: string;
  prNumber: number;
  title: string;
  body: string;
  labels: string[];
  changedFiles: string[];
}

export async function getPRContext(token: string): Promise<PRContext> {
  const octokit = github.getOctokit(token);
  const context = github.context;

  if (!context.payload.pull_request) {
    throw new Error('This action must be run in the context of a pull request.');
  }

  const pr = context.payload.pull_request;
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const prNumber = pr.number;

  core.debug(`Fetching changed files for PR #${prNumber}`);

  const filesResponse = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
    per_page: 100,
  });

  const changedFiles = filesResponse.data.map((f) => f.filename);

  return {
    owner,
    repo,
    prNumber,
    title: pr.title as string,
    body: (pr.body as string) ?? '',
    labels: ((pr.labels as Array<{ name: string }>) ?? []).map((l) => l.name),
    changedFiles,
  };
}

export async function setCheckStatus(
  token: string,
  context: PRContext,
  success: boolean,
  summary: string
): Promise<void> {
  const octokit = github.getOctokit(token);
  const sha = github.context.payload.pull_request?.head?.sha as string;

  await octokit.rest.repos.createCommitStatus({
    owner: context.owner,
    repo: context.repo,
    sha,
    state: success ? 'success' : 'failure',
    description: summary.slice(0, 140),
    context: 'prcheck',
  });
}
