import type { Octokit } from "@octokit/rest";
import type { DiffChunk, LLMProvider, ResolverSummary, ReviewThread } from "../types.js";
type GraphqlFn = <T>(query: string, variables?: Record<string, unknown>) => Promise<T>;
interface ResolverParams {
    provider: LLMProvider;
    model: string;
    systemPrompt: string;
    confidenceThreshold: number;
    temperature?: number;
    maxTokens?: number;
    threads: ReviewThread[];
    diff: DiffChunk[];
    graphql: GraphqlFn;
    octokit: Octokit;
    owner: string;
    repo: string;
    prNumber: number;
}
export declare const runResolver: (params: ResolverParams) => Promise<ResolverSummary>;
export {};
