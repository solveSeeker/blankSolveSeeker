# Database Migrations

Este directorio contiene las migraciones de base de datos para el proyecto appBlankSolveSeeker.

## 📋 Orden de Aplicación

Las migraciones deben aplicarse en orden numérico estricto:

1. **001_enable_extensions_create_ents.sql** - Extensiones y tabla base `ents`
2. **002_create_sysensts.sql** - Tabla `sysEnts` (hereda de `ents`)
3. **003_create_profiles.sql** - Tabla `profiles` (perfiles de usuario)
4. **004_create_companies.sql** - Tabla `companies` (empresas multi-tenant)
5. **005_create_roles.sql** - Tabla `roles` (roles del sistema)
6. **006_create_user_companies.sql** - Tabla `user_companies` (relación usuario-empresa)
7. **007_create_user_roles.sql** - Tabla `user_roles` (relación usuario-rol)
8. **008_create_auditlog_and_functions.sql** - Tabla `auditLog` y funciones auxiliares
9. **009_create_audit_triggers.sql** - Triggers de auditoría
10. **010_create_rls_policies.sql** - Políticas Row Level Security (RLS)
11. **011_create_persons_tables.sql** - Tablas de personas (opcional)

## 🏗️ Arquitectura de Herencia

### Tabla Base: `ents`
Proporciona campos comunes para todas las entidades:
- `id` - UUID único
- `created` - Timestamp de creación
- `updated` - Timestamp de última actualización
- `hashUpdate` - Hash para tracking de cambios
- `visible` - Flag de borrado lógico (soft delete)
- `enabled` - Flag de visibilidad fuera de grillas (enabled=false oculta en selectores/dropdowns)
- `creator` - Usuario que creó el registro
- `updater` - Usuario que actualizó el registro

### Tabla Sistema: `sysEnts` (hereda de `ents`)
Agrega:
- `key` - Identificador único de texto (slug, handle)

### Tablas que Heredan de `sysEnts`
- **companies** - Empresas/organizaciones del sistema multi-tenant
- **roles** - Roles de usuario con permisos
- **user_companies** - Relación muchos-a-muchos usuario-empresa
- **user_roles** - Relación muchos-a-muchos usuario-rol
- **persons** - Base para personas (abstracta)
  - **naturalPersons** - Personas naturales (hereda de persons)
  - **legalPersons** - Personas jurídicas (hereda de persons)

### Tabla Independiente: `profiles`
No hereda de `ents`. Tiene su propia estructura:
- Referencia directa a `auth.users`
- Campos propios de perfil de usuario
- Flags de estado (is_active, is_sysadmin)

## 🔒 Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:

### Patrón General
- **SELECT**: Usuarios autenticados pueden leer (con restricciones según tabla)
- **INSERT**: Usuarios autenticados pueden insertar
- **UPDATE**: Usuarios autenticados pueden actualizar
- **DELETE**: Solo super admin (`solve.seeker.dev@gmail.com`)

### Tabla `auditLog`
- **SELECT**: Solo SysAdmins
- **INSERT**: Usuarios autenticados (vía trigger)
- **UPDATE**: BLOQUEADO (nunca se debe actualizar)
- **DELETE**: BLOQUEADO (nunca se debe eliminar)

## 📝 Sistema de Auditoría

### Función: `jsonb_custom_diff_recursive`
Calcula diferencias recursivas entre objetos JSONB para el audit trail.

### Función: `auditLogBeforeUpdate`
Trigger function que:
1. Actualiza campos de auditoría (`updated`, `updater`, `hashUpdate`)
2. Calcula diferencias entre registro antiguo y nuevo
3. Inserta registro en `auditLog`

### Triggers Configurados
Se ejecutan en BEFORE UPDATE para:
- profiles
- companies
- roles
- user_companies
- user_roles

**IMPORTANTE**: `auditLog` NO tiene trigger para evitar recursión infinita.

## 🛡️ Funciones Helper para RLS

### `get_current_user_is_sysadmin()`
Retorna `true` si el usuario actual es system administrator.

### `get_current_user_has_any_role()`
Retorna `true` si el usuario actual tiene algún rol activo asignado.

## 🗑️ Borrado Lógico y Visibilidad

En todas las tablas que heredan de `ents` o `sysEnts` se manejan dos conceptos:

### Campo `visible` (Borrado Lógico / Soft Delete)
- `visible = true` → Registro existe y está disponible
- `visible = false` → Registro borrado lógicamente

Los registros con `visible=false`:
- Se mantienen en la base de datos
- NO se muestran en ninguna interfaz (ni grillas ni selectores)
- Solo pueden ser recuperados o eliminados físicamente por el super admin

### Campo `enabled` (Visibilidad en Selectores)
- `enabled = true` → Registro se muestra en todos lados (grillas, selectores, dropdowns)
- `enabled = false` → Registro deshabilitado

Los registros con `enabled=false`:
- Se mantienen en la base de datos
- **SÍ se muestran en las grillas del dashboard** (para administración)
- **NO se muestran en selectores, dropdowns ni diálogos de asignación** (excepto si ya están asociados)
- Pueden ser eliminados físicamente solo por el super admin

### Ejemplo Práctico
Un usuario con una empresa asignada:
1. Al **deshabilitar la empresa** (enabled=false):
   - La empresa sigue visible en la grilla de empresas
   - La asignación usuario-empresa se marca como enabled=false
   - El usuario ve la empresa deshabilitada en "Gestionar empresas" (con fondo gris)
   - Otros usuarios NO ven la empresa en selectores

2. Al **quitar la asignación deshabilitada**:
   - Se elimina el registro de user_companies
   - El usuario NO puede volver a asignar esa empresa (está deshabilitada)

3. Al **borrar lógicamente la empresa** (visible=false):
   - La empresa NO aparece en ninguna parte
   - Se mantiene en BD por auditoría
   - Solo super admin puede verla/recuperarla

## 🔄 Migración desde Sistema Anterior

Si vienes del sistema anterior basado en `tenants`, estas migraciones:
- Reemplazan completamente la estructura anterior
- Usan `companies` en lugar de `tenants`
- Simplifican la jerarquía de herencia
- Mejoran el sistema de auditoría
- Clarifican las políticas RLS

## 📚 Documentación Adicional

- [BACKUP_SCHEMA_20251230.sql](../BACKUP_SCHEMA_20251230.sql) - Backup del esquema antes de la reorganización
- Ver comentarios en cada archivo de migración para detalles específicos

## ⚠️ Advertencias

1. **NO aplicar migraciones fuera de orden** - Se producirán errores de dependencia
2. **NO modificar `auditLog`** - Es una tabla de solo escritura (append-only)
3. **NO eliminar funciones helper** - Son requeridas por las políticas RLS
4. **NO modificar triggers** sin antes deshabilitarlos

## 🚀 Aplicar Migraciones

```bash
# Desde la raíz del proyecto
supabase db push

# O aplicar una migración específica
supabase migration up <timestamp>_<nombre>.sql
```

## 📊 Verificar Estado

```sql
-- Ver todas las tablas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Ver políticas RLS
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Ver triggers
SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgisinternal = false;

-- Ver funciones
SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace;
```
