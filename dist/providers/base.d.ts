import type { LLMChatParams, LLMProvider } from "../types.js";
type ChatFn = (params: LLMChatParams) => Promise<string>;
export declare const withRetry: (chatFn: ChatFn) => ChatFn;
export type ProviderName = "kimi" | "anthropic" | "google";
export declare const createProvider: (provider: ProviderName, apiKey: string) => LLMProvider;
export {};
