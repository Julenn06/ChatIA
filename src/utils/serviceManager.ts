import { groqService } from '../services/groq';
import { cerebrasService } from '../services/cerebras';
import type { AIService } from '../types';

const services: AIService[] = [
  groqService,
  cerebrasService
];

let currentServiceIndex = 0;

export function getNextService(): AIService {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service!; // Services array is guaranteed to have at least one service
}
