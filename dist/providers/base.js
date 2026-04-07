import { createKimi } from "./kimi.js";
import { createAnthropic } from "./anthropic.js";
import { createGoogle } from "./google.js";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const LLM_TIMEOUT_MS = 180_000;
const isRetryable = (error) => {
    if (error instanceof Error) {
        const msg = error.message;
        return (msg.includes("rate limit") ||
            msg.includes("429") ||
            msg.includes("timeout") ||
            msg.includes("ETIMEDOUT"));
    }
    return false;
};
const withTimeout = (promise, ms) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`LLM call timed out after ${ms}ms`)), ms);
        promise.then((val) => {
            clearTimeout(timer);
            resolve(val);
        }, (err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
};
export const withRetry = (chatFn) => {
    return async (params) => {
        let lastError;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                return await withTimeout(chatFn(params), LLM_TIMEOUT_MS);
            }
            catch (error) {
                lastError = error;
                if (!isRetryable(error)) {
                    throw error;
                }
                if (attempt < MAX_RETRIES - 1) {
                    const delay = BASE_DELAY_MS * Math.pow(2, attempt);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    };
};
export const createProvider = (provider, apiKey) => {
    switch (provider) {
        case "kimi":
            return createKimi(apiKey);
        case "anthropic":
            return createAnthropic(apiKey);
        case "google":
            return createGoogle(apiKey);
        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
};
//# sourceMappingURL=base.js.map