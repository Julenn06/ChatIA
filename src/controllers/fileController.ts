import { LIMITS } from '../constants';

const MAX_FILE_SIZE = LIMITS.MAX_FILE_SIZE;
const MAX_CONTENT_LENGTH = LIMITS.MAX_CONTENT_LENGTH;

// Regex pre-compilada para validación de extensiones de texto
const TEXT_FILE_EXTENSIONS = /\.(txt|md|js|ts|json|csv|py|html|css)$/i;

// Headers reutilizables
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function handleFileUpload(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: JSON_HEADERS
      });
    }

    // Limitar tamaño de archivo
    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ 
        error: 'File too large',
        details: 'Maximum file size is 5MB'
      }), {
        status: 400,
        headers: JSON_HEADERS
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
        headers: JSON_HEADERS
      });
    } else if (fileType === 'application/pdf') {
      // Para PDFs, intentar extraer texto básico y limitarlo
      const text = await file.text();
      const truncated = text.substring(0, MAX_CONTENT_LENGTH);
      content = `[PDF adjunto: ${fileName}]\n${truncated}${text.length > MAX_CONTENT_LENGTH ? '\n\n... (contenido truncado)' : ''}`;
    } else if (fileType.startsWith('text/') || TEXT_FILE_EXTENSIONS.test(fileName)) {
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
      headers: JSON_HEADERS
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Error processing file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: JSON_HEADERS
    });
  }
}
