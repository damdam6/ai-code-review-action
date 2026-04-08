import OpenAI from 'openai';
import type { LLMChatParams, LLMProvider } from '../types.js';
import { withRetry } from './base.js';

interface OpenAICompatibleOptions {
  name: string;
  baseURL?: string;
  useMaxCompletionTokens?: boolean;
}

export const createOpenAICompatible = (
  apiKey: string,
  options: OpenAICompatibleOptions,
): LLMProvider => {
  if (!apiKey) {
    throw new Error(`API key is required for ${options.name}`);
  }

  const client = new OpenAI({
    apiKey,
    ...(options.baseURL && { baseURL: options.baseURL }),
  });

  return {
    chat: withRetry(async (params: LLMChatParams) => {
      const tokenParam = options.useMaxCompletionTokens
        ? { max_completion_tokens: params.maxTokens ?? 4096 }
        : { max_tokens: params.maxTokens ?? 4096 };

      const response = await client.chat.completions.create({
        model: params.model,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userMessage },
        ],
        temperature: params.temperature ?? 0.3,
        ...tokenParam,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`${options.name} returned empty response`);
      }
      return content;
    }),
  };
};
