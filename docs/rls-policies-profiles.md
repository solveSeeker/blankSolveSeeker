# Políticas RLS (Row Level Security) - Tabla Profiles

## Resumen de Políticas

La tabla `profiles` tiene dos políticas principales de seguridad:

1. **INSERT Policy**: `insert_profile_with_creator_validation` - Controla la creación de usuarios
2. **DELETE Policy**: `prevent_sysadmin_deletion` - Protege al usuario administrador del sistema

---

## Política de INSERT: `insert_profile_with_creator_validation`

### Propósito
Controlar quién puede crear nuevos usuarios en la tabla `profiles` con validación del campo `creator`.

### Reglas

#### 1. Usuario SysAdmin Especial (solve.seeker.dev@gmail.com)
- ✅ Puede crear usuarios **sin restricciones**
- ✅ No necesita especificar campo `creator`
- ✅ Puede crear otros usuarios sysadmin

**Validación:**
```sql
auth.jwt()->>'email' = 'solve.seeker.dev@gmail.com'
```

#### 2. Usuarios Admin/Owner de Compañías
- ✅ Pueden crear usuarios **solo si**:
  - Especifican un `creator` válido (UUID de un perfil existente)
  - Tienen rol `admin` u `owner` en una compañía activa

**Validación:**
```sql
(
  creator IS NOT NULL
  AND
  EXISTS (SELECT 1 FROM profiles WHERE id = creator)
  AND
  EXISTS (
    SELECT 1 FROM user_companies
    WHERE profile_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND is_active = true
  )
)
```

### Implementación en el Backend

La API route `/api/admin/users` (POST) ahora automáticamente asigna el campo `creator`:

```typescript
const { error: profileInsertError } = await adminClient
  .from('profiles')
  .insert({
    id: authUser.user.id,
    email,
    fullName: fullName,
    is_sysadmin: isSysAdminUser,
    creator: isSysAdmin ? null : user.id, // Solo no-sysadmin necesita creator
  })
```

### Ejemplos de Uso

#### ✅ Caso 1: SysAdmin crea usuario
```json
POST /api/admin/users
Usuario autenticado: solve.seeker.dev@gmail.com (is_sysadmin=true)
Body: {
  "email": "nuevo@ejemplo.com",
  "fullName": "Usuario Nuevo"
}

Resultado:
- creator = null
- Política aprobada por: auth.jwt()->>'email' = 'solve.seeker.dev@gmail.com'
```

#### ✅ Caso 2: Admin crea usuario
```json
POST /api/admin/users
Usuario autenticado: admin@company.com (role='admin' en user_companies)
Body: {
  "email": "empleado@ejemplo.com",
  "fullName": "Empleado Nuevo"
}

Resultado:
- creator = UUID del admin@company.com
- Política aprobada por: creator válido + rol admin activo
```

#### ❌ Caso 3: Usuario sin permisos intenta crear
```json
POST /api/admin/users
Usuario autenticado: vendedor@company.com (role='vendedor')

Resultado:
- API retorna 403 Forbidden (verificación en backend)
- Si pasara esa validación, RLS rechazaría el INSERT
```

### Funciones RLS Útiles

| Función | Retorna | Uso |
|---------|---------|-----|
| `auth.uid()` | UUID del usuario autenticado | Obtener ID del usuario actual |
| `auth.jwt()` | JSON con datos del token | Acceder a todo el JWT |
| `auth.jwt()->>'email'` | String con el email | Extraer email del JWT |
| `EXISTS (SELECT 1 FROM ...)` | Boolean | Verificar existencia de registros |

### Migración Aplicada

**Archivo:** `supabase/migrations/[timestamp]_replace_profiles_insert_policy_with_creator_validation.sql`

```sql
-- Eliminar la política existente de INSERT
DROP POLICY IF EXISTS "Admins can create profiles" ON profiles;

-- Crear nueva política con validación de creator
CREATE POLICY "insert_profile_with_creator_validation"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permitir si el usuario es solve.seeker.dev@gmail.com
  auth.jwt()->>'email' = 'solve.seeker.dev@gmail.com'
  OR
  -- Para otros usuarios: deben tener creator válido Y ser admin/owner
  (
    creator IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = creator
    )
    AND
    EXISTS (
      SELECT 1 FROM user_companies
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  )
);
```

### Testing

Para probar la política:

1. **Como SysAdmin:**
   ```bash
   # Loguearse como solve.seeker.dev@gmail.com
   # Crear usuario sin especificar creator
   # Debe funcionar ✅
   ```

2. **Como Admin:**
   ```bash
   # Loguearse como admin de una compañía
   # Crear usuario (API automáticamente asigna creator)
   # Debe funcionar ✅
   ```

3. **Como usuario sin permisos:**
   ```bash
   # Loguearse como vendedor
   # Intentar crear usuario
   # Debe fallar con 403 ❌
   ```

### Debugging

Si un INSERT falla por RLS, verificar:

1. **JWT válido:**
   ```sql
   SELECT auth.jwt();
   ```

2. **Email en JWT:**
   ```sql
   SELECT auth.jwt()->>'email';
   ```

3. **Roles del usuario:**
   ```sql
   SELECT * FROM user_companies
   WHERE profile_id = auth.uid()
   AND is_active = true;
   ```

4. **Creator existe:**
   ```sql
   SELECT * FROM profiles WHERE id = 'UUID_DEL_CREATOR';
   ```

### Notas Importantes

- ⚠️ El campo `creator` es **nullable** para permitir que el sysadmin principal no tenga creator
- ⚠️ La política usa `auth.jwt()->>'email'` en lugar de comparar UUIDs para mayor flexibilidad
- ⚠️ El adminClient **bypasea RLS**, por eso la API route puede insertar libremente
- ⚠️ Las políticas RLS son evaluadas con **OR lógico** - si cualquier política aprueba, el INSERT procede

---

## Política de DELETE: `prevent_sysadmin_deletion`

### Propósito
Proteger al usuario administrador del sistema (solve.seeker.dev@gmail.com) de ser eliminado accidentalmente o maliciosamente.

### Reglas

La política permite DELETE solo si se cumplen **TODAS** estas condiciones:

1. ✅ El usuario a eliminar **NO es** solve.seeker.dev@gmail.com
2. ✅ El usuario que hace la eliminación es admin/sysadmin

**Validación SQL:**
```sql
-- Permitir DELETE solo si NO es el usuario protegido
email != 'solve.seeker.dev@gmail.com'
AND
-- Y el usuario que hace la acción es admin/sysadmin
(
  auth.jwt()->>'email' = 'solve.seeker.dev@gmail.com'
  OR
  EXISTS (
    SELECT 1 FROM user_companies
    WHERE profile_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND is_active = true
  )
)
```

### Protecciones Múltiples Capas

Esta protección se implementa en **3 capas**:

#### 1. **Frontend (UI)**
[features/users/components/users-table.tsx:197](features/users/components/users-table.tsx#L197)

El botón de eliminar no se muestra para el usuario protegido:

```tsx
{profile.email !== 'solve.seeker.dev@gmail.com' && (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => handleDeleteUser(profile)}
  >
    {/* Delete icon */}
  </Button>
)}
```

#### 2. **Backend (API Route)**
[app/api/admin/users/[id]/route.ts:55](app/api/admin/users/[id]/route.ts#L55)

La API valida antes de intentar eliminar:

```typescript
if (userToDelete?.email === 'solve.seeker.dev@gmail.com') {
  return NextResponse.json(
    { error: 'No se puede eliminar el usuario administrador del sistema' },
    { status: 403 }
  )
}
```

#### 3. **Base de Datos (RLS Policy)**

Incluso si alguien intenta eliminar directamente con SQL, la política RLS lo previene.

### Migración Aplicada

**Archivo:** `supabase/migrations/[timestamp]_prevent_deletion_of_sysadmin_user.sql`

```sql
-- Crear política para prevenir eliminación del usuario solve.seeker.dev@gmail.com
CREATE POLICY "prevent_sysadmin_deletion"
ON profiles
FOR DELETE
TO authenticated
USING (
  -- Permitir DELETE solo si NO es el usuario protegido
  email != 'solve.seeker.dev@gmail.com'
  AND
  -- Y el usuario que hace la acción es admin/sysadmin
  (
    auth.jwt()->>'email' = 'solve.seeker.dev@gmail.com'
    OR
    EXISTS (
      SELECT 1 FROM user_companies
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  )
);
```

### Testing de Protección

Para verificar que la protección funciona:

1. **UI Test:**
   - Navegar a la tabla de usuarios
   - Verificar que el usuario solve.seeker.dev@gmail.com NO tiene botón de eliminar
   - Otros usuarios SÍ tienen el botón de eliminar

2. **API Test:**
   ```bash
   # Intento de eliminar el usuario protegido (debe fallar)
   curl -X DELETE http://localhost:4855/api/admin/users/[UUID_SYSADMIN]
   # Respuesta esperada: 403 Forbidden
   ```

3. **RLS Test:**
   ```sql
   -- Conectado como usuario admin, intentar eliminar
   DELETE FROM profiles WHERE email = 'solve.seeker.dev@gmail.com';
   -- Error esperado: new row violates row-level security policy
   ```

### Casos de Uso

#### ✅ Caso 1: Admin intenta eliminar usuario regular
```json
DELETE /api/admin/users/[UUID_REGULAR_USER]
Usuario autenticado: admin@company.com

Resultado:
- API permite la solicitud ✅
- RLS permite el DELETE ✅
- Usuario eliminado exitosamente
```

#### ❌ Caso 2: Admin intenta eliminar sysadmin protegido
```json
DELETE /api/admin/users/[UUID_SYSADMIN]
Usuario autenticado: admin@company.com

Resultado:
- Botón no visible en UI 🚫
- Si intenta por API: 403 Forbidden ❌
- Si intenta por SQL: RLS bloquea ❌
```

#### ❌ Caso 3: Sysadmin intenta eliminarse a sí mismo
```json
DELETE /api/admin/users/[UUID_SYSADMIN]
Usuario autenticado: solve.seeker.dev@gmail.com

Resultado:
- Botón no visible en UI 🚫
- API retorna: "No se puede eliminar el usuario administrador del sistema" ❌
```

### Referencias

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL auth Functions](https://supabase.com/docs/guides/database/postgres/row-level-security#helper-functions)
