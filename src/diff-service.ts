import * as github from '@actions/github';
import { getChangedFiles, extractFilenames, ChangedFile } from './diff';
import { cacheKey, getCached, setCached } from './cache';

export interface DiffService {
  getFilenames(): Promise<string[]>;
  getFiles(): Promise<ChangedFile[]>;
}

export function createDiffService(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  pullNumber: number
): DiffService {
  const key = cacheKey(owner, repo, pullNumber);

  async function getFiles(): Promise<ChangedFile[]> {
    const cached = getCached(key);
    if (cached) return cached;

    const files = await getChangedFiles(octokit, owner, repo, pullNumber);
    setCached(key, files);
    return files;
  }

  async function getFilenames(): Promise<string[]> {
    const files = await getFiles();
    return extractFilenames(files);
  }

  return { getFilenames, getFiles };
}
