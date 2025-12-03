# 🌐 Guía de Chrome DevTools MCP

## 📌 Descripción

El **Chrome DevTools MCP** (Model Context Protocol) permite a Claude Code interactuar directamente con el navegador Chrome para desarrollo visual y testing automatizado.

## ✨ Beneficios

- ✅ Ver capturas de pantalla sin cambiar de ventana
- ✅ Detectar errores visuales automáticamente
- ✅ Comparar diseños vs implementación
- ✅ Iterar rápidamente en UI
- ✅ Debug de errores de consola
- ✅ Analizar requests de red (API calls)

## 🔧 Configuración

### 1. Archivo `.mcp.json`

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"],
      "env": {
        "CHROME_DEBUG_PORT": "9222"
      }
    }
  }
}
```

### 2. Lanzar Chrome en Modo Debug

**Windows**:
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

**Mac**:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

**Linux**:
```bash
google-chrome --remote-debugging-port=9222
```

### 3. Activar en Claude Code

1. Guarda `.mcp.json` en la raíz del proyecto
2. Lanza Chrome en modo debug
3. Reinicia Claude Code
4. El MCP aparecerá automáticamente

## 📖 Comandos Disponibles

### 1. `list_pages` - Listar Páginas Abiertas

Ver todas las pestañas abiertas en Chrome:

```
Claude: Usando Chrome DevTools MCP, lista las páginas abiertas
```

**Respuesta típica**:
```
[0] Sistema de Gestión - Login (http://localhost:4855/login)
[1] Google (https://google.com)
```

### 2. `select_page` - Seleccionar Página

Cambiar a una pestaña específica:

```
Claude: Usando Chrome DevTools MCP, selecciona la página 0
```

### 3. `take_screenshot` - Captura de Pantalla

Tomar una captura de la página actual:

```
Claude: Usando Chrome DevTools MCP, toma una captura de pantalla
```

**Opciones**:
- `fullPage: true` - Captura toda la página (incluyendo scroll)
- `fullPage: false` - Solo el viewport visible

### 4. `take_snapshot` - Estado del DOM

Obtener el árbol de accesibilidad (más rápido que screenshot):

```
Claude: Usando Chrome DevTools MCP, toma un snapshot
```

**Útil para**:
- Ver estructura de la página
- Identificar elementos por `uid`
- Debug de accesibilidad

### 5. `navigate_page` - Navegar

Ir a una URL o navegar en el historial:

```
Claude: Usando Chrome DevTools MCP, navega a http://localhost:4855/login
```

**Opciones**:
- `type: "url"` - Ir a una URL
- `type: "back"` - Atrás en historial
- `type: "forward"` - Adelante en historial
- `type: "reload"` - Recargar página

### 6. `click` - Click en Elemento

Hacer click en un elemento (requiere `uid` del snapshot):

```
Claude: Haz click en el botón con uid "abc123"
```

### 7. `fill` - Llenar Input

Llenar un input de texto:

```
Claude: Llena el input de email con "test@ejemplo.com"
```

### 8. `list_console_messages` - Errores de Consola

Ver mensajes de la consola:

```
Claude: Usando Chrome DevTools MCP, muestra los errores de consola
```

**Tipos de mensajes**:
- `error` - Errores
- `warn` - Warnings
- `log` - Logs normales
- `info` - Información

### 9. `list_network_requests` - Requests de Red

Ver todas las llamadas HTTP:

```
Claude: Usando Chrome DevTools MCP, muestra los network requests
```

**Útil para**:
- Debug de API calls
- Ver respuestas de servidor
- Identificar requests lentos
- Ver errores 404, 500, etc.

### 10. `resize_page` - Redimensionar

Probar responsive design:

```
Claude: Redimensiona la página a 375x667 (iPhone SE)
```

**Tamaños comunes**:
- Mobile: 375x667, 414x896
- Tablet: 768x1024, 1024x768
- Desktop: 1920x1080, 1366x768

## 💡 Casos de Uso Comunes

### Desarrollo Visual

**Escenario**: Implementar un diseño desde mockup

```
1. Claude: "Toma un screenshot del login"
2. [Usuario muestra mockup]
3. Claude: "Compara el screenshot con el diseño"
4. Claude: "El botón debe ser más redondeado, actualizo el código"
5. [Claude edita el código]
6. Claude: "Toma otro screenshot para verificar"
```

### Debug de Errores

**Escenario**: Usuario reporta error en producción

```
1. Claude: "Navega a /dashboard"
2. Claude: "Muestra los errores de consola"
3. Claude: "Identifica: 'Cannot read property of undefined'"
4. Claude: "Reviso el código y corrijo"
```

### Testing Responsive

**Escenario**: Verificar mobile design

```
1. Claude: "Redimensiona a 375x667 (iPhone SE)"
2. Claude: "Toma screenshot"
3. Claude: "Redimensiona a 1920x1080 (Desktop)"
4. Claude: "Toma screenshot"
5. Claude: "Compara ambos diseños"
```

### Bucle Agéntico Visual

**Escenario**: Iterar hasta pixel-perfect

```
while (no pixel-perfect):
    1. Claude: "Toma screenshot"
    2. Claude: "Compara con diseño objetivo"
    3. Claude: "Identifica diferencias"
    4. Claude: "Actualiza código CSS"
    5. Claude: "Espera compilación"
```

## 🎨 Flujo de Trabajo Recomendado

### 1. Desarrollo de Nueva Feature

```
1. Tomar snapshot inicial
2. Identificar elementos clave (uid)
3. Implementar código
4. Tomar screenshot
5. Comparar con mockup
6. Iterar hasta correcto
```

### 2. Fix de Bug Visual

```
1. Reproducir el bug (navegar, click, etc.)
2. Tomar screenshot del bug
3. Ver errores de consola
4. Corregir código
5. Verificar fix con screenshot
```

### 3. Testing E2E Visual

```
1. Navegar a página inicial
2. Llenar formulario (fill inputs)
3. Click en botón submit
4. Verificar navegación correcta
5. Tomar screenshot de resultado
```

## ⚠️ Limitaciones

### Chrome debe estar en modo debug

**Síntoma**: MCP no se conecta

**Solución**: Lanza Chrome con `--remote-debugging-port=9222`

### Solo funciona con Chrome

**No compatible con**:
- Firefox
- Safari
- Edge (aunque está basado en Chromium)

**Solución**: Usa Chrome para desarrollo

### Interacciones requieren uid

**Problema**: No puedes hacer click sin el uid del elemento

**Solución**:
1. Primero toma un snapshot
2. Identifica el uid del elemento
3. Luego haz click usando ese uid

## 🔍 Troubleshooting

### Error: "Cannot connect to Chrome"

**Causa**: Chrome no está en modo debug

**Solución**:
1. Cierra todas las ventanas de Chrome
2. Lanza Chrome con `--remote-debugging-port=9222`
3. Abre tu app en esa ventana de Chrome
4. Prueba el MCP de nuevo

### Screenshot aparece en blanco

**Causa**: Página no terminó de cargar

**Solución**:
```
Claude: Navega a la URL
Claude: Espera 3 segundos
Claude: Toma screenshot
```

### No veo mis cambios en el screenshot

**Causa**: Next.js no compiló los cambios

**Solución**:
1. Espera a que Next.js termine de compilar (ver terminal)
2. Recarga la página en Chrome
3. Toma el screenshot

### Snapshot muy largo

**Causa**: Página compleja con muchos elementos

**Solución**:
- Usa `verbose: false` para snapshot más corto
- O toma screenshot en lugar de snapshot

## 🎯 Best Practices

1. **Siempre usa Chrome en modo debug** para desarrollo con MCP
2. **Toma snapshots antes de screenshots** (más rápido para identificar elementos)
3. **Verifica consola después de cada cambio** (detecta errores temprano)
4. **Usa network tab para debug de API** (ver qué datos se envían/reciben)
5. **Prueba en múltiples tamaños** (mobile, tablet, desktop)

## 📚 Referencias

- [Chrome DevTools MCP GitHub](https://github.com/anthropics/chrome-devtools-mcp)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Model Context Protocol](https://modelcontextprotocol.io)

---

**Última actualización**: 3 de diciembre, 2025
