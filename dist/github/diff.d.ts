import type { Octokit } from '@octokit/rest';
import type { DiffChunk } from '../types.js';
export declare const getDiff: (octokit: Octokit, owner: string, repo: string, prNumber: number, excludePatterns: string[]) => Promise<DiffChunk[]>;
