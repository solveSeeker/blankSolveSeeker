# 🗄️ Guía de Supabase MCP

## 📌 Descripción

El **Supabase MCP** (Model Context Protocol) permite a Claude Code interactuar directamente con tu base de datos PostgreSQL en Supabase sin necesidad de usar el CLI o el dashboard web.

## ✨ Beneficios

- ✅ Ejecutar queries SQL directamente desde Claude
- ✅ Ver estructura de tablas sin salir del chat
- ✅ Aplicar migraciones automáticamente
- ✅ Debug más rápido con acceso a logs
- ✅ Obtener advisors de seguridad (RLS)

## 🔧 Configuración

### 1. Archivo `.mcp.json`

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "tu_access_token_aqui",
        "SUPABASE_PROJECT_ID": "tu_project_id_aqui"
      }
    }
  }
}
```

### 2. Obtener Credenciales

**Project ID**:
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Settings → General
3. Copia "Project ID" o "Reference ID"

**Access Token**:
1. Click en tu avatar (esquina superior derecha)
2. Account Settings → Access Tokens
3. Click "Generate new token"
4. Nombre: "MCP Token" o similar
5. Copia el token **(¡solo se muestra una vez!)**

### 3. Activar en Claude Code

1. Guarda `.mcp.json` en la raíz del proyecto
2. Reinicia Claude Code
3. El MCP aparecerá automáticamente en la barra lateral

## 📖 Comandos Disponibles

### 1. `list_tables` - Listar Tablas

Ver todas las tablas en un schema:

```
Claude: Usando Supabase MCP, lista las tablas del schema public
```

**Respuesta típica**:
- `tenants`
- `user_profiles`
- `roles`
- `user_roles`
- `companies`
- `user_company_access`

### 2. `execute_sql` - Ejecutar SQL

Ejecutar cualquier query SQL (SELECT, INSERT, UPDATE, DELETE):

```
Claude: Usando Supabase MCP, ejecuta:
SELECT * FROM tenants WHERE slug = 'demo';
```

**Ejemplo de respuesta**:
```json
{
  "id": "uuid-aqui",
  "name": "Demo Tenant",
  "slug": "demo",
  "created_at": "2025-12-02T..."
}
```

### 3. `apply_migration` - Aplicar Migración

Crear y ejecutar una migración SQL:

```
Claude: Usando Supabase MCP, aplica una migración llamada "create_companies" con el siguiente SQL:
[tu código SQL aquí]
```

### 4. `get_logs` - Ver Logs

Ver logs de diferentes servicios:

```
Claude: Usando Supabase MCP, muestra los logs de postgres
```

**Servicios disponibles**:
- `postgres` - Logs de base de datos
- `api` - Logs de API REST
- `auth` - Logs de autenticación
- `storage` - Logs de almacenamiento
- `realtime` - Logs de realtime

### 5. `get_advisors` - Advisors de Seguridad

Obtener recomendaciones de seguridad y performance:

```
Claude: Usando Supabase MCP, dame los advisors de seguridad
```

**Detecta**:
- Tablas sin Row Level Security (RLS)
- Índices faltantes
- Problemas de performance

### 6. `list_migrations` - Listar Migraciones

Ver historial de migraciones:

```
Claude: Usando Supabase MCP, lista las migraciones aplicadas
```

## 💡 Casos de Uso Comunes

### Desarrollo de Features

**Escenario**: Quieres agregar una nueva tabla

```
1. Claude: "Crea una migración para agregar la tabla products"
2. Claude: "Aplica la migración usando Supabase MCP"
3. Claude: "Verifica que la tabla existe listando las tablas"
```

### Debug de Datos

**Escenario**: Un usuario reporta un error

```
1. Claude: "Busca el usuario con email usuario@ejemplo.com"
2. Claude: "Muestra sus roles"
3. Claude: "Verifica sus permisos de empresa"
```

### Verificación de Seguridad

**Escenario**: Antes de deployment

```
1. Claude: "Dame los advisors de seguridad"
2. Claude: "Verifica que todas las tablas tengan RLS habilitado"
```

## ⚠️ Seguridad

### ⚡ IMPORTANTE

- ❌ **NUNCA** commitees el `.mcp.json` con el token real a GitHub
- ❌ **NUNCA** compartas tu access token públicamente
- ✅ **SIEMPRE** agrega `.mcp.json` al `.gitignore`
- ✅ **SIEMPRE** usa tokens con los permisos mínimos necesarios

### Buenas Prácticas

1. **Usa un token dedicado**: Crea un token específico para MCP
2. **Rótalo regularmente**: Regenera el token cada 3-6 meses
3. **Revoca si se compromete**: Si el token se filtra, revócalo inmediatamente

## 🔍 Troubleshooting

### Error: "Authentication failed"

**Causa**: Token inválido o expirado

**Solución**:
1. Ve a Supabase → Account → Access Tokens
2. Verifica que el token existe
3. Si está revocado, genera uno nuevo
4. Actualiza `.mcp.json`
5. Reinicia Claude Code

### Error: "Project not found"

**Causa**: Project ID incorrecto

**Solución**:
1. Ve a tu proyecto en Supabase
2. Settings → General
3. Copia el "Project ID" exacto
4. Actualiza `.mcp.json`
5. Reinicia Claude Code

### MCP no aparece en Claude Code

**Causa**: `.mcp.json` mal configurado o mal ubicado

**Solución**:
1. Verifica que `.mcp.json` está en la raíz del proyecto
2. Verifica el formato JSON (sin errores de sintaxis)
3. Verifica que `enableAllProjectMcpServers: true` está en `.claude/settings.local.json`
4. Reinicia Claude Code

### Queries lentas

**Causa**: Falta de índices o tablas grandes

**Solución**:
```
Claude: "Usando Supabase MCP, dame los advisors de performance"
```

## 📚 Referencias

- [Supabase MCP GitHub](https://github.com/supabase/mcp-server-supabase)
- [Documentación MCP](https://modelcontextprotocol.io)
- [Supabase Docs](https://supabase.com/docs)

---

**Última actualización**: 3 de diciembre, 2025
