import type { ChatMessage } from '../types';
import { getNextService } from '../utils/serviceManager';
import { LIMITS } from '../constants';

// Reutilizar encoder y headers para mejor rendimiento
const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
};
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function handleChatRequest(req: Request): Promise<Response> {
  try {
    const body = await req.json() as { messages: ChatMessage[] };
    const { messages } = body;
    
    let streamGenerator;
    let lastError;
    let attempts = 0;
    const maxAttempts = LIMITS.MAX_FAILOVER_ATTEMPTS;
    
    // Intentar con cada servicio hasta que uno funcione
    while (attempts < maxAttempts && !streamGenerator) {
      const service = getNextService();
      console.log(`Using ${service?.name} service`);
      
      try {
        streamGenerator = await service?.chat(messages);
        break;
      } catch (serviceError: unknown) {
        lastError = serviceError;
        const errorMsg = serviceError instanceof Error ? serviceError.message : String(serviceError);
        console.error(`Error with ${service?.name}: ${errorMsg.substring(0, 200)}`);
        attempts++;
        
        if (attempts < maxAttempts) {
          console.log(`Trying next service...`);
        }
      }
    }
    
    if (!streamGenerator) {
      throw new Error(`All AI services are currently unavailable. Please try again later.`);
    }

    // Crear stream de respuesta
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          for await (const chunk of streamGenerator) {
            const data = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return new Response(JSON.stringify({ 
      error: 'Error processing request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: JSON_HEADERS
    });
  }
}
