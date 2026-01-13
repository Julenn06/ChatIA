import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIService, ChatMessage } from '../types';

// Guardar el fetch original
const originalFetch = globalThis.fetch;

// Crear fetch personalizado para SSL
const customFetch = (url: string | URL | Request, init?: RequestInit) => {
  return originalFetch(url, {
    ...init,
    // @ts-ignore - Bun specific
    tls: { rejectUnauthorized: false }
  });
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiService: AIService = {
  name: 'Google Gemini',
  async chat(messages: ChatMessage[]) {
    // Temporalmente reemplazar fetch global
    globalThis.fetch = customFetch as any;
    
    try {
      if (messages.length === 0) {
        throw new Error('No messages provided');
      }

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      });

      // Convertir mensajes al formato de Gemini
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) {
        throw new Error('Last message is undefined');
      }

      const chat = model.startChat({
        history: history.filter(h => h.role !== 'system')
      });

      const result = await chat.sendMessageStream(lastMessage.content);

      return (async function* () {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              yield text;
            }
          }
        } finally {
          // Restaurar fetch original
          globalThis.fetch = originalFetch;
        }
      })();
    } catch (error) {
      // Restaurar fetch original en caso de error
      globalThis.fetch = originalFetch;
      throw error;
    }
  }
};
