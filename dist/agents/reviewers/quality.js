import { runReviewAgent } from './utils.js';
export const runQualityReview = async (provider, model, systemPrompt, diff, temperature, maxTokens) => {
    const issues = await runReviewAgent('Quality', provider, { model, systemPrompt, temperature, maxTokens }, diff);
    return issues.map((issue) => ({
        ...issue,
        category: 'quality',
    }));
};
//# sourceMappingURL=quality.js.map