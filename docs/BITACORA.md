# Bitácora del Proyecto - appSolveSeeker

## 2025-12-13 - Sistema de Usuarios y Autenticación

### ✅ Tarea Completada: Creación y Verificación de Usuario juan@ejemplo.com

**Objetivo:** Crear usuario juan@ejemplo.com desde la web app y verificar login exitoso.

**Resultado:** ✅ Completado 100% - Usuario creado y verificado con login exitoso.

---

### 🔧 Problemas Encontrados y Solucionados

#### 1. **BLOQUEADOR CRÍTICO: Recursión Infinita en RLS Policy**

**Problema:**
La política RLS de `user_roles` causaba recursión infinita porque consultaba la misma tabla dentro de su propia verificación:

```sql
-- ❌ POLÍTICA PROBLEMÁTICA (003_create_roles.sql:43-51)
CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur  -- ← Consulta user_roles dentro de política de user_roles
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
```

**Solución:**
Creada migración `006_fix_user_roles_rls_recursion.sql`:
```sql
-- Eliminar política recursiva
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;

-- Crear política para service_role (bypasa RLS)
CREATE POLICY "Service role can manage all user roles"
  ON user_roles FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
```

**Impacto:** Las operaciones de administración de roles ahora se realizan exclusivamente a través del `service_role` (API routes), evitando la recursión.

---

#### 2. **Usuario Admin sin Rol Asignado**

**Problema:**
El usuario admin `solve.seeker.dev@gmail.com` no tenía ningún rol en la tabla `user_roles`, lo que impedía operaciones administrativas.

**Solución:**
Inserción manual del rol admin:
```sql
INSERT INTO user_roles (user_id, role_id, key)
VALUES (
  '5258282b-9c19-4d39-8ac5-2c025e451213',  -- solve.seeker.dev@gmail.com
  '3b3aaa7f-76da-4635-b778-758f6613d8e3',  -- admin role
  'user_admin_5258282b-9c19-4d39-8ac5-2c025e451213'
);
```

---

#### 3. **Schema Incorrecto en API Route**

**Problema:**
El API `/api/admin/users` usaba schema incorrecto:
- ❌ Tabla `profiles` en vez de `user_profiles`
- ❌ Faltaba campo `tenant_id` (aislamiento multi-tenant)
- ❌ Campo `fullName` (camelCase) en vez de `full_name` (snake_case)
- ❌ Campo `key` faltante en insert de `user_roles`

**Solución:**
Correcciones en `app/api/admin/users/route.ts`:

```typescript
// ✅ CORRECCIÓN 1: Obtener tenant_id del admin (líneas 72-76)
const { data: adminProfile } = await supabase
  .from('user_profiles')  // Cambiado de 'profiles'
  .select('id, email, tenant_id')  // Agregado tenant_id
  .eq('id', user.id)
  .single()

// ✅ CORRECCIÓN 2: Crear perfil con tenant_id (líneas 156-163)
const { error: profileInsertError } = await adminClient
  .from('user_profiles')  // Cambiado de 'profiles'
  .insert({
    id: authUser.user.id,
    tenant_id: adminProfile.tenant_id,  // Agregado tenant_id
    email,
    full_name: fullName,  // Cambiado de fullName
  })

// ✅ CORRECCIÓN 3: Agregar campo key (líneas 177-184)
const { error: roleAssignError } = await adminClient
  .from('user_roles')
  .insert({
    user_id: authUser.user.id,
    role_id: finalRoleId,
    key: `user_role_${authUser.user.id}_${finalRoleId}`,  // Agregado
  })
```

**Impacto:** Los usuarios ahora se crean correctamente con aislamiento multi-tenant y son visibles en la UI.

---

### 📊 Evidencia de Éxito

**Usuario Creado:**
- **Email:** juan@ejemplo.com
- **Nombre:** Juan Pérez
- **Rol:** Vendedor
- **Contraseña Temporal:** CambiaTuClave
- **Tenant:** Heredado del admin que lo creó
- **Estado:** ✅ Visible en tabla de usuarios
- **Login:** ✅ Exitoso con acceso al dashboard

**Verificación Visual:**
- Usuario aparece en `/dashboard/users` con avatar "J"
- Tiene acceso completo al dashboard
- Sidebar muestra "Usuarios" y "Roles"
- Badge de rol: "Usuario" (vendedor)

---

### 🏗️ Arquitectura de Autenticación Actual

#### Modelo de Datos

```
auth.users (Supabase Auth)
  └── user_profiles (Multi-tenant)
       ├── id (FK → auth.users)
       ├── tenant_id (FK → tenants)
       ├── email
       ├── full_name
       ├── avatar_url
       ├── is_sysadmin (NUEVO) ← Super Admin sin tenant
       └── created_at/updated_at

user_roles (Junction Table)
  ├── user_id (FK → user_profiles)
  ├── role_id (FK → roles)
  └── key (UNIQUE constraint)

roles
  ├── admin
  ├── vendedor
  ├── supervisor
  └── dueño
```

#### **🆕 CAMBIO ARQUITECTURAL: Sistema de Super Admin**

**Fecha:** 2025-12-13
**Autor:** Usuario del proyecto

**Cambio Implementado:**
Se agregó la columna `is_sysadmin` a la tabla `profiles` (o `user_profiles`).

**Especificación:**
- **Tipo:** `BOOLEAN` (presumido, confirmar en schema real)
- **Default:** `FALSE` (presumido)
- **Propósito:** Identificar super administradores del sistema

**Comportamiento:**
Los usuarios con `is_sysadmin = TRUE` tienen:
- ✅ **Acceso completo** a todo el proyecto
- ✅ **No requieren rol asignado** en `user_roles`
- ✅ **Permisos ilimitados:** Ver, agregar, editar y borrar registros de **cualquier tabla**
- ✅ **Bypass de tenant isolation** (pueden ver datos de todos los tenants)

**Diferencia con Admin Regular:**
| Característica | Admin Regular (`role = 'admin'`) | Super Admin (`is_sysadmin = TRUE`) |
|----------------|----------------------------------|-------------------------------------|
| Requiere rol en `user_roles` | ✅ Sí | ❌ No |
| Limitado a su tenant | ✅ Sí | ❌ No (acceso global) |
| Puede ver todos los tenants | ❌ No | ✅ Sí |
| Permisos | Configurables por rol | Absolutos en todo el sistema |

**Casos de Uso:**
- Mantenimiento del sistema
- Configuración global de la plataforma
- Soporte técnico que necesita acceso a todos los tenants
- Auditoría cross-tenant

**⚠️ Consideraciones de Seguridad:**
- Este privilegio debe otorgarse **con extremo cuidado**
- Recomendado solo para desarrolladores y administradores del sistema
- Considerar logging de todas las acciones de sysadmin
- Implementar autenticación de dos factores (2FA) obligatoria para sysadmins

**📝 TODO - Implementación Pendiente:**
- [ ] Actualizar RLS policies para considerar `is_sysadmin`
- [ ] Actualizar middleware de autenticación
- [ ] Actualizar `useAuth` hook para detectar sysadmin
- [ ] Agregar UI indicator para usuarios sysadmin
- [ ] Implementar logging de acciones sysadmin
- [ ] Documentar proceso de asignación de sysadmin
- [ ] Crear migración formal para la columna `is_sysadmin`

---

### 🔄 Flujo de Creación de Usuario

```
UserDialog (UI)
  ↓
POST /api/admin/users
  ↓
1. Verificar que usuario actual es admin
2. Obtener tenant_id del admin
3. auth.admin.createUser() → auth.users
   - email_confirm: true
   - password: 'CambiaTuClave'
4. Insert en user_profiles
   - tenant_id heredado
5. Insert en user_roles
   - role_id (default: vendedor)
6. Return 200 ✅
  ↓
Alert: "Usuario creado exitosamente"
  ↓
GraphQL refetch → Usuario visible en tabla
```

---

### 📝 Archivos Modificados

**Commit:** `a8b4462`
**Mensaje:** `fix: corregir creación de usuarios y RLS recursión`

1. **`supabase/migrations/006_fix_user_roles_rls_recursion.sql`** (NUEVO)
   - Drop política recursiva
   - Create política para service_role

2. **`app/api/admin/users/route.ts`** (MODIFICADO)
   - Líneas 72-76: Cambio a `user_profiles` y select de `tenant_id`
   - Líneas 156-163: Insert en `user_profiles` con `tenant_id` y `full_name`
   - Líneas 177-184: Agregado campo `key` en user_roles

3. **`features/users/components/user-dialog.tsx`** (MODIFICADO - Auto-guardado)
   - Líneas 27-28: Estados para roles y roleId
   - Líneas 33-50: useEffect para cargar roles
   - Líneas 82-103: Llamada a API `/api/admin/users`
   - Líneas 117-138: Selector de rol en formulario

---

### 🎯 Metodología Aplicada

**Bucle Agéntico** (`.claude/prompts/bucle-agentico.md`):

1. ✅ **Delimitar Problema:** Crear usuario juan@ejemplo.com y verificar login
2. ✅ **Ingeniería Inversa:** Análisis de código, schema, RLS policies
3. ✅ **Planificación Jerárquica:** TodoWrite con 11 tareas
4. ✅ **Ejecución Iterativa:** 0% → 100% con validación continua
5. ✅ **Validación Visual:** Chrome DevTools MCP para screenshots y snapshots
6. ✅ **Documentación:** Commit y bitácora

**Herramientas Utilizadas:**
- **Chrome DevTools MCP:** Navegación, clicks, fills, screenshots, snapshots
- **Supabase MCP:** Intentos de queries (limitado por permisos)
- **TodoWrite:** Tracking de 11 tareas
- **Git:** Commit convencional con Co-Authored-By

---

### 🔐 Lecciones Aprendidas

1. **RLS Policies:** Evitar consultas recursivas a la misma tabla dentro de políticas
2. **Service Role:** Usar `service_role` en API routes para operaciones privilegiadas
3. **Schema Consistency:** Validar nombres de tablas y columnas (snake_case vs camelCase)
4. **Multi-tenancy:** Siempre propagar `tenant_id` en operaciones de admin
5. **Validación Visual:** Screenshots son esenciales para confirmar cambios en UI

---

### 📊 Estadísticas

- **Tiempo Total:** ~45 minutos (incluyendo debugging)
- **Errores Encontrados:** 6
- **Migraciones Creadas:** 1
- **Archivos Modificados:** 3
- **Líneas de Código:** ~50 líneas modificadas
- **Tests Manuales:** 2 (creación de usuario, login)
- **Resultado Final:** ✅ 100% Exitoso

---

### 🔜 Próximos Pasos Recomendados

1. **Implementar cambio de contraseña obligatorio en primer login**
2. **Agregar envío de email con link de reset password**
3. **Implementar sistema de permisos granulares**
4. **Agregar audit trail de quién creó qué usuario**
5. **Implementar bulk import de usuarios desde CSV**
6. **Crear tests automatizados para flujo de creación de usuarios**
7. **Implementar lógica de `is_sysadmin` en toda la aplicación**
8. **Documentar proceso de asignación de super admin**

---

**Última Actualización:** 2025-12-13 17:45 UTC
**Estado del Proyecto:** ✅ Sistema de usuarios funcional con multi-tenancy
