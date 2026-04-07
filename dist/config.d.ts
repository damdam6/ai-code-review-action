import type { AppConfig } from './types.js';
export declare function loadPrompt(promptFile: string, baseDir: string): string;
export declare function loadConfig(configPath?: string): AppConfig;
export declare function getAiReviewDir(): string;
