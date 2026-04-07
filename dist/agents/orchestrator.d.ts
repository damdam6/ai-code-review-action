import type { LLMProvider, OrchestratorInput, OrchestratorOutput } from '../types.js';
export declare const runOrchestrator: (provider: LLMProvider, model: string, systemPrompt: string, input: OrchestratorInput, maxComments: number, temperature?: number, maxTokens?: number) => Promise<OrchestratorOutput>;
