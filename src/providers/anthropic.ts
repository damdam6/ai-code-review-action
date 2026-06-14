import Anthropic from '@anthropic-ai/sdk';
import type { LLMChatParams, LLMProvider } from '../types.js';
import { withRetry } from './base.js';

export const createAnthropic = (apiKey: string): LLMProvider => {
  if (!apiKey) {
    throw new Error('API key is required for Anthropic');
  }

  const client = new Anthropic({ apiKey });

  return {
    chat: withRetry(async (params: LLMChatParams) => {
      const response = await client.messages.create({
        model: params.model,
        system: params.systemPrompt,
        messages: [
          { role: 'user', content: params.userMessage },
        ],
        // temperature는 명시적으로 설정된 경우에만 전달 — Opus 4.7+ 등 일부 모델은
        // temperature 파라미터를 지원하지 않아 전달 시 400 에러가 발생함
        ...(params.temperature !== undefined && { temperature: params.temperature }),
        max_tokens: params.maxTokens ?? 4096,
      });

      const block = response.content[0];
      if (!block || block.type !== 'text') {
        throw new Error('Anthropic returned empty response');
      }
      return block.text;
    }),
  };
};
