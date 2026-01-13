# Estructura del Proyecto - Guía de Arquitectura

## 📁 Organización de Archivos

### Backend (`src/`)

```
src/
├── index.ts                    # Punto de entrada principal del servidor
├── types.ts                    # Definiciones de tipos TypeScript compartidos
├── config/
│   └── index.ts               # Configuración centralizada (puerto, límites, modelos)
├── controllers/
│   ├── chatController.ts      # Lógica de negocio para chat
│   └── fileController.ts      # Lógica de procesamiento de archivos
├── routes/
│   └── index.ts               # Definición y enrutamiento de endpoints
├── services/
│   ├── groq.ts                # Integración con Groq API
│   ├── cerebras.ts            # Integración con Cerebras API
│   ├── gemini.ts              # Integración con Google Gemini API
│   └── ollama.ts              # Integración opcional con Ollama
└── utils/
    └── serviceManager.ts      # Gestión de servicios y failover
```

### Frontend (`public/`)

```
public/
├── index.html                  # HTML limpio y semántico
├── css/
│   └── styles.css             # Todos los estilos de la aplicación
└── js/
    ├── main.js                # Punto de entrada y inicialización
    ├── chatManager.js         # Gestión del chat y mensajes
    ├── fileHandler.js         # Manejo de drag & drop y uploads
    └── markdownRenderer.js    # Renderizado de markdown a HTML
```

## 🔄 Flujo de Datos

### Backend

```
Request → routes/index.ts → controller → service → AI API
                                ↓
                          Response (SSE)
```

**Detalle:**
1. **routes/index.ts**: Identifica el endpoint y valida la petición
2. **controller**: Procesa la lógica de negocio
3. **serviceManager**: Selecciona el servicio IA disponible
4. **service**: Se comunica con la API externa
5. **Response**: Retorna datos via Server-Sent Events (streaming)

### Frontend

```
User Action → Event Handler → Manager → API Call → Update UI
```

**Detalle:**
1. **main.js**: Inicializa la aplicación y vincula eventos
2. **chatManager.js**: Gestiona el estado del chat
3. **fileHandler.js**: Procesa archivos adjuntos
4. **markdownRenderer.js**: Renderiza respuestas
5. **UI Update**: Actualiza el DOM dinámicamente

## 📦 Módulos Principales

### Backend

#### `src/index.ts`
- Inicializa el servidor Bun
- Carga configuración
- Registra rutas
- Muestra información de inicio

#### `src/config/index.ts`
- Configuración centralizada
- Variables de entorno
- Límites y restricciones
- Configuración de servicios IA

#### `src/routes/index.ts`
- Mapeo de rutas HTTP
- Servir archivos estáticos
- Endpoints de API

#### `src/controllers/chatController.ts`
- Maneja peticiones de chat
- Implementa failover entre servicios
- Gestiona streaming de respuestas

#### `src/controllers/fileController.ts`
- Valida archivos subidos
- Procesa diferentes tipos de archivos
- Limita tamaño y contenido

#### `src/utils/serviceManager.ts`
- Rotación round-robin de servicios
- Lista de servicios disponibles
- Estado de servicios

### Frontend

#### `public/js/main.js`
- Inicialización de la aplicación
- Creación de instancias
- Vinculación de eventos globales

#### `public/js/chatManager.js`
**Responsabilidades:**
- Envío y recepción de mensajes
- Gestión del historial
- Control de estado (waiting, typing)
- Renderizado de mensajes
- Scroll automático

**Métodos principales:**
- `sendMessage()`: Envía mensaje a la IA
- `streamResponse()`: Recibe y renderiza streaming
- `regenerateLastResponse()`: Regenera última respuesta
- `clearChat()`: Limpia conversación

#### `public/js/fileHandler.js`
**Responsabilidades:**
- Drag & drop de archivos
- Validación de archivos
- Upload al servidor
- Preview de archivos
- Gestión de estado de archivos

**Métodos principales:**
- `handleFileSelect()`: Procesa archivo seleccionado
- `removeFile()`: Elimina archivo adjunto
- `getFileData()`: Retorna datos del archivo

#### `public/js/markdownRenderer.js`
**Responsabilidades:**
- Conversión de Markdown a HTML
- Renderizado de tablas
- Renderizado de listas
- Renderizado de código
- Renderizado de enlaces

**Método principal:**
- `render()`: Convierte markdown a HTML

## 🔐 Separación de Responsabilidades

### Backend

| Capa | Responsabilidad |
|------|----------------|
| **Routes** | Routing y validación de requests |
| **Controllers** | Lógica de negocio |
| **Services** | Integración con APIs externas |
| **Utils** | Funciones auxiliares reutilizables |
| **Config** | Configuración centralizada |

### Frontend

| Módulo | Responsabilidad |
|--------|----------------|
| **main.js** | Bootstrapping y setup inicial |
| **chatManager.js** | Estado y lógica del chat |
| **fileHandler.js** | Manejo de archivos |
| **markdownRenderer.js** | Presentación y formato |

## 🎯 Principios de Diseño

### DRY (Don't Repeat Yourself)
- Código reutilizable en utils/
- Configuración centralizada
- Módulos ES6 compartibles

### Single Responsibility
- Cada módulo tiene una responsabilidad clara
- Controladores separados por dominio
- Servicios independientes por proveedor IA

### Separation of Concerns
- Backend separado del frontend
- CSS separado del HTML
- JavaScript modular

### Scalability
- Fácil agregar nuevos servicios IA
- Fácil agregar nuevos endpoints
- Configuración flexible

## 🚀 Ventajas de esta Estructura

### ✅ Mantenibilidad
- Código organizado y fácil de encontrar
- Módulos pequeños y manejables
- Responsabilidades claras

### ✅ Testability
- Módulos independientes
- Fácil mockear dependencias
- Lógica aislada

### ✅ Escalabilidad
- Agregar features sin romper código existente
- Fácil agregar nuevos servicios
- Configuración centralizada

### ✅ Developer Experience
- Estructura intuitiva
- TypeScript para type safety
- Código autodocumentado

## 📝 Convenciones

### Nombres de Archivos
- **Backend**: camelCase para archivos TypeScript
- **Frontend**: camelCase para archivos JavaScript
- **Configuración**: lowercase para archivos de config

### Imports
- Usar imports relativos en el mismo módulo
- Usar imports absolutos desde src/
- Agrupar imports por tipo (librerías, tipos, locales)

### Comentarios
- JSDoc para funciones públicas
- Comentarios inline para lógica compleja
- TODO para tareas pendientes

## 🔄 Flujo de Trabajo Recomendado

1. **Nuevas Features Backend**:
   - Definir tipos en `types.ts`
   - Crear controller si es necesario
   - Agregar ruta en `routes/index.ts`
   - Actualizar config si es necesario

2. **Nuevas Features Frontend**:
   - Agregar lógica en el manager correspondiente
   - Actualizar estilos en `styles.css`
   - Agregar HTML si es necesario

3. **Nuevos Servicios IA**:
   - Crear archivo en `services/`
   - Implementar interface `AIService`
   - Agregar a `serviceManager.ts`
   - Actualizar config

## 📚 Recursos Adicionales

- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
