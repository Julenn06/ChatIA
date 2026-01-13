# AI Chat Platform - Enterprise Edition

Plataforma de chat profesional con múltiples servicios de IA (Groq, Cerebras, Gemini) y sistema de failover automático.

## 🚀 Características

- **Multi-Servicio IA**: Integración con Groq, Cerebras y Google Gemini
- **Failover Automático**: Si un servicio falla, automáticamente prueba con el siguiente
- **Streaming en Tiempo Real**: Respuestas generadas en tiempo real con Server-Sent Events
- **Soporte de Archivos**: Sube imágenes, PDFs, código y documentos de texto
- **Interfaz Moderna**: UI responsive con tema oscuro y animaciones fluidas
- **Renderizado Markdown**: Soporte completo para markdown en respuestas
- **Historial de Conversación**: Mantiene el contexto de la conversación

## 📁 Estructura del Proyecto

```
ChatIA/
├── src/
│   ├── index.ts              # Punto de entrada del servidor
│   ├── types.ts              # Definiciones de tipos TypeScript
│   ├── config/
│   │   └── index.ts          # Configuración centralizada
│   ├── controllers/
│   │   ├── chatController.ts # Lógica de chat
│   │   └── fileController.ts # Manejo de archivos
│   ├── routes/
│   │   └── index.ts          # Definición de rutas
│   ├── services/
│   │   ├── groq.ts           # Servicio Groq
│   │   ├── cerebras.ts       # Servicio Cerebras
│   │   ├── gemini.ts         # Servicio Google Gemini
│   │   └── ollama.ts         # Servicio Ollama (opcional)
│   └── utils/
│       └── serviceManager.ts # Gestión de servicios IA
├── public/
│   ├── index.html            # Interfaz web
│   ├── css/
│   │   └── styles.css        # Estilos de la aplicación
│   └── js/
│       ├── main.js           # Punto de entrada JS
│       ├── chatManager.js    # Gestión del chat
│       ├── fileHandler.js    # Manejo de archivos
│       └── markdownRenderer.js # Renderizado markdown
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Instalación

### Requisitos Previos

- [Bun](https://bun.sh/) >= 1.0
- API Keys de al menos uno de los servicios:
  - Groq API Key
  - Cerebras API Key
  - Google Gemini API Key

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd ChatIA
   ```

2. **Instalar dependencias**
   ```bash
   bun install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```bash
   # API Keys (configura al menos una)
   GROQ_API_KEY=tu_api_key_aqui
   CEREBRAS_API_KEY=tu_api_key_aqui
   GEMINI_API_KEY=tu_api_key_aqui
   
   # Puerto del servidor (opcional)
   PORT=3000
   ```

4. **Ejecutar en desarrollo**
   ```bash
   bun run dev
   ```

5. **Ejecutar en producción**
   ```bash
   bun run start
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔑 Obtener API Keys

### Groq
1. Visita [console.groq.com](https://console.groq.com)
2. Crea una cuenta o inicia sesión
3. Navega a API Keys y genera una nueva

### Cerebras
1. Visita [cerebras.ai](https://cerebras.ai)
2. Solicita acceso a su plataforma
3. Genera tu API key desde el dashboard

### Google Gemini
1. Visita [ai.google.dev](https://ai.google.dev)
2. Crea un proyecto en Google Cloud
3. Habilita la API de Gemini
4. Genera una API key

## 📝 Uso

### Chat Básico
1. Escribe tu mensaje en el campo de texto
2. Presiona Enter o haz clic en el botón de enviar
3. La IA responderá en tiempo real

### Adjuntar Archivos
- **Arrastra y suelta**: Arrastra un archivo al área de mensajes
- **Botón de adjuntar**: Haz clic en 📎 y selecciona un archivo
- **Tipos soportados**: 
  - Imágenes: JPG, PNG, GIF, WebP
  - Documentos: PDF, TXT, MD
  - Código: JS, TS, JSON, PY, HTML, CSS, CSV

### Funciones Avanzadas
- **Regenerar respuesta**: Haz clic en "🔄 Otra respuesta"
- **Copiar mensaje**: Haz clic en "📋 Copiar"
- **Limpiar chat**: Haz clic en el ícono 🗑️
- **Detener generación**: Haz clic en "Detener" mientras se genera

## 🏗️ Arquitectura

### Backend (Bun + TypeScript)

- **Servidor HTTP**: Bun.serve con routing manual
- **Streaming**: Server-Sent Events (SSE) para respuestas en tiempo real
- **Controladores**: Separación de lógica en controladores específicos
- **Servicios IA**: Abstracción mediante interfaces comunes
- **Failover**: Rotación automática entre servicios disponibles

### Frontend (Vanilla JS + Módulos ES6)

- **Modular**: Código dividido en módulos reutilizables
- **Sin frameworks**: Vanilla JavaScript para máximo rendimiento
- **Responsive**: Diseño adaptable a móviles y tablets
- **Accesible**: Interfaz intuitiva y fácil de usar

## 🔧 Configuración Avanzada

### Límites de Archivo

En [`src/config/index.ts`](src/config/index.ts):
```typescript
maxFileSize: 5 * 1024 * 1024, // 5MB
maxContentLength: 8000, // 8k caracteres
```

### Modelos IA

Cada servicio puede configurarse en su archivo correspondiente:

- **Groq**: [`src/services/groq.ts`](src/services/groq.ts)
- **Cerebras**: [`src/services/cerebras.ts`](src/services/cerebras.ts)
- **Gemini**: [`src/services/gemini.ts`](src/services/gemini.ts)

### Estilos

Personaliza colores y tema en [`public/css/styles.css`](public/css/styles.css):
```css
:root {
    --primary: #2563eb;
    --bg-primary: #0f172a;
    /* ... más variables */
}
```

## 🐛 Solución de Problemas

### El servidor no inicia
- Verifica que Bun esté instalado: `bun --version`
- Verifica que las dependencias estén instaladas: `bun install`
- Revisa que el puerto no esté en uso

### "All AI services are currently unavailable"
- Verifica que al menos una API key esté configurada en `.env`
- Verifica que las API keys sean válidas
- Revisa los logs del servidor para errores específicos

### Los archivos no se suben
- Verifica el tamaño del archivo (máx. 5MB)
- Verifica que el tipo de archivo esté soportado
- Revisa la consola del navegador para errores

## 📄 Licencia

Este proyecto es privado y de uso interno.

## 🤝 Contribución

Para contribuir:
1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios
3. Ejecuta tests (si aplica)
4. Crea un Pull Request

## 📧 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.

## 🔄 Changelog

### v2.0.0 - Reestructuración Completa
- ✨ Arquitectura modular con separación de responsabilidades
- 🎨 Código frontend separado en módulos ES6
- 📁 Estructura de carpetas profesional (src/, public/)
- 🔧 Configuración centralizada
- 📝 Documentación completa

### v1.0.0 - Versión Inicial
- 🚀 Integración con múltiples servicios IA
- 💬 Chat en tiempo real con streaming
- 📎 Soporte para archivos adjuntos
- 🎨 Interfaz moderna y responsive
