import type { ReviewThread } from '../types.js';
type GraphqlFn = <T>(query: string, variables?: Record<string, unknown>) => Promise<T>;
export declare const getUnresolvedThreads: (graphql: GraphqlFn, owner: string, repo: string, prNumber: number) => Promise<ReviewThread[]>;
export declare const resolveThread: (graphql: GraphqlFn, threadId: string) => Promise<void>;
export declare const filterBotThreads: (threads: ReviewThread[], botLogin: string) => ReviewThread[];
export {};
