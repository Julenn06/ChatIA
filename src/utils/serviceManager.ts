import { groqService } from '../services/groq';
import { cerebrasService } from '../services/cerebras';
import { geminiService } from '../services/gemini';
// import { ollamaService } from '../services/ollama';
import type { AIService } from '../types';

// Solo incluir servicios con API keys configuradas
const services: AIService[] = [
  groqService,
  cerebrasService,
  geminiService,
  // Ollama es opcional - comentado por ahora ya que requiere instalación local
  // ollamaService,
].filter(service => service !== null);

let currentServiceIndex = 0;

export function getNextService(): AIService {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
}

export function getAvailableServices(): AIService[] {
  return services;
}
