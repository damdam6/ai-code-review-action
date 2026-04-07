import type { DiffChunk, Issue, LLMProvider } from '../../types.js';
export declare const runSecurityReview: (provider: LLMProvider, model: string, systemPrompt: string, diff: DiffChunk[], temperature?: number, maxTokens?: number) => Promise<Issue[]>;
