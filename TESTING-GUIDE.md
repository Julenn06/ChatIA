# 🧪 Guía de Pruebas de Rendimiento

## ✅ Build Completado

```
✅ CSS minificado: 15.59 KB → 10.93 KB (30% reducción)
✅ JavaScript bundled: 44.72 KB → 13.50 KB (70% reducción)
✅ Reducción total: 45.38%
```

---

## 📋 Cómo Verificar las Optimizaciones

### 1️⃣ **Verificar Compresión Gzip**

#### Opción A: Chrome DevTools
1. Abre http://localhost:3000
2. Presiona **F12** (DevTools)
3. Ve a la pestaña **Network**
4. Recarga la página (**Ctrl+R**)
5. Haz clic en cualquier archivo (styles.css o main.js)
6. En la pestaña **Headers**, busca:
   ```
   Response Headers:
   content-encoding: gzip
   ```

#### Opción B: PowerShell/curl
```powershell
# Verificar compresión en CSS
curl.exe -I -H "Accept-Encoding: gzip" http://localhost:3000/css/styles.css

# Debe mostrar:
# content-encoding: gzip
```

---

### 2️⃣ **Verificar Caché HTTP**

#### En Chrome DevTools (pestaña Network)
1. Recarga la página
2. Haz clic en `styles.css` o `main.js`
3. En **Headers** → **Response Headers**, busca:
   ```
   cache-control: public, max-age=31536000, immutable
   ```
4. Recarga de nuevo (**Ctrl+R**)
5. Los archivos CSS/JS deben mostrar:
   ```
   (disk cache)  o  (memory cache)
   ```

#### En PowerShell
```powershell
curl.exe -I http://localhost:3000/css/styles.css

# Debe mostrar:
# cache-control: public, max-age=31536000, immutable
```

---

### 3️⃣ **Comparar Tamaños de Transferencia**

#### En Chrome DevTools (Network tab)
1. Asegúrate de tener la columna **Size** visible
2. Verás DOS valores:
   - **Size**: Tamaño real del archivo
   - **Transferred**: Tamaño comprimido transferido

**Ejemplo esperado:**
```
styles.css:
  Size: 10.9 KB  (archivo minificado)
  Transferred: 3.2 KB  (con gzip ~70% reducción)

main.js:
  Size: 13.5 KB  (archivo bundled)
  Transferred: 4.1 KB  (con gzip ~70% reducción)
```

---

### 4️⃣ **Probar Lighthouse (Score de Performance)**

1. En Chrome DevTools
2. Ve a la pestaña **Lighthouse**
3. Selecciona:
   - ✅ Performance
   - ✅ Desktop (o Mobile)
4. Haz clic en **Analyze page load**
5. Espera el reporte

**Esperado:**
- Performance Score: 90-100
- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2s
- Total Blocking Time: < 300ms

---

### 5️⃣ **Verificar Que Usa Archivos de dist/**

#### Opción A: Ver en Network tab
Los archivos deben servirse desde `/dist`:
```
http://localhost:3000/css/styles.css  → dist/css/styles.css
http://localhost:3000/js/main.js      → dist/js/main.js
```

#### Opción B: Logs del servidor
El servidor debe mostrar:
```
📁 Serving files from: ./public
```
(Aunque en producción debería servir de ./dist - ver nota abajo)

---

### 6️⃣ **Probar Segunda Carga (Caché)**

1. Recarga la página (**Ctrl+R**)
2. En Network tab, filtra por "CSS" o "JS"
3. Los archivos deben mostrar:
   ```
   Status: 200
   Size: (disk cache)  o  (memory cache)
   Time: 0 ms
   ```
4. **Transferred** debe ser "0 B" (cargado desde caché)

---

## 🐛 Si algo no funciona

### Compresión no activa
**Problema**: No ves `content-encoding: gzip`
**Solución**: 
- Verifica que el servidor esté corriendo
- Asegúrate de enviar header: `Accept-Encoding: gzip`
- Verifica que el archivo sea > 1KB

### Caché no funciona
**Problema**: No ves `(disk cache)` en recargas
**Solución**:
- Usa **Ctrl+R** (NO Ctrl+Shift+R que limpia caché)
- Verifica que headers contengan `cache-control`
- Cierra y reabre DevTools

### Archivos no minificados
**Problema**: Los archivos siguen siendo grandes
**Solución**:
- Ejecuta `bun run build` de nuevo
- Verifica que carpeta `dist/` exista
- Verifica `NODE_ENV=production`

---

## 📊 Métricas Esperadas

### Carga Inicial (Primera vez)
```
HTML (index.html):    ~4.6 KB  → ~1.5 KB (gzip)
CSS (styles.css):    ~10.9 KB  → ~3.2 KB (gzip)
JS (main.js):        ~13.5 KB  → ~4.1 KB (gzip)
---
TOTAL transferido: ~8.8 KB
Requests: 3
```

### Carga Subsecuente (Con caché)
```
HTML (index.html):    ~1.5 KB (gzip, sin caché)
CSS (styles.css):     0 KB (caché)
JS (main.js):         0 KB (caché)
---
TOTAL transferido: ~1.5 KB
Requests: 1 (solo HTML)
```

**Reducción**: ~83% menos datos transferidos

---

## 🎯 Comandos Útiles

```powershell
# Comparar tamaños original vs optimizado
Get-ChildItem .\public\css\*.css, .\public\js\*.js | Measure-Object -Property Length -Sum
Get-ChildItem .\dist\css\*.css, .\dist\js\*.js | Measure-Object -Property Length -Sum

# Ver contenido de dist/
Get-ChildItem -Path .\dist -Recurse -File

# Rebuild si haces cambios
bun run build

# Desarrollo (sin optimizaciones)
bun run dev

# Producción (con optimizaciones)
$env:NODE_ENV="production"; bun run prod
```

---

## ✅ Checklist de Verificación

- [ ] Build ejecutado sin errores
- [ ] Servidor corriendo en modo producción
- [ ] Archivos en `dist/` creados correctamente
- [ ] Compresión gzip activa (header `content-encoding: gzip`)
- [ ] Caché HTTP configurado (header `cache-control: max-age=31536000`)
- [ ] Tamaño transferido reducido (~70% con gzip)
- [ ] Segunda carga usa caché (0 B transferred)
- [ ] Lighthouse score > 90
- [ ] Chat funcionando normalmente

---

**Última actualización**: Enero 13, 2026  
**Estado del servidor**: ✅ Corriendo en http://localhost:3000
