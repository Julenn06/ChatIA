import { groqService } from './services/groq';
import { cerebrasService } from './services/cerebras';
import { geminiService } from './services/gemini';
import { ollamaService } from './services/ollama';
import type { AIService, ChatMessage } from './types';

// Solo incluir servicios con API keys configuradas
const services: AIService[] = [
  groqService,
  cerebrasService,
  geminiService,
  // Ollama es opcional - comentado por ahora ya que requiere instalación local
  // ollamaService,
]
let currentServiceIndex = 0;

function getNextService() {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
}

const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  async fetch(req) {
    const { pathname } = new URL(req.url)

    // Servir la interfaz web
    if (req.method === 'GET' && pathname === '/') {
      const file = Bun.file('./public/index.html');
      return new Response(file, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Ignorar favicon
    if (pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }

    // Endpoint para procesar archivos
    if (req.method === 'POST' && pathname === '/upload') {
      try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
          return new Response(JSON.stringify({ error: 'No file provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Limitar tamaño de archivo a 5MB
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
          return new Response(JSON.stringify({ 
            error: 'File too large',
            details: 'Maximum file size is 5MB'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        let content = '';
        const fileType = file.type;
        const fileName = file.name;
        const MAX_CONTENT_LENGTH = 8000; // Limitar a 8k caracteres

        // Procesar según el tipo de archivo
        if (fileType.startsWith('image/')) {
          // Para imágenes, convertir a base64
          const bytes = await file.arrayBuffer();
          const base64 = Buffer.from(bytes).toString('base64');
          const dataUrl = `data:${fileType};base64,${base64}`;
          content = `[Imagen adjunta: ${fileName}]\nDescribe o analiza esta imagen.`;
          
          return new Response(JSON.stringify({ 
            success: true,
            content,
            fileName,
            fileType,
            size: file.size,
            base64: dataUrl,
            isImage: true
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (fileType === 'application/pdf') {
          // Para PDFs, intentar extraer texto básico y limitarlo
          const text = await file.text();
          const truncated = text.substring(0, MAX_CONTENT_LENGTH);
          content = `[PDF adjunto: ${fileName}]\n${truncated}${text.length > MAX_CONTENT_LENGTH ? '\n\n... (contenido truncado)' : ''}`;
        } else if (fileType.startsWith('text/') || 
                   fileName.endsWith('.txt') || 
                   fileName.endsWith('.md') ||
                   fileName.endsWith('.js') ||
                   fileName.endsWith('.ts') ||
                   fileName.endsWith('.json') ||
                   fileName.endsWith('.csv') ||
                   fileName.endsWith('.py') ||
                   fileName.endsWith('.html') ||
                   fileName.endsWith('.css')) {
          // Para archivos de texto, limitar tamaño
          const text = await file.text();
          const truncated = text.substring(0, MAX_CONTENT_LENGTH);
          content = truncated + (text.length > MAX_CONTENT_LENGTH ? '\n\n... (contenido truncado por tamaño)' : '');
        } else {
          content = `[Archivo adjunto: ${fileName} (${fileType})]\nTamaño: ${file.size} bytes`;
        }

        return new Response(JSON.stringify({ 
          success: true,
          content,
          fileName,
          fileType,
          size: file.size
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('Upload error:', error);
        return new Response(JSON.stringify({ 
          error: 'Error processing file',
          details: error instanceof Error ? error.message : 'Unknown error'
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (req.method === 'POST' && pathname === '/chat') {
      try {
        const { messages } = await req.json() as { messages: ChatMessage[] };
        
        let streamGenerator;
        let lastError;
        let attempts = 0;
        const maxAttempts = services.length;
        
        // Intentar con cada servicio hasta que uno funcione
        while (attempts < maxAttempts && !streamGenerator) {
          const service = getNextService();
          console.log(`Using ${service?.name} service`);
          
          try {
            streamGenerator = await service?.chat(messages);
            break;
          } catch (serviceError: any) {
            lastError = serviceError;
            const errorMsg = serviceError?.message || String(serviceError);
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
        
        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
              for await (const chunk of streamGenerator) {
                if (chunk) {
                  const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
                  controller.enqueue(encoder.encode(data));
                }
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              console.error('Streaming error:', error);
              controller.error(error);
            }
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (error) {
        console.error('Chat endpoint error:', error);
        return new Response(JSON.stringify({ 
          error: 'Error processing request',
          details: error instanceof Error ? error.message : 'Unknown error'
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response("Not found", { status: 404 });
  }
})

console.log(`Server is running on ${server.url}`);