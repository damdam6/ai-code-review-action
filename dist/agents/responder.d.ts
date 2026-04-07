import type { DiffChunk, LLMProvider } from '../types.js';
interface ResponderInput {
    commentBody: string;
    commentId: number;
    path: string | null;
    line: number | null;
    threadComments: string[];
}
export declare const extractQuestion: (body: string, trigger: string) => string | null;
export declare const buildContext: (input: ResponderInput, diff: DiffChunk[]) => string;
interface ResponderParams {
    provider: LLMProvider;
    model: string;
    systemPrompt: string;
    temperature?: number;
    maxTokens?: number;
    input: ResponderInput;
    diff: DiffChunk[];
    trigger: string;
}
export declare const runResponder: (params: ResponderParams) => Promise<string>;
export {};
