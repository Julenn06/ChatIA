import type { ChatMessage } from '../types';
import { config } from '../config';

const MAX_FILE_SIZE = config.maxFileSize;
const MAX_CONTENT_LENGTH = config.maxContentLength;

export async function handleFileUpload(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Limitar tamaño de archivo
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
