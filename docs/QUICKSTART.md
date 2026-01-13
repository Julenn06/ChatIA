# 🚀 Guía de Inicio Rápido

## ✅ Reestructuración Completada

El proyecto ha sido completamente reorganizado en una arquitectura modular y profesional.

## 📋 Requisitos Previos

### 1. Instalar Bun

**Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**macOS/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

Verifica la instalación:
```bash
bun --version
```

### 2. Obtener API Keys

Necesitas al menos **UNA** de las siguientes API keys:

- **Groq**: https://console.groq.com/keys
- **Cerebras**: https://cerebras.ai
- **Google Gemini**: https://ai.google.dev

## 🛠️ Configuración

### 1. Clonar/Navegar al Proyecto

```bash
cd ChatIA
```

### 2. Instalar Dependencias

```bash
bun install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

Edita `.env` y añade tus API keys:
```bash
# Añade al menos UNA de estas:
GROQ_API_KEY=tu_api_key_aqui
CEREBRAS_API_KEY=tu_api_key_aqui
GEMINI_API_KEY=tu_api_key_aqui

# Opcional
PORT=3000
```

## ▶️ Ejecutar el Proyecto

### Modo Desarrollo (con hot reload)
```bash
bun run dev
```

### Modo Producción
```bash
bun run start
```

### Resultado Esperado
```
🚀 Server is running on http://localhost:3000
📁 Serving files from: ./public
🤖 Available AI services: groq, cerebras, gemini
```

## 🌐 Acceder a la Aplicación

Abre tu navegador y visita:
```
http://localhost:3000
```

## 📁 Nueva Estructura del Proyecto

```
ChatIA/
├── src/                      # 🔧 Backend (TypeScript)
│   ├── index.ts             # Entry point del servidor
│   ├── types.ts             # Tipos compartidos
│   ├── config/              # Configuración
│   ├── controllers/         # Lógica de negocio
│   ├── routes/              # Definición de rutas
│   ├── services/            # Integraciones con APIs IA
│   └── utils/               # Utilidades
│
├── public/                   # 🎨 Frontend (HTML/CSS/JS)
│   ├── index.html           # Interfaz limpia
│   ├── css/                 # Estilos separados
│   └── js/                  # JavaScript modular
│       ├── main.js          # Inicialización
│       ├── chatManager.js   # Gestión del chat
│       ├── fileHandler.js   # Manejo de archivos
│       └── markdownRenderer.js
│
├── .env                     # Variables de entorno (crear)
├── .env.example             # Template
├── README.md                # Documentación completa
├── ARCHITECTURE.md          # Arquitectura detallada
└── SUMMARY.md               # Resumen de cambios
```

## 🎯 Características Principales

### ✨ Backend
- ✅ Arquitectura modular
- ✅ TypeScript con tipos seguros
- ✅ Failover automático entre servicios IA
- ✅ Streaming de respuestas en tiempo real
- ✅ Procesamiento de múltiples tipos de archivos
- ✅ Configuración centralizada

### ✨ Frontend
- ✅ Código modular (ES6 Modules)
- ✅ Interfaz responsive
- ✅ Drag & drop para archivos
- ✅ Renderizado de Markdown
- ✅ Streaming de respuestas
- ✅ Tema oscuro moderno

## 🧪 Probar la Aplicación

### Chat Básico
1. Escribe un mensaje en el campo de texto
2. Presiona Enter o haz clic en ➤
3. La IA responderá en tiempo real

### Subir Archivos
1. Haz clic en 📎 o arrastra un archivo
2. Archivos soportados:
   - Imágenes: JPG, PNG, GIF, WebP
   - Documentos: PDF, TXT, MD
   - Código: JS, TS, JSON, PY, HTML, CSS

### Funciones Adicionales
- 🔄 Regenerar respuesta
- 📋 Copiar mensaje
- 🗑️ Limpiar conversación
- ⬛ Detener generación

## ⚠️ Solución de Problemas

### Error: "bun: command not found"
**Solución:** Instala Bun (ver sección de requisitos previos)

### Error: "All AI services are currently unavailable"
**Causas posibles:**
1. No hay API keys configuradas en `.env`
2. Las API keys son inválidas
3. Problemas de conectividad

**Solución:**
1. Verifica que `.env` existe y contiene al menos una API key
2. Verifica que las API keys sean válidas
3. Revisa los logs del servidor

### El puerto 3000 está en uso
**Solución:** Cambia el puerto en `.env`:
```bash
PORT=3001
```

### Los archivos no se cargan
**Solución:**
1. Verifica el tamaño (máx. 5MB)
2. Verifica el tipo de archivo
3. Revisa la consola del navegador (F12)

## 📚 Documentación Adicional

- **README.md** - Documentación completa del proyecto
- **ARCHITECTURE.md** - Detalles de la arquitectura
- **SUMMARY.md** - Resumen de la reestructuración

## 🔧 Desarrollo

### Agregar un Nuevo Servicio IA

1. Crea un nuevo archivo en `src/services/`:
```typescript
// src/services/miservicio.ts
import type { AIService } from '../types';

export const miServicio: AIService = {
  name: 'MiServicio',
  async chat(messages) {
    // Implementación
  }
};
```

2. Agrégalo en `src/utils/serviceManager.ts`:
```typescript
import { miServicio } from '../services/miservicio';

const services: AIService[] = [
  groqService,
  cerebrasService,
  geminiService,
  miServicio, // ← Nuevo
];
```

### Agregar un Nuevo Endpoint

1. Agrégalo en `src/routes/index.ts`:
```typescript
if (req.method === 'POST' && pathname === '/mi-endpoint') {
  return handleMiEndpoint(req);
}
```

2. Crea el controlador en `src/controllers/`:
```typescript
export async function handleMiEndpoint(req: Request) {
  // Lógica
}
```

## 🎉 ¡Listo!

El proyecto está completamente reestructurado y listo para usar.

**Estructura anterior:** Código monolítico de 1533 líneas  
**Estructura nueva:** 13 módulos organizados profesionalmente

### Beneficios:
- ✅ Código más mantenible
- ✅ Fácil de extender
- ✅ Mejor organización
- ✅ Documentación completa
- ✅ Listo para producción

---

**¿Necesitas ayuda?** Consulta README.md para documentación detallada.
