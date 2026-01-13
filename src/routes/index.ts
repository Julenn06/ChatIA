import { handleChatRequest } from '../controllers/chatController';
import { handleFileUpload } from '../controllers/fileController';
import { compressResponse } from '../middlewares/compression';

// Detectar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production';
const publicDir = isProduction ? './dist' : './public';

// Headers de caché para assets estáticos (1 año)
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=31536000, immutable'
};

// Headers sin caché para HTML
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function handleRoutes(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);

  let response: Response;

  // Servir la interfaz web
  if (req.method === 'GET' && pathname === '/') {
    const file = Bun.file(`${publicDir}/index.html`);
    response = new Response(file, {
      headers: {
        'Content-Type': 'text/html',
        ...NO_CACHE_HEADERS // No cachear HTML para updates frecuentes
      },
    });
    return compressResponse(response, req);
  }

  // Servir archivos estáticos CSS (con caché largo)
  if (req.method === 'GET' && pathname.startsWith('/css/')) {
    const file = Bun.file(`${publicDir}${pathname}`);
    response = new Response(file, {
      headers: {
        'Content-Type': 'text/css',
        ...CACHE_HEADERS // Cachear CSS por 1 año
      },
    });
    return compressResponse(response, req);
  }

  // Servir archivos estáticos JS (con caché largo)
  if (req.method === 'GET' && pathname.startsWith('/js/')) {
    const file = Bun.file(`${publicDir}${pathname}`);
    response = new Response(file, {
      headers: {
        'Content-Type': 'application/javascript',
        ...CACHE_HEADERS // Cachear JS por 1 año
      },
    });
    return compressResponse(response, req);
  }

  // Ignorar favicon
  if (pathname === '/favicon.ico') {
    return new Response(null, { status: 204 });
  }

  // Endpoint para procesar archivos
  if (req.method === 'POST' && pathname === '/upload') {
    response = await handleFileUpload(req);
    return compressResponse(response, req);
  }

  // Endpoint de chat (no comprimir SSE streams)
  if (req.method === 'POST' && pathname === '/chat') {
    return handleChatRequest(req);
  }

  return new Response("Not found", { status: 404 });
}
