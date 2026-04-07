import type { Octokit } from '@octokit/rest';
import type { ReviewComment } from '../types.js';
export declare const createReview: (octokit: Octokit, owner: string, repo: string, prNumber: number, comments: ReviewComment[], summary: string) => Promise<void>;
export declare const getExistingBotComments: (octokit: Octokit, owner: string, repo: string, prNumber: number, botLogin: string) => Promise<ReviewComment[]>;
export declare const replyToComment: (octokit: Octokit, owner: string, repo: string, prNumber: number, commentId: number, body: string) => Promise<void>;
