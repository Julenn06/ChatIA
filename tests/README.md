# Tests

Esta carpeta está preparada para tests unitarios e integración.

## Estructura recomendada

```
tests/
├── unit/
│   ├── services/
│   │   ├── groq.test.ts
│   │   ├── cerebras.test.ts
│   │   └── gemini.test.ts
│   ├── utils/
│   │   └── serviceManager.test.ts
│   └── controllers/
│       ├── chatController.test.ts
│       └── fileController.test.ts
├── integration/
│   ├── chat-flow.test.ts
│   └── file-upload.test.ts
└── setup.ts
```

## Framework recomendado

- **Bun Test**: Built-in testing framework
- **Vitest**: Modern testing framework
- **Jest**: Popular testing framework

## Ejemplo básico con Bun Test

```typescript
import { describe, expect, test } from "bun:test";

describe("ServiceManager", () => {
  test("should rotate between services", () => {
    // Test implementation
  });
});
```

## Ejecutar tests

```bash
bun test
```
