import { handleChatRequest } from '../controllers/chatController';
import { handleFileUpload } from '../controllers/fileController';

export async function handleRoutes(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);

  // Servir la interfaz web
  if (req.method === 'GET' && pathname === '/') {
    const file = Bun.file('./public/index.html');
    return new Response(file, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }

  // Servir archivos estáticos CSS
  if (req.method === 'GET' && pathname.startsWith('/css/')) {
    const file = Bun.file(`./public${pathname}`);
    return new Response(file, {
      headers: {
        'Content-Type': 'text/css',
      },
    });
  }

  // Servir archivos estáticos JS
  if (req.method === 'GET' && pathname.startsWith('/js/')) {
    const file = Bun.file(`./public${pathname}`);
    return new Response(file, {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  }

  // Ignorar favicon
  if (pathname === '/favicon.ico') {
    return new Response(null, { status: 204 });
  }

  // Endpoint para procesar archivos
  if (req.method === 'POST' && pathname === '/upload') {
    return handleFileUpload(req);
  }

  // Endpoint de chat
  if (req.method === 'POST' && pathname === '/chat') {
    return handleChatRequest(req);
  }

  return new Response("Not found", { status: 404 });
}
