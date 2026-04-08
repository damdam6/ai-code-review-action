import OpenAI from 'openai';
import type { LLMChatParams, LLMProvider } from '../types.js';
import { withRetry } from './base.js';

export const createOpenAI = (apiKey: string): LLMProvider => {
  if (!apiKey) {
    throw new Error('API key is required for OpenAI');
  }

  const client = new OpenAI({ apiKey });

  return {
    chat: withRetry(async (params: LLMChatParams) => {
      const response = await client.chat.completions.create({
        model: params.model,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userMessage },
        ],
        temperature: params.temperature ?? 0.3,
        max_completion_tokens: params.maxTokens ?? 4096,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI returned empty response');
      }
      return content;
    }),
  };
};
