import type { DiffChunk, Issue, LLMProvider } from '../../types.js';
export declare const parseJsonResponse: <T>(raw: string) => T | null;
export declare const sanitizeMarkdown: (text: string) => string;
export declare const formatDiffForLLM: (chunks: DiffChunk[]) => string;
export declare const runReviewAgent: (agentName: string, provider: LLMProvider, params: {
    model: string;
    systemPrompt: string;
    temperature?: number;
    maxTokens?: number;
}, diff: DiffChunk[]) => Promise<Issue[]>;
