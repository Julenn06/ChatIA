/**
 * AI Service type definitions
 */

import type { ChatMessage } from './chat.types';

export interface AIService {
  name: string;
  chat: (messages: ChatMessage[]) => Promise<AsyncIterable<string>>;
}
