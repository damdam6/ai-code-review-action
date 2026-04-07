import * as core from '@actions/core';
import { formatDiffForLLM, parseJsonResponse, sanitizeMarkdown } from './reviewers/utils.js';
const SEVERITY_PRIORITY = {
    critical: 0,
    major: 1,
    minor: 2,
    trivial: 3,
};
const limitComments = (comments, max) => {
    // critical/major는 max 제한에서 제외 — 항상 포함
    const mustKeep = comments.filter(c => c.severity === 'critical' || c.severity === 'major');
    const rest = comments.filter(c => c.severity !== 'critical' && c.severity !== 'major');
    const remaining = Math.max(0, max - mustKeep.length);
    const kept = [...mustKeep.map(c => c.comment), ...rest.slice(0, remaining).map(c => c.comment)];
    const filtered = comments.length - kept.length;
    return { kept, filtered };
};
const VALID_SEVERITIES = new Set(['critical', 'major', 'minor', 'trivial']);
const VALID_SIDES = new Set(['LEFT', 'RIGHT']);
const isValidComment = (c) => {
    if (typeof c !== 'object' || c === null)
        return false;
    const obj = c;
    return (typeof obj.path === 'string' && obj.path.length > 0 &&
        typeof obj.line === 'number' && Number.isInteger(obj.line) && obj.line > 0 &&
        typeof obj.body === 'string' && obj.body.length > 0 &&
        typeof obj.severity === 'string' && VALID_SEVERITIES.has(obj.severity) &&
        (obj.side === undefined || VALID_SIDES.has(obj.side)));
};
export const runOrchestrator = async (provider, model, systemPrompt, input, maxComments, temperature, maxTokens) => {
    const diffText = formatDiffForLLM(input.diff);
    const issuesSummary = JSON.stringify({
        quality: input.qualityIssues,
        performance: input.performanceIssues,
        security: input.securityIssues,
    }, null, 2);
    let userMessage = `## Code Diff\n${diffText}\n\n## Review Issues from Specialist Agents\n${issuesSummary}`;
    if (input.existingComments && input.existingComments.length > 0) {
        const existingJson = JSON.stringify(input.existingComments, null, 2);
        userMessage += `\n\n## Existing Bot Review Comments (Already Posted)\n${existingJson}`;
    }
    try {
        const response = await provider.chat({
            model,
            systemPrompt,
            userMessage,
            temperature,
            maxTokens,
        });
        const parsed = parseJsonResponse(response);
        if (!parsed || !Array.isArray(parsed.comments)) {
            core.warning(`[Orchestrator] Failed to parse response (model: ${model})`);
            return {
                summary: 'Failed to generate review summary.',
                comments: [],
                stats: { total: 0, critical: 0, major: 0, minor: 0, filtered: 0 },
            };
        }
        // 각 comment 유효성 검증 — 잘못된 항목은 필터링
        const validComments = parsed.comments.filter((c) => {
            if (isValidComment(c))
                return true;
            core.warning(`Dropped invalid orchestrator comment: ${JSON.stringify(c)}`);
            return false;
        });
        // severity 우선순위로 정렬
        const sorted = [...validComments].sort((a, b) => (SEVERITY_PRIORITY[a.severity] ?? 3) - (SEVERITY_PRIORITY[b.severity] ?? 3));
        const { kept, filtered } = limitComments(sorted.map((c) => ({
            comment: { path: c.path, line: c.line, body: c.body, side: c.side },
            severity: c.severity,
        })), maxComments);
        // stats 계산
        const stats = {
            total: sorted.length,
            critical: sorted.filter((c) => c.severity === 'critical').length,
            major: sorted.filter((c) => c.severity === 'major').length,
            minor: sorted.filter((c) => c.severity === 'minor').length,
            filtered,
        };
        return {
            summary: sanitizeMarkdown(parsed.summary),
            comments: kept,
            stats,
        };
    }
    catch (error) {
        core.warning(`[Orchestrator] Agent failed (model: ${model}): ${error instanceof Error ? error.message : String(error)}`);
        return {
            summary: 'Failed to generate review summary.',
            comments: [],
            stats: { total: 0, critical: 0, major: 0, minor: 0, filtered: 0 },
        };
    }
};
//# sourceMappingURL=orchestrator.js.map