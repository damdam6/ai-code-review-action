import { runReviewAgent } from './utils.js';
export const runSecurityReview = async (provider, model, systemPrompt, diff, temperature, maxTokens) => {
    const issues = await runReviewAgent('Security', provider, { model, systemPrompt, temperature, maxTokens }, diff);
    return issues.map((issue) => ({
        ...issue,
        category: 'security',
    }));
};
//# sourceMappingURL=security.js.map