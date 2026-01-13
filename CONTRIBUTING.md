# 🤝 Contributing Guide

Guía para contribuir al proyecto AI Chat Platform.

## 📁 Estructura del Proyecto

```
bun-ai-api-main/
├── docs/                        # 📚 Documentación
├── src/
│   ├── config/                  # ⚙️ Configuración
│   ├── constants/               # 📊 Constantes del sistema
│   ├── controllers/             # 🎮 Controladores de lógica de negocio
│   ├── middlewares/             # 🔀 Middlewares (preparado para futuro)
│   ├── routes/                  # 🛣️ Definición de rutas
│   ├── services/                # 🤖 Integraciones con servicios IA
│   ├── types/                   # 📝 Definiciones de tipos TypeScript
│   ├── utils/                   # 🔧 Utilidades
│   └── index.ts                 # 🚀 Entry point
├── public/                      # 🎨 Frontend
│   ├── css/                     # Estilos
│   └── js/                      # JavaScript modular
└── tests/                       # 🧪 Tests (preparado para futuro)
```

## 🔧 Agregar Nuevo Servicio de IA

### 1. Crear el servicio en `src/services/`

```typescript
// src/services/mi-servicio.ts
import type { AIService, ChatMessage } from '../types';

const client = new MiServicioClient({
  apiKey: process.env.MI_SERVICIO_API_KEY
});

export const miServicioService: AIService = {
  name: 'Mi Servicio',
  async chat(messages: ChatMessage[]) {
    const stream = await client.chat.create({
      messages,
      model: 'modelo-x',
      stream: true
    });
    
    return (async function* () {
      for await (const chunk of stream) {
        yield chunk.content || '';
      }
    })();
  }
};
```

### 2. Agregar configuración en `src/config/index.ts`

```typescript
miServicio: {
  enabled: !!process.env.MI_SERVICIO_API_KEY,
  model: 'modelo-x',
  temperature: 0.7,
  maxTokens: 4096,
}
```

### 3. Registrar en `src/utils/serviceManager.ts`

```typescript
import { miServicioService } from '../services/mi-servicio';

const services: AIService[] = [
  groqService,
  cerebrasService,
  geminiService,
  miServicioService, // ← Agregar aquí
].filter(service => service !== null);
```

### 4. Agregar variable de entorno en `.env.example`

```env
MI_SERVICIO_API_KEY=your_api_key_here
```

## 📝 Convenciones de Código

### TypeScript

- Usar `interface` para objetos que pueden extenderse
- Usar `type` para uniones y tipos complejos
- Exportar tipos desde `src/types/` organizados por dominio
- Usar `const assertions` para constantes inmutables

### Imports

```typescript
// ✅ Correcto - Import desde barrel files
import { ChatMessage, AIService } from '../types';
import { LIMITS, ALLOWED_FILE_TYPES } from '../constants';

// ❌ Incorrecto - Import directo
import { ChatMessage } from '../types/chat.types';
```

### Constantes

- Todas las constantes deben estar en `src/constants/`
- Usar `UPPER_SNAKE_CASE` para constantes
- Exportar desde `index.ts` para barrel imports
- Usar `as const` para inmutabilidad

```typescript
export const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
} as const;
```

## 🧪 Testing (Preparado para implementación)

```bash
# Ejecutar tests
bun test

# Watch mode
bun test --watch

# Coverage
bun test --coverage
```

Estructura de tests:

```
tests/
├── unit/              # Tests unitarios
│   ├── services/
│   ├── utils/
│   └── controllers/
└── integration/       # Tests de integración
```

## 🎨 Frontend

### Módulos JavaScript

Cada módulo debe:
- Exportar una clase o funciones
- Tener responsabilidad única
- Documentar métodos públicos

```javascript
/**
 * ChatManager - Gestión del chat
 */
export class ChatManager {
  /**
   * Envía un mensaje al servidor
   */
  async sendMessage() {
    // ...
  }
}
```

### Optimización

- Usar `debounce` para eventos frecuentes (scroll, resize, input)
- Usar `throttle` para limitar ejecuciones
- Usar `requestAnimationFrame` para actualizaciones del DOM
- Implementar caché para renderizados pesados

## 🚀 Performance

### Backend

- Streaming para respuestas grandes
- Failover automático entre servicios
- Validación temprana de datos
- Límites de tamaño de archivos

### Frontend

- Módulos ES6 para tree-shaking
- Caché de renderizados markdown
- Throttling de actualizaciones del DOM
- Lazy loading de recursos

## 📚 Documentación

Al agregar features:

1. Actualizar [README.md](../README.md) si cambia instalación/uso
2. Actualizar [docs/ARCHITECTURE.md](./ARCHITECTURE.md) si cambia arquitectura
3. Comentar código complejo con JSDoc/TSDoc
4. Agregar ejemplos de uso

## ✅ Checklist antes de Commit

- [ ] El código compila sin errores (`bun run dev`)
- [ ] Seguiste las convenciones de código
- [ ] Actualizaste la documentación si es necesario
- [ ] Agregaste comentarios para lógica compleja
- [ ] Probaste manualmente la funcionalidad
- [ ] Las constantes están en `src/constants/`
- [ ] Los tipos están en `src/types/`
- [ ] Los imports usan barrel files

## 🐛 Reportar Bugs

Incluye:

1. Descripción del problema
2. Pasos para reproducir
3. Comportamiento esperado vs actual
4. Variables de entorno (sin API keys)
5. Logs de error

## 💡 Sugerir Features

Describe:

1. El problema que resuelve
2. Solución propuesta
3. Alternativas consideradas
4. Impacto en la arquitectura actual
