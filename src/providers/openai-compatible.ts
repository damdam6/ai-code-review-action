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
        // temperature는 명시적으로 설정된 경우에만 전달 — deepseek-reasoner, gpt-5 등
        // 일부 reasoning 모델은 temperature를 지원하지 않아 전달 시 에러가 발생함
        ...(params.temperature !== undefined && { temperature: params.temperature }),
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
