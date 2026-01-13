import type { AIService, ChatMessage } from '../types';

// Ollama no requiere API key por defecto, pero si la tienes configurada la usamos
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export const ollamaService: AIService = {
  name: 'Ollama',
  async chat(messages: ChatMessage[]) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (OLLAMA_API_KEY) {
      headers['Authorization'] = `Bearer ${OLLAMA_API_KEY}`;
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'llama3.2',
        messages: messages,
        stream: true,
        options: {
          temperature: 0.7,
          num_predict: 4096,
        }
      }),
      // @ts-ignore - Bun specific
      tls: { rejectUnauthorized: false }
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return (async function* () {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              yield json.message.content;
            }
          } catch (e) {
            // Ignorar errores de parsing
          }
        }
      }
    })();
  }
};
