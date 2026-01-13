/**
 * Chat-related type definitions
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
