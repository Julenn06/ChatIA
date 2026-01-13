/**
 * Compression Middleware
 * Comprime respuestas usando gzip para reducir tamaño de transferencia
 */

/**
 * Verifica si el cliente soporta compresión gzip
 */
export function supportsGzip(req: Request): boolean {
  const acceptEncoding = req.headers.get('Accept-Encoding') || '';
  return acceptEncoding.includes('gzip');
}

/**
 * Comprime el contenido de una respuesta si es apropiado
 */
export async function compressResponse(response: Response, req: Request): Promise<Response> {
  // No comprimir si el cliente no soporta gzip
  if (!supportsGzip(req)) {
    return response;
  }

  // No comprimir respuestas ya comprimidas o vacías
  const contentEncoding = response.headers.get('Content-Encoding');
  if (contentEncoding || response.status === 204 || response.status === 304) {
    return response;
  }

  // No comprimir streams (SSE)
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('text/event-stream')) {
    return response;
  }

  // Solo comprimir contenido texto (JSON, HTML, CSS, JS)
  const compressibleTypes = [
    'application/json',
    'text/html',
    'text/css',
    'application/javascript',
    'text/javascript',
    'text/plain'
  ];

  const shouldCompress = compressibleTypes.some(type => contentType.includes(type));
  if (!shouldCompress) {
    return response;
  }

  // Obtener el cuerpo de la respuesta
  const body = await response.text();
  
  // Solo comprimir si el contenido es mayor a 1KB (no vale la pena comprimir archivos pequeños)
  if (body.length < 1024) {
    return response;
  }

  // Comprimir usando gzip de Bun
  const compressed = Bun.gzipSync(body);

  // Crear nueva respuesta con contenido comprimido
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Content-Encoding', 'gzip');
  newHeaders.set('Content-Length', compressed.length.toString());
  newHeaders.delete('Transfer-Encoding'); // No necesario con Content-Length

  return new Response(compressed, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
