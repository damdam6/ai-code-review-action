export interface LLMChatParams {
    model: string;
    systemPrompt: string;
    userMessage: string;
    temperature?: number;
    maxTokens?: number;
}
export interface LLMProvider {
    chat(params: LLMChatParams): Promise<string>;
}
export interface DiffChunk {
    filename: string;
    status: 'added' | 'modified' | 'removed' | 'renamed';
    patch: string;
    additions: number;
    deletions: number;
}
export type Severity = 'critical' | 'major' | 'minor' | 'trivial';
export type Category = 'quality' | 'performance' | 'security';
export interface Issue {
    file: string;
    line: number;
    severity: Severity;
    category: Category;
    title: string;
    description: string;
    suggestion: string;
}
export interface ReviewComment {
    path: string;
    line: number;
    body: string;
    side?: 'LEFT' | 'RIGHT';
}
export interface OrchestratorInput {
    diff: DiffChunk[];
    qualityIssues: Issue[];
    performanceIssues: Issue[];
    securityIssues: Issue[];
    existingComments?: ReviewComment[];
}
export interface ReviewStats {
    total: number;
    critical: number;
    major: number;
    minor: number;
    filtered: number;
}
export interface OrchestratorOutput {
    summary: string;
    comments: ReviewComment[];
    stats: ReviewStats;
}
export interface ResolverResult {
    resolved: boolean;
    confidence: number;
    reason: string;
}
export interface ResolverSummary {
    resolved: number;
    skipped: number;
    failed: number;
    details: ResolverResult[];
}
export interface ThreadComment {
    id: number;
    body: string;
    author: string;
}
export interface ReviewThread {
    id: string;
    isResolved: boolean;
    isOutdated: boolean;
    path: string;
    line: number;
    comments: ThreadComment[];
}
export interface AgentConfig {
    provider: 'kimi' | 'anthropic' | 'google';
    model: string;
    prompt_file: string;
    temperature?: number;
    max_tokens?: number;
    confidence_threshold?: number;
}
export interface TriggersConfig {
    review_on: string[];
    resolve_on: string[];
    respond_to: string;
}
export interface OptionsConfig {
    language: string;
    max_comments_per_review: number;
    review_draft_pr: boolean;
    skip_bot_prs: boolean;
    exclude_files: string[];
}
export interface AppConfig {
    agents: {
        quality: AgentConfig;
        performance: AgentConfig;
        security: AgentConfig;
        orchestrator: AgentConfig;
        resolver: AgentConfig;
        responder: AgentConfig;
    };
    triggers: TriggersConfig;
    options: OptionsConfig;
}
