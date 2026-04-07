import { runReviewAgent } from './utils.js';
export const runPerformanceReview = async (provider, model, systemPrompt, diff, temperature, maxTokens) => {
    const issues = await runReviewAgent('Performance', provider, { model, systemPrompt, temperature, maxTokens }, diff);
    return issues.map((issue) => ({
        ...issue,
        category: 'performance',
    }));
};
//# sourceMappingURL=performance.js.map