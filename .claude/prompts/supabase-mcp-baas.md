# Supabase MCP - Backend as a Service

Esta fábrica usa **Supabase** como BaaS (Backend as a Service). El MCP de Supabase permite interactuar directamente con la base de datos sin usar CLI ni aplicar migraciones manualmente.

---

## El 20% que Produce el 80%

### Los 5 Comandos Esenciales

| Comando | Uso |
|---------|-----|
| `execute_sql` | Queries SELECT, INSERT, UPDATE, DELETE |
| `apply_migration` | DDL (CREATE TABLE, ALTER, índices, RLS) |
| `list_tables` | Ver estructura actual de BD |
| `search_docs` | Buscar en docs oficiales (GraphQL) |
| `get_logs` | Debug de auth, postgres, edge-functions |

---

## Patrones de Uso

### Explorar Base de Datos

```sql
-- Primero ver qué tablas existen
list_tables

-- Luego explorar datos
execute_sql("SELECT * FROM users LIMIT 5")
execute_sql("SELECT * FROM products WHERE active = true")
```

### Crear/Modificar Esquema

```sql
-- SIEMPRE usar apply_migration para DDL
apply_migration(
  name: "add_users_table",
  query: "CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  )"
)

-- Agregar columnas
apply_migration(
  name: "add_avatar_to_users",
  query: "ALTER TABLE users ADD COLUMN avatar_url TEXT"
)

-- Crear índices
apply_migration(
  name: "idx_users_email",
  query: "CREATE INDEX idx_users_email ON users(email)"
)
```

### Operaciones CRUD

```sql
-- INSERT
execute_sql("INSERT INTO users (email) VALUES ('user@example.com') RETURNING *")

-- UPDATE
execute_sql("UPDATE users SET avatar_url = 'https://...' WHERE id = 'uuid'")

-- DELETE
execute_sql("DELETE FROM users WHERE id = 'uuid'")

-- SELECT con joins
execute_sql("
  SELECT u.*, p.name as product_name
  FROM users u
  JOIN purchases p ON p.user_id = u.id
  WHERE u.id = 'uuid'
")
```

### Debug de Problemas

```sql
-- Logs de autenticación
get_logs(service: "auth")

-- Logs de base de datos
get_logs(service: "postgres")

-- Logs de edge functions
get_logs(service: "edge-function")
```

### Buscar en Documentación

```sql
-- Cuando no sepas la sintaxis
search_docs("how to enable RLS")
search_docs("supabase auth email login")
search_docs("storage bucket policies")
```

---

## Row Level Security (RLS)

### Habilitar RLS en Tabla

```sql
apply_migration(
  name: "enable_rls_users",
  query: "ALTER TABLE users ENABLE ROW LEVEL SECURITY"
)
```

### Crear Políticas

```sql
-- Usuarios pueden leer sus propios datos
apply_migration(
  name: "users_select_own",
  query: "CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id)"
)

-- Usuarios pueden actualizar sus propios datos
apply_migration(
  name: "users_update_own",
  query: "CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id)"
)

-- Service role puede hacer todo (para admin)
apply_migration(
  name: "users_service_role",
  query: "CREATE POLICY users_service_role ON users
    FOR ALL USING (auth.role() = 'service_role')"
)
```

### Verificar Seguridad

```sql
-- Después de crear tablas, SIEMPRE verificar seguridad
get_advisors(type: "security")
```

---

## Consejos Profesionales

### 1. execute_sql para Datos, apply_migration para Estructura

```sql
-- ❌ MAL: DDL con execute_sql
execute_sql("CREATE TABLE...")

-- ✅ BIEN: DDL con apply_migration
apply_migration(name: "create_table", query: "CREATE TABLE...")

-- ✅ BIEN: DML con execute_sql
execute_sql("SELECT * FROM...")
```

### 2. Siempre Verificar RLS

```sql
-- Después de crear cualquier tabla
get_advisors(type: "security")

-- Si falta RLS, mostrará qué tablas están expuestas
```

### 3. Usar search_docs Antes de Suponer

```sql
-- ❌ MAL: Suponer sintaxis
execute_sql("SELECT auth.user()...")  -- ¿Es auth.user() o auth.uid()?

-- ✅ BIEN: Buscar primero
search_docs("supabase auth current user")
```

### 4. Nombres Descriptivos en Migraciones

```sql
-- ❌ MAL
apply_migration(name: "migration1", ...)

-- ✅ BIEN
apply_migration(name: "add_stripe_customer_id_to_users", ...)
```

---

## Flujo de Trabajo Recomendado

```
1. list_tables          → Ver estado actual
2. apply_migration      → Crear/modificar estructura
3. get_advisors         → Verificar seguridad
4. execute_sql          → Insertar datos de prueba
5. get_logs             → Debug si hay problemas
```

---

## Evitar

- **NO** uses execute_sql para DDL (CREATE, ALTER, DROP)
- **NO** supongas sintaxis → usa search_docs primero
- **NO** olvides RLS en tablas con datos de usuarios
- **NO** hagas queries directamente desde el frontend sin RLS

---

## Configuración del MCP

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=${SUPABASE_PROJECT_REF}"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

### Variables de Entorno Necesarias

```bash
SUPABASE_PROJECT_REF=tu-project-ref      # De la URL del dashboard
SUPABASE_ACCESS_TOKEN=sbp_...            # De Configuración de Cuenta > Tokens de Acceso
```

---

## Recursos

- [Supabase MCP Docs](https://github.com/supabase/supabase-mcp)
- [Supabase SQL Reference](https://supabase.com/docs/guides/database)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
