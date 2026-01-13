# 📁 Project Structure - Visual Guide

Última actualización: Enero 2026

## 🗂️ Estructura Completa del Proyecto

```
bun-ai-api-main/
│
├── 📚 docs/                              # Documentación técnica
│   ├── README.md                         # Índice de documentación
│   ├── ARCHITECTURE.md                   # Arquitectura y flujos de datos
│   ├── QUICKSTART.md                     # Guía de inicio rápido
│   └── SUMMARY.md                        # Resumen de cambios
│
├── 🔧 src/                               # Código fuente backend (TypeScript)
│   │
│   ├── ⚙️ config/                         # Configuración
│   │   └── index.ts                      # Config centralizada (puerto, límites, servicios)
│   │
│   ├── 📊 constants/                      # Constantes del sistema
│   │   ├── index.ts                      # Barrel export
│   │   ├── file-types.ts                 # Tipos de archivo permitidos
│   │   └── limits.ts                     # Límites del sistema (MAX_FILE_SIZE, etc)
│   │
│   ├── 🎮 controllers/                    # Controladores (lógica de negocio)
│   │   ├── chatController.ts             # Lógica de chat + failover + SSE
│   │   └── fileController.ts             # Procesamiento de archivos
│   │
│   ├── 🔀 middlewares/                    # Middlewares (preparado para futuro)
│   │   └── README.md                     # Guía para implementar middlewares
│   │
│   ├── 🛣️ routes/                        # Definición de rutas HTTP
│   │   └── index.ts                      # Rutas: /, /chat, /upload, /css/*, /js/*
│   │
│   ├── 🤖 services/                       # Integraciones con servicios IA
│   │   ├── groq.ts                       # Servicio Groq (moonshotai/kimi-k2)
│   │   ├── cerebras.ts                   # Servicio Cerebras (zai-glm-4.6)
│   │   ├── gemini.ts                     # Servicio Google Gemini (gemini-1.5-pro)
│   │   └── ollama.ts                     # Servicio Ollama local (opcional)
│   │
│   ├── 📝 types/                          # Definiciones de tipos TypeScript
│   │   ├── index.ts                      # Barrel export
│   │   ├── chat.types.ts                 # ChatMessage, ChatRequest, etc.
│   │   └── service.types.ts              # AIService, ServiceConfig
│   │
│   ├── 🔧 utils/                          # Utilidades
│   │   └── serviceManager.ts             # Gestión round-robin de servicios
│   │
│   └── 🚀 index.ts                        # Entry point del servidor
│
├── 🎨 public/                            # Frontend (Vanilla JS + CSS)
│   │
│   ├── index.html                        # HTML principal (limpio, 120 líneas)
│   │
│   ├── css/
│   │   └── styles.css                    # Estilos completos (795 líneas)
│   │                                     # • Variables CSS (tema oscuro)
│   │                                     # • Gradientes y animaciones
│   │                                     # • Responsive design
│   │                                     # • Markdown styling
│   │
│   └── js/                               # JavaScript modular (ES6)
│       ├── main.js                       # Entry point, inicialización
│       ├── chatManager.js                # Gestión del chat (407 líneas)
│       │                                 # • Envío/recepción mensajes
│       │                                 # • Streaming SSE
│       │                                 # • Regeneración respuestas
│       ├── fileHandler.js                # Manejo de archivos (125 líneas)
│       │                                 # • Drag & drop
│       │                                 # • Upload al servidor
│       │                                 # • Preview de archivos
│       ├── markdownRenderer.js           # Renderizado markdown (196 líneas)
│       │                                 # • Caché de renderizados
│       │                                 # • Tablas, listas, código
│       │                                 # • Links automáticos
│       └── performanceUtils.js           # Optimización rendimiento
│                                         # • debounce, throttle
│                                         # • RAF helpers
│                                         # • RenderCache
│
├── 🧪 tests/                             # Tests (preparado para implementación)
│   └── README.md                         # Guía para escribir tests
│
├── 📄 .env.example                       # Template de variables de entorno
├── 📄 .gitignore                         # Archivos ignorados por Git
├── 📄 CONTRIBUTING.md                    # Guía para contribuidores
├── 📄 README.md                          # Documentación principal
├── 📄 package.json                       # Dependencias y scripts
├── 📄 tsconfig.json                      # Configuración TypeScript
└── 📄 nixpacks.toml                      # Configuración para deployment
```

## 🎯 Responsabilidades por Carpeta

### Backend (`src/`)

| Carpeta | Propósito | Ejemplo |
|---------|-----------|---------|
| `config/` | Configuración centralizada | Puerto, límites, modelos IA |
| `constants/` | Constantes inmutables | `MAX_FILE_SIZE`, tipos de archivo |
| `controllers/` | Lógica de negocio | Procesar chat, validar archivos |
| `middlewares/` | Interceptores HTTP | CORS, auth (futuro) |
| `routes/` | Mapeo de endpoints | `POST /chat`, `GET /` |
| `services/` | Integraciones externas | Groq, Cerebras, Gemini APIs |
| `types/` | Tipos TypeScript | Interfaces, tipos compartidos |
| `utils/` | Funciones auxiliares | Service rotation, helpers |

### Frontend (`public/`)

| Carpeta | Propósito | Tecnología |
|---------|-----------|------------|
| `css/` | Estilos visuales | CSS moderno, variables, grid/flex |
| `js/` | Lógica frontend | Vanilla JS, ES6 modules |

## 🔄 Flujo de Archivos

### Chat Request Flow
```
Usuario → main.js → chatManager.js → POST /chat
                                        ↓
                    routes/index.ts → chatController.ts
                                        ↓
                    serviceManager.ts → groq/cerebras/gemini.ts
                                        ↓
                    SSE Stream → markdownRenderer.js → DOM
```

### File Upload Flow
```
Usuario → fileHandler.js → POST /upload
                              ↓
          routes/index.ts → fileController.ts
                              ↓
          Procesamiento → base64/text extraction
                              ↓
          JSON response → fileHandler.js → Preview
```

## 📊 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Archivos TypeScript** | 13 |
| **Archivos JavaScript** | 5 |
| **Líneas de código backend** | ~800 |
| **Líneas de código frontend** | ~1,500 |
| **Servicios IA integrados** | 3 (+1 opcional) |
| **Archivos de documentación** | 6 |
| **Nivel de modularidad** | ⭐⭐⭐⭐⭐ |

## 🎨 Principios de Arquitectura

✅ **Separación de Responsabilidades**: Cada archivo/módulo tiene un propósito único  
✅ **DRY (Don't Repeat Yourself)**: Constantes y tipos centralizados  
✅ **Escalabilidad**: Fácil agregar nuevos servicios IA  
✅ **Mantenibilidad**: Código organizado y documentado  
✅ **Performance**: Optimizaciones con throttle, cache, streaming  
✅ **Type Safety**: TypeScript en backend para prevenir errores  

## 🚀 Dónde Empezar

### Para entender el flujo completo:
1. Leer [README.md](../README.md)
2. Ver [src/index.ts](../src/index.ts) - Entry point
3. Seguir [src/routes/index.ts](../src/routes/index.ts) - Rutas
4. Revisar [src/controllers/chatController.ts](../src/controllers/chatController.ts) - Lógica principal

### Para agregar funcionalidad:
1. Leer [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Ver [docs/ARCHITECTURE.md](./ARCHITECTURE.md)
3. Seguir convenciones del código existente

### Para deployment:
1. Configurar `.env` según `.env.example`
2. Ejecutar `bun install`
3. Ejecutar `bun run start`
