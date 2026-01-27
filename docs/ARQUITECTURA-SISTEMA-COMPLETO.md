# Arquitectura Sistema Completo - App Blank Solve Seeker

> **Prompt Reutilizable para Desarrollo One-Shot**
>
> Este documento contiene todo el conocimiento arquitectónico del proyecto para replicar la estructura en otros proyectos o continuar el desarrollo de forma consistente.

---

## 📋 Tabla de Contenidos

1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Arquitectura Feature-First](#2-arquitectura-feature-first)
3. [Base de Datos - Modelo con Herencia](#3-base-de-datos---modelo-con-herencia)
4. [Sistema de Permisos y RLS](#4-sistema-de-permisos-y-rls)
5. [Sistema de Auditoría Automática](#5-sistema-de-auditoría-automática)
6. [Frontend - Flujo de Datos](#6-frontend---flujo-de-datos)
7. [Patrones de Componentes](#7-patrones-de-componentes)
8. [Sistema relatedObjects](#8-sistema-relatedobjects)
9. [Operaciones CRUD con GraphQL](#9-operaciones-crud-con-graphql)
10. [Migraciones y Evolución de BD](#10-migraciones-y-evolución-de-bd)
11. [Guía de Estilos UI/UX](#11-guía-de-estilos-uiux)
12. [Errores Comunes a Evitar](#12-errores-comunes-a-evitar)
13. [Checklist para Nueva Feature](#13-checklist-para-nueva-feature)
14. [Prompts Reutilizables](#14-prompts-reutilizables)

---

## 1. Stack Tecnológico

### Core Stack
```yaml
Runtime: Node.js 20+
Framework: Next.js 15.5.7 (App Router)
Base de Datos: PostgreSQL (Supabase)
API Layer: GraphQL (pg_graphql de Supabase) + REST (API Routes)
UI: React 19 + Tailwind CSS + Radix UI
State Management: Zustand
Schema Validation: Zod
Testing: Jest + React Testing Library
GraphQL Client: graphql-request
Auth: Supabase Auth (@supabase/supabase-js)
```

### Puerto de Desarrollo
```
Puerto: 4855
Significado: 4pp 8lank 5olve 5eeker (leet speak)
URL: http://localhost:4855
```

---

## 2. Arquitectura Feature-First

### Principio Fundamental
> **"app/ solo contiene rutas, features/ contiene la lógica"**

### Estructura Completa
```
proyecto/
├── app/                          # Next.js App Router (SOLO routing)
│   ├── auth/
│   │   ├── login/page.tsx       # Re-exporta LoginPage desde features/
│   │   ├── register/page.tsx
│   │   └── signout/route.ts
│   │
│   ├── dashboard/
│   │   ├── layout.tsx           # Layout con Sidebar + Header centralizado
│   │   ├── page.tsx             # Redirect a /dashboard/users
│   │   ├── users/page.tsx       # Re-exporta desde features/users
│   │   ├── companies/page.tsx
│   │   ├── roles/page.tsx
│   │   ├── audit/page.tsx
│   │   ├── profile/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── api/                     # API Routes (admin operations)
│   │   └── admin/
│   │       └── users/
│   │           ├── route.ts
│   │           ├── [id]/route.ts
│   │           └── [id]/password/route.ts
│   │
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home (redirect)
│   └── middleware.ts            # Auth + tenant detection
│
├── features/                     # 🎯 LÓGICA DE NEGOCIO (Feature-First)
│   ├── users/
│   │   ├── hooks/
│   │   │   ├── useProfiles.ts           # GET profiles via GraphQL
│   │   │   ├── useMutateProfile.ts      # INSERT/UPDATE/DELETE profiles
│   │   │   ├── useUserRoles.ts          # GET user_roles + counts
│   │   │   ├── useMutateUserRole.ts     # CRUD user_roles
│   │   │   ├── useUserCompanies.ts      # GET user_companies + counts
│   │   │   └── useMutateUserCompany.ts  # CRUD user_companies
│   │   ├── components/
│   │   │   ├── users-table.tsx
│   │   │   ├── user-dialog.tsx
│   │   │   ├── manage-user-roles-dialog.tsx
│   │   │   ├── manage-user-companies-dialog.tsx
│   │   │   ├── disabled-companies-warning-dialog.tsx
│   │   │   ├── delete-user-dialog.tsx
│   │   │   └── change-password-dialog.tsx
│   │   ├── types/
│   │   │   └── user.types.ts
│   │   └── pages/
│   │       └── UsersPage.tsx (página completa con layout)
│   │
│   ├── companies/
│   │   ├── hooks/
│   │   │   ├── useCompanies.ts
│   │   │   └── useMutateCompany.ts
│   │   ├── components/
│   │   │   ├── companies-table.tsx
│   │   │   ├── company-dialog.tsx
│   │   │   ├── delete-company-dialog.tsx
│   │   │   └── hide-company-dialog.tsx
│   │   └── types/
│   │       └── company.types.ts
│   │
│   ├── roles/
│   │   ├── hooks/
│   │   │   ├── useRoles.ts
│   │   │   └── useMutateRole.ts
│   │   ├── components/
│   │   │   ├── roles-table.tsx
│   │   │   ├── role-dialog.tsx
│   │   │   ├── delete-role-dialog.tsx
│   │   │   └── hide-role-dialog.tsx
│   │   └── types/
│   │       └── role.types.ts
│   │
│   ├── audit/
│   │   ├── hooks/
│   │   │   └── useAuditLogs.ts
│   │   ├── components/
│   │   │   ├── audit-logs-table.tsx
│   │   │   └── audit-diff-dialog.tsx
│   │   └── types/
│   │       └── audit.types.ts
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── pages/
│   │       └── LoginPage.tsx
│   │
│   └── profile/
│       └── ...
│
├── shared/                       # Código reutilizable
│   ├── components/              # UI Components (Radix UI)
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   └── ...
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useOptimalPageSize.ts
│   │   └── useToast.ts
│   │
│   ├── lib/
│   │   ├── graphql/
│   │   │   └── client.ts         # Cliente GraphQL configurado
│   │   └── supabase/
│   │       ├── client.ts         # Browser client
│   │       ├── server.ts         # Server client (SSR)
│   │       ├── admin.ts          # Admin client (bypasses RLS)
│   │       └── middleware.ts     # Auth middleware
│   │
│   ├── types/
│   │   ├── database.ts           # Supabase generated types
│   │   └── api.ts
│   │
│   ├── utils/
│   │   ├── cn.ts                 # className utility
│   │   └── helpers.ts
│   │
│   ├── stores/                   # Zustand stores (si se usan)
│   │   └── appStore.ts
│   │
│   └── constants/
│       └── app.ts
│
├── supabase/
│   ├── migrations/               # Migraciones SQL numeradas
│   │   ├── 001_create_base_ents.sql
│   │   ├── 002_create_sys_ents.sql
│   │   ├── ...
│   │   └── 015_populate_relatedobjects_user_companies.sql
│   └── backups/
│
├── public/                       # Assets estáticos
├── .claude/                      # Configuración Claude Code
├── docs/                         # Documentación
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── CLAUDE.md                     # Guía del proyecto
```

### ¿Por qué Feature-First?

**Beneficios**:
1. ✅ **Portable**: Cada feature es independiente y autocontenida
2. ✅ **Escalable**: Agregar features no afecta código existente
3. ✅ **AI-Friendly**: IA puede localizar rápidamente todo el código de una feature
4. ✅ **Mantenible**: Separación clara de responsabilidades
5. ✅ **Testeable**: Cada feature se puede testear en aislamiento

---

## 3. Base de Datos - Modelo con Herencia

### 3.1 Patrón de Herencia PostgreSQL

```sql
-- Tabla base abstracta (nunca se inserta directamente)
CREATE TABLE ents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created TIMESTAMPTZ DEFAULT NOW(),
  updated TIMESTAMPTZ DEFAULT NOW(),
  hashUpdate UUID DEFAULT gen_random_uuid(),
  visible BOOLEAN DEFAULT TRUE,
  enabled BOOLEAN DEFAULT TRUE,
  creator UUID DEFAULT auth.uid(),
  updater UUID DEFAULT auth.uid()
);

-- Primera extensión: añade 'key' para identificadores de texto
CREATE TABLE sysEnts (
  key TEXT UNIQUE
) INHERITS (ents);

-- Tablas de entidades heredan de sysEnts
CREATE TABLE companies (
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#001f3f',
  secondary_color TEXT DEFAULT '#FF6B35',
  accent_color TEXT DEFAULT '#004E89',
  settings JSONB DEFAULT '{}'::jsonb
) INHERITS (sysEnts);

CREATE TABLE roles (
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  hrchy SMALLINT DEFAULT 0,
  permissions JSONB DEFAULT '{}'::jsonb
) INHERITS (sysEnts);

-- Tablas de relación M:N también heredan
CREATE TABLE user_roles (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  relatedObjects JSONB,  -- ⚠️ CRÍTICO para búsquedas rápidas
  UNIQUE(profile_id, role_id)
) INHERITS (sysEnts);

CREATE TABLE user_companies (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  relatedObjects JSONB,  -- ⚠️ CRÍTICO para búsquedas rápidas
  UNIQUE(profile_id, company_id)
) INHERITS (sysEnts);
```

### 3.2 Campos Heredados Automáticamente

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `id` | UUID | gen_random_uuid() | Primary key |
| `created` | TIMESTAMPTZ | NOW() | Timestamp de creación |
| `updated` | TIMESTAMPTZ | NOW() | Timestamp de última modificación |
| `hashUpdate` | UUID | gen_random_uuid() | Para optimistic locking |
| `visible` | BOOLEAN | TRUE | FALSE = oculto en TODAS partes |
| `enabled` | BOOLEAN | TRUE | FALSE = oculto en selectores, visible en grillas admin |
| `creator` | UUID | auth.uid() | Usuario que creó el registro |
| `updater` | UUID | auth.uid() | Usuario que actualizó el registro |
| `key` | TEXT | - | Identificador de texto (slug, handle) |

### 3.3 Semántica de visible vs enabled

```typescript
visible = false:
  - ❌ NO se muestra en grillas admin
  - ❌ NO se muestra en selectores/dropdowns
  - ❌ NO se muestra en diálogos
  → Es un borrado lógico COMPLETO

enabled = false:
  - ✅ SÍ se muestra en grillas admin (con badge "Deshabilitado")
  - ❌ NO se muestra en selectores/dropdowns (a menos que ya esté asociado)
  - ✅ SI ya está asociado, se muestra con estilos disabled
  → Es un "soft disable" para prevenir nueva asignación
```

### 3.4 Tabla profiles (Independiente)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,  -- Denormalizado de auth.users
  fullName TEXT,
  avatarURL TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_sysadmin BOOLEAN DEFAULT FALSE,
  created TIMESTAMPTZ DEFAULT NOW(),
  updated TIMESTAMPTZ DEFAULT NOW(),
  hashUpdate UUID DEFAULT gen_random_uuid()
);

-- Trigger para sincronizar con auth.users
CREATE TRIGGER sync_profile_email
AFTER UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION sync_profile_email_from_auth();
```

### 3.5 Sistema relatedObjects (Denormalización Inteligente)

**Propósito**: Almacenar datos relacionados en JSONB para búsquedas rápidas sin JOINs.

**Estructura en user_roles**:
```json
{
  "profiles": "usuario@email.com",
  "roles": "nombre-del-rol"
}
```

**Estructura en user_companies**:
```json
{
  "profiles": "usuario@email.com",
  "companies": "nombre-empresa"
}
```

**Cuándo se puebla**:
1. **En INSERT**: Frontend incluye relatedObjects en la mutación
2. **En migraciones**: Scripts SQL pueblan registros existentes con UPDATE + JOIN

**Beneficios**:
- ✅ Búsquedas directas en JSONB: `relatedObjects->>'profiles' ILIKE '%email%'`
- ✅ Sin necesidad de JOINs en GraphQL
- ✅ Información siempre disponible sin query adicional
- ✅ Mejor performance en filtros y búsquedas

---

## 4. Sistema de Permisos y RLS

### 4.1 Funciones Helper

```sql
-- Verifica si usuario actual es SysAdmin
CREATE OR REPLACE FUNCTION get_current_user_is_sysadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_sysadmin = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Verifica si usuario tiene al menos un rol activo
CREATE OR REPLACE FUNCTION get_current_user_has_any_role()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.profile_id = auth.uid()
      AND ur.enabled = TRUE
      AND r.enabled = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER;
```

### 4.2 Políticas RLS por Tabla

#### profiles
```sql
-- SELECT: SysAdmins ven todo, otros solo ven no-sysadmins
CREATE POLICY "Users can view non-sysadmin profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  get_current_user_is_sysadmin() = TRUE
  OR (is_sysadmin = FALSE AND get_current_user_has_any_role() = TRUE)
);

-- INSERT/UPDATE: Solo SysAdmins o usuarios con roles
CREATE POLICY "Users with roles can insert profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_is_sysadmin() = TRUE
  OR get_current_user_has_any_role() = TRUE
);

-- DELETE: Solo super admin
CREATE POLICY "Only super admin can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (
  auth.email() = 'solve.seeker.dev@gmail.com'
);
```

#### companies, roles (Patrones similares)
```sql
-- SELECT/INSERT/UPDATE: Todos los usuarios autenticados
CREATE POLICY "Authenticated users can CRUD companies"
ON companies FOR ALL
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);

-- DELETE: Solo super admin
CREATE POLICY "Only super admin can delete companies"
ON companies FOR DELETE
TO authenticated
USING (
  auth.email() = 'solve.seeker.dev@gmail.com'
);
```

#### user_companies, user_roles
```sql
-- SELECT/INSERT/UPDATE: Todos autenticados
CREATE POLICY "Authenticated users can manage user_companies"
ON user_companies FOR ALL
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);

-- DELETE: Solo super admin
CREATE POLICY "Only super admin can delete user_companies"
ON user_companies FOR DELETE
TO authenticated
USING (
  auth.email() = 'solve.seeker.dev@gmail.com'
);
```

#### auditLog
```sql
-- SELECT: Solo SysAdmins
CREATE POLICY "Only sysadmins can view audit log"
ON "auditLog" FOR SELECT
TO authenticated
USING (get_current_user_is_sysadmin() = TRUE);

-- INSERT: Sistema (via trigger)
-- UPDATE/DELETE: DENY (nunca modificar auditoría)
```

### 4.3 Super Admin Especial

**Email**: `solve.seeker.dev@gmail.com`

**Permisos únicos**:
- ✅ Puede hacer DELETE físico (los demás solo disable)
- ✅ Siempre pasa políticas RLS
- ✅ Puede ver y modificar otros SysAdmins

---

## 5. Sistema de Auditoría Automática

### 5.1 Tabla auditLog

```sql
CREATE TABLE "auditLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nameTable" TEXT NOT NULL,        -- Tabla modificada
  "idObject" UUID NOT NULL,         -- ID del objeto
  updated TIMESTAMPTZ DEFAULT NOW(),
  "userId" UUID REFERENCES profiles(id),
  "userIdentifier" TEXT,            -- Email del usuario
  "currentUser" TEXT,               -- Usuario DB (postgres role)
  "beforeUpdate" JSONB,             -- Estado anterior completo
  "afterUpdate" JSONB,              -- Estado nuevo completo
  diff JSONB                        -- Solo los campos que cambiaron
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_auditlog_nametable ON "auditLog"("nameTable");
CREATE INDEX idx_auditlog_idobject ON "auditLog"("idObject");
CREATE INDEX idx_auditlog_userid ON "auditLog"("userId");
CREATE INDEX idx_auditlog_updated ON "auditLog"(updated DESC);
```

### 5.2 Función de Cálculo de Diff Recursivo

```sql
CREATE OR REPLACE FUNCTION jsonb_custom_diff_recursive(old jsonb, new jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}'::jsonb;
  k text;
  old_val jsonb;
  new_val jsonb;
BEGIN
  -- Iterar sobre claves en NEW
  FOR k IN SELECT jsonb_object_keys(new) LOOP
    new_val := new -> k;
    old_val := old -> k;

    -- Si clave no existe en OLD o valores difieren
    IF old_val IS NULL OR old_val != new_val THEN
      result := result || jsonb_build_object(
        k, jsonb_build_object('old', old_val, 'new', new_val)
      );
    END IF;
  END LOOP;

  -- Claves que existían en OLD pero no en NEW
  FOR k IN SELECT jsonb_object_keys(old) LOOP
    IF new -> k IS NULL THEN
      result := result || jsonb_build_object(
        k, jsonb_build_object('old', old -> k, 'new', NULL)
      );
    END IF;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 5.3 Trigger auditLogBeforeUpdate

```sql
CREATE OR REPLACE FUNCTION audit_log_before_update()
RETURNS TRIGGER AS $$
DECLARE
  current_profile_id UUID;
  current_profile_email TEXT;
  diff_result JSONB;
BEGIN
  -- Obtener usuario actual
  current_profile_id := auth.uid();
  SELECT email INTO current_profile_email FROM profiles WHERE id = current_profile_id;

  -- Calcular diff
  diff_result := jsonb_custom_diff_recursive(
    to_jsonb(OLD),
    to_jsonb(NEW)
  );

  -- Insertar en auditLog
  INSERT INTO "auditLog" (
    "nameTable",
    "idObject",
    "userId",
    "userIdentifier",
    "currentUser",
    "beforeUpdate",
    "afterUpdate",
    diff
  ) VALUES (
    TG_TABLE_NAME,
    OLD.id,
    current_profile_id,
    current_profile_email,
    current_user,
    to_jsonb(OLD),
    to_jsonb(NEW),
    diff_result
  );

  -- Actualizar campos de tracking
  NEW.updated := NOW();
  NEW.updater := current_profile_id;
  NEW."hashUpdate" := gen_random_uuid();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a todas las tablas relevantes
CREATE TRIGGER audit_log_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION audit_log_before_update();

CREATE TRIGGER audit_log_trigger
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION audit_log_before_update();

-- ...repetir para cada tabla
```

### 5.4 Ejemplo de Diff Generado

```json
{
  "name": {
    "old": "Empresa Vieja",
    "new": "Empresa Nueva"
  },
  "enabled": {
    "old": true,
    "new": false
  },
  "primary_color": {
    "old": "#001f3f",
    "new": "#FF0000"
  }
}
```

---

## 6. Frontend - Flujo de Datos

### 6.1 Cliente GraphQL Configurado

**Archivo**: `shared/lib/graphql/client.ts`

```typescript
import { GraphQLClient } from 'graphql-request'
import { createClient } from '@/shared/lib/supabase/client'

const ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`

export async function getGraphQLClient(): Promise<GraphQLClient> {
  // 1. Obtener sesión actual de Supabase
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // 2. Crear cliente GraphQL con auth headers
  const client = new GraphQLClient(ENDPOINT, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      authorization: session?.access_token
        ? `Bearer ${session.access_token}`
        : '',
    },
  })

  return client
}
```

### 6.2 Patrón de Hook de Lectura (useCompanies)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
import type { Company } from '../types/company.types'

// GraphQL Query
const GET_COMPANIES_QUERY = `
  query GetCompanies {
    companiesCollection(orderBy: { created: DescNullsFirst }) {
      edges {
        node {
          id
          name
          slug
          key
          logo_url
          primary_color
          secondary_color
          accent_color
          settings
          visible
          enabled
          created
          updated
        }
      }
    }
  }
`

interface CompaniesResponse {
  companiesCollection: {
    edges: Array<{ node: Company }>
  }
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const client = await getGraphQLClient()
      const data = await client.request<CompaniesResponse>(GET_COMPANIES_QUERY)

      const companiesList = data.companiesCollection.edges.map(e => e.node)
      setCompanies(companiesList)
      setError(null)
    } catch (err) {
      console.error('Error fetching companies:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    companies,
    isLoading,
    error,
    refetch: fetchCompanies
  }
}
```

### 6.3 Patrón de Hook de Mutaciones (useMutateUserRole)

```typescript
'use client'

import { useState } from 'react'
import { getGraphQLClient } from '@/shared/lib/graphql/client'
import type { UserRole } from '../types/user.types'

// GraphQL Mutations
const INSERT_USER_ROLES_MUTATION = `
  mutation InsertUserRoles($objects: [user_rolesInsertInput!]!) {
    insertIntouser_rolesCollection(objects: $objects) {
      affectedCount
      records {
        id
        profile_id
        role_id
        relatedObjects
        enabled
        visible
        created
      }
    }
  }
`

const UPDATE_USER_ROLES_MUTATION = `
  mutation UpdateUserRoles(
    $filter: user_rolesFilter!
    $set: user_rolesUpdateInput!
  ) {
    updateuser_rolesCollection(filter: $filter, set: $set) {
      affectedCount
      records {
        id
        enabled
      }
    }
  }
`

const DELETE_USER_ROLES_MUTATION = `
  mutation DeleteUserRoles($filter: user_rolesFilter!) {
    deleteFromuser_rolesCollection(filter: $filter) {
      affectedCount
      records {
        id
      }
    }
  }
`

// Interfaces
interface UserRoleRelatedObjects {
  profiles: string  // email
  roles: string     // name
}

interface InsertUserRoleInput {
  profileId: string
  profileEmail: string    // Para relatedObjects
  roleId: string
  roleName: string        // Para relatedObjects
  enabled?: boolean
  visible?: boolean
}

interface UpdateUserRolesInput {
  profileId: string
  roleIds: string[]
  enabled: boolean
}

export function useMutateUserRole() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Fetch by profile (solo enabled)
  const fetchByProfile = async (profileId: string): Promise<UserRole[]> => {
    const client = await getGraphQLClient()
    const data = await client.request(`
      query GetUserRolesByProfile($profileId: UUID!) {
        user_rolesCollection(
          filter: {
            profile_id: { eq: $profileId }
            enabled: { eq: true }
          }
        ) {
          edges {
            node {
              id
              profile_id
              role_id
              relatedObjects
              enabled
            }
          }
        }
      }
    `, { profileId })

    return data.user_rolesCollection.edges.map((e: any) => e.node)
  }

  // Fetch all by profile (enabled y disabled)
  const fetchAllByProfile = async (profileId: string): Promise<UserRole[]> => {
    const client = await getGraphQLClient()
    const data = await client.request(`
      query GetAllUserRolesByProfile($profileId: UUID!) {
        user_rolesCollection(
          filter: { profile_id: { eq: $profileId } }
        ) {
          edges {
            node {
              id
              profile_id
              role_id
              relatedObjects
              enabled
            }
          }
        }
      }
    `, { profileId })

    return data.user_rolesCollection.edges.map((e: any) => e.node)
  }

  // INSERT con relatedObjects
  const insert = async (inputs: InsertUserRoleInput[]): Promise<UserRole[]> => {
    try {
      setIsLoading(true)
      setError(null)

      const client = await getGraphQLClient()

      // Construir objetos con relatedObjects
      const objects = inputs.map(input => {
        const relatedObjects: UserRoleRelatedObjects = {
          profiles: input.profileEmail,
          roles: input.roleName
        }

        return {
          profile_id: input.profileId,
          role_id: input.roleId,
          relatedObjects: JSON.stringify(relatedObjects), // ⚠️ CRÍTICO: stringify
          enabled: input.enabled ?? true,
          visible: input.visible ?? true
        }
      })

      console.log('🔍 DEBUG - Ejecutando INSERT con relatedObjects')
      const response = await client.request(INSERT_USER_ROLES_MUTATION, { objects })

      console.log('✅ user_roles insertados:', response.insertIntouser_rolesCollection.affectedCount)
      return response.insertIntouser_rolesCollection.records
    } catch (err) {
      console.error('❌ Error al insertar user_roles:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // UPDATE status (enable/disable)
  const updateStatus = async ({
    profileId,
    roleIds,
    enabled
  }: UpdateUserRolesInput) => {
    try {
      setIsLoading(true)
      setError(null)

      const client = await getGraphQLClient()
      const response = await client.request(UPDATE_USER_ROLES_MUTATION, {
        filter: {
          profile_id: { eq: profileId },
          role_id: { in: roleIds }
        },
        set: { enabled }
      })

      console.log(`✅ user_roles actualizados a enabled=${enabled}:`, response.updateuser_rolesCollection.affectedCount)
      return response.updateuser_rolesCollection.records
    } catch (err) {
      console.error('❌ Error al actualizar user_roles:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // DELETE (solo para super admin)
  const remove = async (ids: string[]) => {
    try {
      setIsLoading(true)
      setError(null)

      const client = await getGraphQLClient()
      const response = await client.request(DELETE_USER_ROLES_MUTATION, {
        filter: { id: { in: ids } }
      })

      console.log('✅ user_roles eliminados:', response.deleteFromuser_rolesCollection.affectedCount)
      return response.deleteFromuser_rolesCollection.records
    } catch (err) {
      console.error('❌ Error al eliminar user_roles:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    fetchByProfile,
    fetchAllByProfile,
    insert,
    updateStatus,
    remove,
    isLoading,
    error
  }
}
```

---

## 7. Patrones de Componentes

### 7.1 Layout del Dashboard con Header Centralizado

**Archivo**: `app/dashboard/layout.tsx`

```typescript
'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/shared/components/Sidebar'
import { UserCog, Shield, Building2, ScrollText, User, Settings } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Mapeo de rutas a información de página
  const getPageInfo = () => {
    if (pathname.includes('/users')) {
      return {
        title: 'Usuarios',
        description: 'Gestiona los usuarios y sus roles en el sistema',
        icon: <UserCog className="w-5 h-5" />
      }
    }
    if (pathname.includes('/roles')) {
      return {
        title: 'Roles',
        description: 'Define y administra roles de usuario',
        icon: <Shield className="w-5 h-5" />
      }
    }
    if (pathname.includes('/companies')) {
      return {
        title: 'Empresas',
        description: 'Administra las empresas del sistema',
        icon: <Building2 className="w-5 h-5" />
      }
    }
    if (pathname.includes('/audit')) {
      return {
        title: 'Auditoría',
        description: 'Registro de cambios en el sistema',
        icon: <ScrollText className="w-5 h-5" />
      }
    }
    if (pathname.includes('/profile')) {
      return {
        title: 'Perfil',
        description: 'Gestiona tu información personal',
        icon: <User className="w-5 h-5" />
      }
    }
    if (pathname.includes('/settings')) {
      return {
        title: 'Configuración',
        description: 'Ajustes del sistema',
        icon: <Settings className="w-5 h-5" />
      }
    }
    return { title: '', description: '', icon: null }
  }

  const pageInfo = getPageInfo()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header centralizado */}
        <div className="flex items-center h-16 px-8 border-b border-gray-200 bg-white">
          {pageInfo.title && (
            <div className="flex items-center gap-3">
              {pageInfo.icon && (
                <div className="text-gray-700">{pageInfo.icon}</div>
              )}
              <h1 className="text-lg font-semibold text-gray-900">
                {pageInfo.title}
              </h1>
              {pageInfo.description && (
                <>
                  <span className="text-gray-400">-</span>
                  <p className="text-sm text-gray-600">
                    {pageInfo.description}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Contenido de la página */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

### 7.2 Dialog de Gestión (ManageUserRolesDialog)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useRoles } from '@/features/roles/hooks/useRoles'
import { useMutateUserRole } from '../hooks/useMutateUserRole'
import type { Profile } from '../hooks/useProfiles'

interface ManageUserRolesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: Profile | null
  onRolesUpdated: () => void
}

export function ManageUserRolesDialog({
  open,
  onOpenChange,
  user,
  onRolesUpdated
}: ManageUserRolesDialogProps) {
  const { roles, isLoading: rolesLoading } = useRoles()
  const { fetchAllByProfile, insert, updateStatus, isLoading: isSaving } = useMutateUserRole()
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [isFetchingUserRoles, setIsFetchingUserRoles] = useState(false)

  // Cargar roles actuales del usuario cuando abre el dialog
  useEffect(() => {
    if (open && user && !user.is_sysadmin) {
      fetchUserRoles()
    } else if (!open) {
      setSelectedRoleIds([])
    }
  }, [open, user])

  const fetchUserRoles = async () => {
    if (!user) return

    try {
      setIsFetchingUserRoles(true)
      const userRoles = await fetchAllByProfile(user.id)

      // Solo roles enabled
      const roleIds = userRoles
        .filter(ur => ur.enabled)
        .map(ur => ur.role_id)

      setSelectedRoleIds(roleIds)
    } catch (error) {
      console.error('Error al cargar roles del usuario:', error)
    } finally {
      setIsFetchingUserRoles(false)
    }
  }

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId)
      } else {
        return [...prev, roleId]
      }
    })
  }

  const handleSave = async () => {
    if (!user) return

    try {
      // Obtener todos los roles existentes (enabled y disabled)
      const existingRoles = await fetchAllByProfile(user.id)
      const existingRoleIds = existingRoles.map(r => r.role_id)

      // Roles a insertar (nuevos que no existen)
      const rolesToInsert = selectedRoleIds.filter(roleId =>
        !existingRoleIds.includes(roleId)
      )

      // Roles a habilitar (existen DESHABILITADOS pero ahora están seleccionados)
      const rolesToEnable = selectedRoleIds.filter(roleId => {
        const existing = existingRoles.find(r => r.role_id === roleId)
        return existing && !existing.enabled
      })

      // Roles a deshabilitar (existen HABILITADOS pero ya NO están seleccionados)
      const rolesToDisable = existingRoleIds.filter(roleId => {
        const existing = existingRoles.find(r => r.role_id === roleId)
        return existing && existing.enabled && !selectedRoleIds.includes(roleId)
      })

      console.log('🔍 DEBUG - rolesToInsert:', rolesToInsert)
      console.log('🔍 DEBUG - rolesToEnable:', rolesToEnable)
      console.log('🔍 DEBUG - rolesToDisable:', rolesToDisable)

      // Ejecutar operaciones en orden
      if (rolesToInsert.length > 0) {
        const roleNamesMap = new Map(roles.map(r => [r.id, r.name]))

        const insertInputs = rolesToInsert.map(roleId => ({
          profileId: user.id,
          profileEmail: user.email,
          roleId: roleId,
          roleName: roleNamesMap.get(roleId) || '',
          enabled: true,
          visible: true
        }))

        await insert(insertInputs)
      }

      if (rolesToEnable.length > 0) {
        await updateStatus({
          profileId: user.id,
          roleIds: rolesToEnable,
          enabled: true
        })
      }

      if (rolesToDisable.length > 0) {
        await updateStatus({
          profileId: user.id,
          roleIds: rolesToDisable,
          enabled: false
        })
      }

      onRolesUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('❌ Error al guardar roles:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Gestionar Roles</DialogTitle>
          <p className="text-sm text-gray-400 mt-1">
            Asigna uno o más roles al usuario
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Usuario info */}
          <div>
            <p className="text-sm font-normal">Usuario</p>
            <p className="text-sm text-gray-400">
              {user?.fullName} ({user?.email})
            </p>
          </div>

          {/* Roles disponibles */}
          <div>
            <p className="text-sm font-normal mb-3">Roles disponibles</p>

            {rolesLoading || isFetchingUserRoles ? (
              <div className="text-sm text-muted-foreground">Cargando roles...</div>
            ) : (
              <div className="space-y-1 border border-gray-200 rounded-lg p-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoleIds.includes(role.id)}
                      onCheckedChange={() => handleToggleRole(role.id)}
                    />
                    <label
                      htmlFor={`role-${role.id}`}
                      className="flex-1 text-sm text-gray-900 font-normal cursor-pointer"
                    >
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400">
            Un usuario puede tener múltiples roles asignados
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 8. Sistema relatedObjects

### 8.1 Propósito y Beneficios

**¿Qué es relatedObjects?**
Campo JSONB que almacena referencias denormalizadas a tablas relacionadas para búsquedas rápidas sin JOINs.

**Beneficios**:
1. ✅ **Performance**: Sin necesidad de JOINs en GraphQL
2. ✅ **Búsquedas Directas**: `WHERE relatedObjects->>'profiles' ILIKE '%email%'`
3. ✅ **Datos Siempre Disponibles**: No requiere query adicional
4. ✅ **Filtros Eficientes**: GraphQL puede filtrar directamente en JSONB

### 8.2 Estructura por Tabla

#### user_roles
```json
{
  "profiles": "usuario@email.com",
  "roles": "admin"
}
```

#### user_companies
```json
{
  "profiles": "usuario@email.com",
  "companies": "Solve Seeker"
}
```

### 8.3 Poblado en INSERT (Frontend)

```typescript
// En useMutateUserRole.insert()
const relatedObjects = {
  profiles: input.profileEmail,  // Email del usuario
  roles: input.roleName          // Nombre del rol
}

const objects = [{
  profile_id: input.profileId,
  role_id: input.roleId,
  relatedObjects: JSON.stringify(relatedObjects), // ⚠️ CRÍTICO: stringify
  enabled: true,
  visible: true
}]

await client.request(INSERT_USER_ROLES_MUTATION, { objects })
```

### 8.4 Poblado en Migraciones (BD)

**Migración 012** - user_roles:
```sql
-- Poblar relatedObjects en registros existentes
UPDATE user_roles ur
SET "relatedObjects" = jsonb_build_object(
  'profiles', p.email,
  'roles', r.name
)
FROM profiles p, roles r
WHERE ur.profile_id = p.id
  AND ur.role_id = r.id
  AND ur."relatedObjects" IS NULL;
```

**Migración 015** - user_companies:
```sql
-- Poblar relatedObjects en registros existentes
UPDATE user_companies uc
SET "relatedObjects" = jsonb_build_object(
  'profiles', p.email,
  'companies', c.name
)
FROM profiles p, companies c
WHERE uc.profile_id = p.id
  AND uc.company_id = c.id
  AND uc."relatedObjects" IS NULL;
```

### 8.5 Uso en GraphQL Queries

```graphql
query SearchUserRoles($searchTerm: String!) {
  user_rolesCollection(
    filter: {
      relatedObjects: {
        # Búsqueda directa en JSONB
        cs: { profiles: { ilike: $searchTerm } }
      }
    }
  ) {
    edges {
      node {
        id
        relatedObjects
        enabled
      }
    }
  }
}
```

---

## 9. Operaciones CRUD con GraphQL

### 9.1 Query (SELECT)

```graphql
query GetCompanies {
  companiesCollection(
    orderBy: { created: DescNullsFirst }
    filter: { enabled: { eq: true } }
  ) {
    edges {
      node {
        id
        name
        slug
        enabled
        created
      }
    }
  }
}
```

### 9.2 Mutation INSERT

```graphql
mutation InsertCompany($objects: [companiesInsertInput!]!) {
  insertIntocompaniesCollection(objects: $objects) {
    affectedCount
    records {
      id
      name
      slug
      created
    }
  }
}
```

**Variables**:
```json
{
  "objects": [{
    "name": "Nueva Empresa",
    "slug": "nueva-empresa",
    "key": "nueva-empresa",
    "primary_color": "#001f3f",
    "secondary_color": "#FF6B35",
    "accent_color": "#004E89",
    "enabled": true,
    "visible": true
  }]
}
```

### 9.3 Mutation UPDATE

```graphql
mutation UpdateCompany(
  $filter: companiesFilter!
  $set: companiesUpdateInput!
) {
  updatecompaniesCollection(filter: $filter, set: $set) {
    affectedCount
    records {
      id
      name
      enabled
    }
  }
}
```

**Variables**:
```json
{
  "filter": {
    "id": { "eq": "uuid-here" }
  },
  "set": {
    "name": "Nombre Actualizado",
    "enabled": false
  }
}
```

### 9.4 Mutation DELETE

```graphql
mutation DeleteCompany($filter: companiesFilter!) {
  deleteFromcompaniesCollection(filter: $filter) {
    affectedCount
    records {
      id
    }
  }
}
```

**Variables**:
```json
{
  "filter": {
    "id": { "in": ["uuid1", "uuid2"] }
  }
}
```

### 9.5 Filtros Avanzados

```graphql
# OR logic
filter: {
  or: [
    { name: { ilike: "%search%" } }
    { slug: { ilike: "%search%" } }
  ]
}

# AND logic
filter: {
  and: [
    { enabled: { eq: true } }
    { visible: { eq: true } }
  ]
}

# IN operator
filter: {
  id: { in: ["uuid1", "uuid2", "uuid3"] }
}

# Comparison operators
filter: {
  created: { gte: "2024-01-01" }
  hrchy: { lt: 5 }
}

# JSONB operators
filter: {
  relatedObjects: {
    cs: { profiles: { ilike: "%email%" } }
  }
}
```

---

## 10. Migraciones y Evolución de BD

### 10.1 Orden Secuencial de Migraciones

```
001_create_extensions.sql           # uuid-ossp, pgcrypto
002_create_base_ents.sql            # Tabla base ents
003_create_sys_ents.sql             # Tabla sysEnts (hereda de ents)
004_create_profiles.sql             # Tabla profiles (independiente)
005_create_companies.sql            # Tabla companies (hereda sysEnts)
006_create_roles.sql                # Tabla roles (hereda sysEnts)
007_create_user_companies.sql       # Tabla user_companies (hereda sysEnts)
008_create_user_roles.sql           # Tabla user_roles (hereda sysEnts)
009_create_audit_log.sql            # Tabla auditLog + funciones
010_create_audit_triggers.sql       # Triggers para auditoría
011_create_rls_policies.sql         # Row Level Security policies
012_populate_relatedobjects_user_roles.sql      # ⚠️ Migración de datos
013_add_primary_key_user_roles.sql              # PRIMARY KEY para pg_graphql
014_add_primary_key_user_companies.sql          # PRIMARY KEY para pg_graphql
015_populate_relatedobjects_user_companies.sql  # ⚠️ Migración de datos
```

### 10.2 Patrón de Migración de Estructura

**Archivo**: `001_create_extensions.sql`
```sql
-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**Archivo**: `002_create_base_ents.sql`
```sql
-- Tabla base para herencia
CREATE TABLE ents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created TIMESTAMPTZ DEFAULT NOW(),
  updated TIMESTAMPTZ DEFAULT NOW(),
  hashUpdate UUID DEFAULT gen_random_uuid(),
  visible BOOLEAN DEFAULT TRUE,
  enabled BOOLEAN DEFAULT TRUE,
  creator UUID DEFAULT auth.uid(),
  updater UUID DEFAULT auth.uid()
);
```

### 10.3 Patrón de Migración de Datos

**Archivo**: `012_populate_relatedobjects_user_roles.sql`
```sql
-- Poblar relatedObjects en registros existentes
UPDATE user_roles ur
SET "relatedObjects" = jsonb_build_object(
  'profiles', p.email,
  'roles', r.name
)
FROM profiles p, roles r
WHERE ur.profile_id = p.id
  AND ur.role_id = r.id
  AND ur."relatedObjects" IS NULL;

-- Verificar
SELECT
  id,
  profile_id,
  role_id,
  "relatedObjects"
FROM user_roles
WHERE "relatedObjects" IS NOT NULL
LIMIT 5;
```

### 10.4 Aplicación de Migraciones

**Usando Supabase CLI**:
```bash
# Aplicar todas las migraciones pendientes
supabase db push

# Aplicar migración específica
supabase db push --file supabase/migrations/015_populate_relatedobjects_user_companies.sql
```

**Usando MCP de Supabase**:
```typescript
// En Claude Code, usar herramienta apply_migration
await supabaseMCP.apply_migration({
  migration_sql: readFileSync('supabase/migrations/015_populate_relatedobjects_user_companies.sql', 'utf-8')
})
```

### 10.5 Patrón PRIMARY KEY para pg_graphql

⚠️ **CRÍTICO**: pg_graphql SOLO expone tablas con PRIMARY KEY explícito.

**Problema**:
```sql
-- Tabla con herencia NO tiene PK explícita
CREATE TABLE user_roles (...) INHERITS (sysEnts);
-- pg_graphql NO la expone ❌
```

**Solución**:
```sql
-- Agregar PRIMARY KEY explícita
ALTER TABLE user_roles ADD PRIMARY KEY (id);
-- Ahora pg_graphql la expone ✅
```

**Archivo**: `013_add_primary_key_user_roles.sql`
```sql
-- Agregar PRIMARY KEY si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_pkey'
  ) THEN
    ALTER TABLE user_roles ADD PRIMARY KEY (id);
  END IF;
END $$;
```

---

## 11. Guía de Estilos UI/UX

### 11.1 Dialogs (Modals)

**Regla CRÍTICA**: TODOS los dialogs SIEMPRE tienen `bg-white`.

```typescript
// ✅ CORRECTO
<DialogContent className="sm:max-w-md bg-white">
  {/* contenido */}
</DialogContent>

// ❌ INCORRECTO
<DialogContent className="sm:max-w-md">
  {/* contenido */}
</DialogContent>
```

**Estructura estándar**:
```typescript
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="sm:max-w-[500px] bg-white">
    <DialogHeader>
      <DialogTitle>Título del Dialog</DialogTitle>
      <p className="text-sm text-gray-400 mt-1">
        Descripción breve
      </p>
    </DialogHeader>

    <div className="space-y-4 py-4">
      {/* Form fields o contenido */}
    </div>

    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Cancelar
      </Button>
      <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white">
        Guardar
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

### 11.2 Inputs (Campos de Texto)

**Estándar del Proyecto**: El componente base `Input` ya tiene estilos correctos.

```typescript
// ✅ CORRECTO - Usa el componente sin clases adicionales
<Input
  id="name"
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Nombre"
/>

// ❌ INNECESARIO - No repitas las clases del componente
<Input
  className="border-gray-200 focus-visible:border-gray-900"
  // ...props
/>
```

**Estilos automáticos**:
- `border-gray-200` - Borde gris claro sin foco
- `focus-visible:border-gray-900` - Borde oscuro con foco
- `focus-visible:ring-0` - Sin anillo de enfoque

### 11.3 Botones de Eliminación

**Regla**: Botones destructivos SIEMPRE rojos + alineados a la derecha.

```typescript
// ✅ CORRECTO - Patrón estándar completo
<AlertDialogFooter>
  <Button
    variant="outline"
    onClick={() => onOpenChange(false)}
    disabled={loading}
  >
    Cancelar
  </Button>
  <Button
    variant="destructive"
    onClick={handleDelete}
    disabled={loading}
  >
    {loading ? 'Eliminando...' : 'Eliminar'}
  </Button>
</AlertDialogFooter>

// ❌ INCORRECTO - Estructura manual
<div className="flex gap-3">
  <AlertDialogCancel>Cancelar</AlertDialogCancel>
  <Button variant="destructive">Eliminar</Button>
</div>
```

**¿Por qué AlertDialogFooter?**:
- Alineación automática a la derecha en desktop (`sm:justify-end`)
- Stacking vertical en móvil (`flex-col-reverse`)
- Espaciado consistente (`sm:space-x-2`)

### 11.4 Nomenclatura para Acciones

**Títulos de Dialogs**:
```typescript
// ✅ CORRECTO - Siempre "Agregar"
<DialogTitle>Agregar Empresa</DialogTitle>
<DialogTitle>Agregar Usuario</DialogTitle>
<DialogTitle>Agregar Rol</DialogTitle>

// ❌ INCORRECTO
<DialogTitle>Nueva Empresa</DialogTitle>
<DialogTitle>Crear Usuario</DialogTitle>
```

**Botones de Acción**:
```typescript
// ✅ CORRECTO - Siempre "Guardar" (INSERT y UPDATE)
<Button type="submit">
  {isLoading ? 'Guardando...' : 'Guardar'}
</Button>

// ❌ INCORRECTO
<Button type="submit">
  {isLoading ? 'Creando...' : 'Crear'}
</Button>
```

### 11.5 Badges para Estados

```typescript
// Deshabilitado
<Badge variant="secondary">Deshabilitada</Badge>

// Activo
<Badge variant="default">Activa</Badge>

// Error
<Badge variant="destructive">Error</Badge>
```

### 11.6 Estilos de Tablas

```typescript
// Header de tabla
<div className="bg-gray-900 text-white px-6 py-3">
  <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
    <span className="font-medium">Usuario</span>
    <span className="font-medium">Email</span>
    <span className="font-medium">Roles</span>
  </div>
</div>

// Filas de tabla
<div className="bg-white border-b border-gray-200 px-6 py-4 hover:bg-gray-50">
  <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
    <span>{user.fullName}</span>
    <span>{user.email}</span>
    <span>{user.rolesCount}</span>
  </div>
</div>
```

---

## 12. Errores Comunes a Evitar

### 12.1 Base de Datos

❌ **Error**: Insertar sin poblar relatedObjects
```typescript
// ❌ INCORRECTO
await insert([{
  profileId: userId,
  roleId: roleId,
  // relatedObjects: ??? ← FALTA
}])
```

✅ **Correcto**:
```typescript
await insert([{
  profileId: userId,
  profileEmail: user.email,      // ✅ Para relatedObjects
  roleId: roleId,
  roleName: role.name,            // ✅ Para relatedObjects
}])
```

---

❌ **Error**: Pensar que enabled=false es borrado completo
```typescript
// enabled=false todavía mantiene el registro visible en grillas admin
await updateStatus({ profileId, roleIds, enabled: false })
// El registro SIGUE EXISTIENDO
```

✅ **Correcto**: Entender la diferencia
```typescript
// Para ocultar completamente (borrado lógico)
await update({ id, set: { visible: false } })

// Para deshabilitar pero mantener visible en admin
await update({ id, set: { enabled: false } })
```

---

❌ **Error**: Olvidar PRIMARY KEY en tablas heredadas
```sql
-- ❌ pg_graphql NO expondrá esta tabla
CREATE TABLE user_roles (...) INHERITS (sysEnts);
```

✅ **Correcto**:
```sql
-- ✅ pg_graphql expondrá esta tabla
CREATE TABLE user_roles (...) INHERITS (sysEnts);
ALTER TABLE user_roles ADD PRIMARY KEY (id);
```

### 12.2 Frontend

❌ **Error**: Dialogs sin bg-white
```typescript
// ❌ Fondo transparente/roto
<DialogContent className="sm:max-w-md">
```

✅ **Correcto**:
```typescript
// ✅ Fondo blanco explícito
<DialogContent className="sm:max-w-md bg-white">
```

---

❌ **Error**: No validar email/nombre en INSERT
```typescript
// ❌ relatedObjects será NULL
const insertInputs = rolesToInsert.map(roleId => ({
  profileId: user.id,
  roleId: roleId,
  // profileEmail: ??? ← FALTA
  // roleName: ??? ← FALTA
}))
```

✅ **Correcto**:
```typescript
// ✅ relatedObjects completo
const roleNamesMap = new Map(roles.map(r => [r.id, r.name]))

const insertInputs = rolesToInsert.map(roleId => ({
  profileId: user.id,
  profileEmail: user.email,
  roleId: roleId,
  roleName: roleNamesMap.get(roleId) || '',
}))
```

---

❌ **Error**: Olvidar refetch después de mutación
```typescript
// ❌ UI desincronizada
await insert(inputs)
onOpenChange(false)  // Cierra dialog sin refetch
```

✅ **Correcto**:
```typescript
// ✅ UI actualizada
await insert(inputs)
onRolesUpdated()     // ← Refetch antes de cerrar
onOpenChange(false)
```

---

❌ **Error**: No usar fetchAllByProfile en dialogs
```typescript
// ❌ Solo obtiene enabled, no detecta disabled
const existingRoles = await fetchByProfile(user.id)
```

✅ **Correcto**:
```typescript
// ✅ Obtiene todos (enabled y disabled)
const existingRoles = await fetchAllByProfile(user.id)
```

---

❌ **Error**: Mostrar disabled en selectores
```typescript
// ❌ Usuario puede seleccionar empresas deshabilitadas
const companies = allCompanies  // Incluye enabled y disabled
```

✅ **Correcto**:
```typescript
// ✅ Solo mostrar habilitadas en selectores
const companies = allCompanies.filter(c => c.enabled)

// ✅ Excepto las ya asociadas (mostrar con badge)
const displayCompanies = [
  ...companies.filter(c => c.enabled),
  ...companies.filter(c => !c.enabled && selectedIds.includes(c.id))
]
```

### 12.3 GraphQL

❌ **Error**: Olvidar JSON.stringify en relatedObjects
```typescript
// ❌ GraphQL rechazará esto
relatedObjects: {
  profiles: email,
  roles: name
}
```

✅ **Correcto**:
```typescript
// ✅ SIEMPRE stringify para JSONB
relatedObjects: JSON.stringify({
  profiles: email,
  roles: name
})
```

---

❌ **Error**: Updates duplicados (ejecutar update en registros ya en ese estado)
```typescript
// ❌ Actualiza roles ya habilitados a enabled=true (redundante)
const rolesToEnable = selectedRoleIds.filter(roleId =>
  existingRoleIds.includes(roleId)  // ← Incluye ya habilitados
)
```

✅ **Correcto**:
```typescript
// ✅ Solo actualizar los que realmente cambian de estado
const rolesToEnable = selectedRoleIds.filter(roleId => {
  const existing = existingRoles.find(r => r.role_id === roleId)
  return existing && !existing.enabled  // ← Solo deshabilitados
})
```

---

## 13. Checklist para Nueva Feature

### 13.1 Base de Datos

- [ ] Crear tabla heredando de `sysEnts` si es entidad principal
- [ ] Agregar `PRIMARY KEY (id)` explícitamente para pg_graphql
- [ ] Si es tabla de relación M:N, incluir campo `relatedObjects JSONB`
- [ ] Crear índices en FKs y campos de búsqueda
- [ ] Agregar trigger `audit_log_trigger` para auditoría
- [ ] Crear políticas RLS (SELECT, INSERT, UPDATE, DELETE)
- [ ] Si tiene relatedObjects, crear migración para poblar registros existentes

### 13.2 Frontend - Hooks

- [ ] Crear `use[Entity].ts` para queries (GET)
  - useState para data, isLoading, error
  - useEffect para fetch inicial
  - Función refetch exportada
- [ ] Crear `useMutate[Entity].ts` para mutaciones (CUD)
  - Funciones: insert, update, updateStatus, remove
  - Incluir relatedObjects en INSERT si aplica
  - Estados de isLoading y error

### 13.3 Frontend - Components

- [ ] Crear `[entity]-table.tsx` (tabla principal)
- [ ] Crear `[entity]-dialog.tsx` (agregar/editar)
- [ ] Crear `delete-[entity]-dialog.tsx` (confirmación)
- [ ] Si tiene relaciones M:N:
  - [ ] Crear `manage-[entity]-[relation]-dialog.tsx`
  - [ ] Implementar lógica de fetchAllBy para detectar disabled
  - [ ] Calcular correctamente: toInsert, toEnable, toDisable
  - [ ] Advertencia si quita disabled (opcional)

### 13.4 Frontend - Types

- [ ] Crear interfaces en `types/[entity].types.ts`
  - Interface principal (Entity)
  - Interface Insert (EntityInsertInput)
  - Interface Update (EntityUpdateInput)
  - Interface relatedObjects si aplica

### 13.5 Frontend - Routing

- [ ] Agregar ruta en `app/dashboard/[entity]/page.tsx`
- [ ] Re-exportar página desde `features/[entity]/pages/`
- [ ] Agregar entrada en Sidebar
- [ ] Agregar mapeo en `dashboard/layout.tsx` para header

### 13.6 Testing

- [ ] Test unitario de hooks
- [ ] Test de componentes (render, interacciones)
- [ ] Test E2E con Playwright (flujo completo)
- [ ] Verificar en navegador: crear, editar, deshabilitar, eliminar

---

## 14. Prompts Reutilizables

### 14.1 Agregar Nueva Entidad Simple

```
Necesito agregar gestión de [ENTIDAD_PLURAL] al sistema.

REQUISITOS:
1. BD: Crea tabla '[entidad_plural]' heredando de sysEnts
   - Campos: name (TEXT UNIQUE), description (TEXT), [otros campos]
   - PRIMARY KEY explícita: ALTER TABLE [entidad_plural] ADD PRIMARY KEY (id)
   - RLS: Todos autenticados leen/crean, solo super admin elimina
   - Trigger: audit_log_trigger para auditoría

2. Frontend: Hook useUse[Entidad_Plural]()
   - Patrón: features/[entidad_plural]/hooks/use[entidad_plural].ts
   - Estructura: useState, useEffect, fetchData, return { data, isLoading, error, refetch }
   - GraphQL Query con [entidad_plural]Collection

3. Frontend: Hook useMutate[Entidad]()
   - Patrón: features/[entidad_plural]/hooks/useMutate[entidad].ts
   - Funciones: insert, update, updateEnabled, remove
   - GraphQL Mutations: INSERT, UPDATE, DELETE

4. Frontend: Components
   - [entidad_plural]-table.tsx: Tabla con búsqueda, filtros, acciones
   - [entidad]-dialog.tsx: Form para agregar/editar
   - delete-[entidad]-dialog.tsx: Confirmación de eliminación
   - hide-[entidad]-dialog.tsx: Confirmación de deshabilitar

5. UI/UX:
   - Dialogs con bg-white
   - Botón "Agregar [Entidad]" en header
   - Badges para estado enabled/disabled
   - Botón eliminar con variant="destructive"

6. Routing:
   - app/dashboard/[entidad_plural]/page.tsx
   - Sidebar: Link a /dashboard/[entidad_plural]
   - dashboard/layout.tsx: Mapear ruta a header info

Sigue la arquitectura Feature-First:
- features/[entidad_plural]/hooks/
- features/[entidad_plural]/components/
- features/[entidad_plural]/types/

REFERENCIAS:
- Ver features/companies/ como ejemplo
- Ver features/roles/ como ejemplo
```

### 14.2 Agregar Relación M:N con relatedObjects

```
Necesito crear relación M:N entre [ENTIDAD_A] y [ENTIDAD_B].

REQUISITOS:
1. BD: Tabla '[entidad_a]_[entidad_b]'
   - Hereda de sysEnts
   - Campos: [entidad_a]_id UUID, [entidad_b]_id UUID
   - Campo relatedObjects JSONB con estructura:
     {
       "[entidad_a_plural]": "[campo_busqueda_a]",
       "[entidad_b_plural]": "[campo_busqueda_b]"
     }
   - UNIQUE([entidad_a]_id, [entidad_b]_id)
   - PRIMARY KEY (id)
   - FKs con CASCADE
   - RLS: Todos autenticados CRUD, solo super admin DELETE

2. Migración para poblar relatedObjects:
   ```sql
   UPDATE [entidad_a]_[entidad_b] ab
   SET "relatedObjects" = jsonb_build_object(
     '[entidad_a_plural]', a.[campo_busqueda_a],
     '[entidad_b_plural]', b.[campo_busqueda_b]
   )
   FROM [entidad_a] a, [entidad_b] b
   WHERE ab.[entidad_a]_id = a.id
     AND ab.[entidad_b]_id = b.id
     AND ab."relatedObjects" IS NULL;
   ```

3. Hook useMutate[EntidadA][EntidadB]()
   - fetchByA(aId): Obtener solo enabled
   - fetchAllByA(aId): Obtener todos (enabled + disabled)
   - insert(inputs): Incluir relatedObjects con JSON.stringify()
   - updateStatus({ aId, bIds, enabled }): Enable/disable
   - remove(ids): DELETE físico (solo super admin)

4. Dialog Manage[EntidadA][EntidadB_Plural]
   - useEffect: Cargar con fetchAllByA al abrir
   - Checkboxes para cada [entidad_b]
   - Categorizar: enabled, disabledAssociated, disabledNotAssociated
   - Mostrar solo: enabled + disabledAssociated
   - handleSave:
     * fetchAllByA para obtener existentes
     * Calcular toInsert, toEnable, toDisable
     * toEnable: Solo existentes DISABLED que ahora se seleccionan
     * toDisable: Solo existentes ENABLED que ahora se deseleccionan
     * Si hay disabled en toDisable → mostrar WarningDialog
   - Incluir profileEmail y roleName en INSERT

5. Warning Dialog (opcional)
   - AlertDialog si usuario intenta quitar asociación disabled
   - Mensaje: "Los [entidad_b_plural] deshabilitados que quites no podrán ser reasignados"
   - Botones: Cancelar, Confirmar

REFERENCIAS:
- features/users/hooks/useMutateUserRole.ts
- features/users/components/manage-user-roles-dialog.tsx
- features/users/components/disabled-companies-warning-dialog.tsx
```

### 14.3 Agregar Sistema de Auditoría a Tabla Nueva

```
Necesito habilitar auditoría automática para tabla '[tabla]'.

REQUISITOS:
1. Trigger:
   ```sql
   CREATE TRIGGER audit_log_trigger
   BEFORE UPDATE ON [tabla]
   FOR EACH ROW EXECUTE FUNCTION audit_log_before_update();
   ```

2. Frontend: Hook useAuditLogs()
   - Filtro por nameTable='[tabla]'
   - Paginación
   - Búsqueda por userIdentifier
   - Ordenar por updated DESC

3. Frontend: Component AuditLogsTable
   - Columnas: Fecha, Usuario, Tabla, Objeto, Acción
   - Click en fila → AuditDiffDialog
   - Filtros: tabla, usuario, rango de fechas

4. Frontend: Component AuditDiffDialog
   - Mostrar beforeUpdate, afterUpdate, diff
   - Diff en formato legible:
     * Campo: "valor_anterior" → "valor_nuevo"
   - Color: rojo (eliminado), verde (agregado), amarillo (modificado)

REFERENCIAS:
- features/audit/hooks/useAuditLogs.ts
- features/audit/components/audit-logs-table.tsx
- features/audit/components/audit-diff-dialog.tsx
```

### 14.4 Migrar Feature Existente a Feature-First

```
Necesito refactorizar [FEATURE] siguiendo arquitectura Feature-First.

PASOS:
1. Crear estructura de carpetas:
   ```
   features/[feature]/
   ├── hooks/
   ├── components/
   ├── types/
   ├── services/ (opcional)
   └── pages/
   ```

2. Mover archivos:
   - Componentes: components/ → features/[feature]/components/
   - Hooks: hooks/ → features/[feature]/hooks/
   - Tipos: types/ → features/[feature]/types/
   - Páginas completas: → features/[feature]/pages/

3. Actualizar imports:
   - Buscar todos los imports de la feature
   - Cambiar a rutas relativas o alias @/features/[feature]/...

4. Actualizar app/[feature]/page.tsx:
   ```typescript
   import { [Feature]Page } from '@/features/[feature]/pages'
   export default [Feature]Page
   ```

5. Verificar:
   - Todos los imports resuelven correctamente
   - No hay dependencias circulares
   - Tests siguen funcionando

REFERENCIAS:
- features/users/ (ejemplo completo)
- features/companies/ (ejemplo completo)
```

---

## 15. Comandos Útiles

### 15.1 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

### 15.2 Base de Datos

```bash
# Aplicar migraciones
supabase db push

# Aplicar migración específica
supabase db push --file supabase/migrations/015_*.sql

# Backup de BD
supabase db dump -f supabase/backups/backup-$(date +%Y-%m-%d).sql

# Resetear BD local (¡CUIDADO!)
supabase db reset
```

### 15.3 Testing

```bash
# Ejecutar tests
npm run test

# Tests en watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Linting
npm run lint

# Type checking
npm run typecheck
```

### 15.4 Git

```bash
# Commit con Conventional Commits
npm run commit

# Pre-commit hook
npm run pre-commit
```

---

## 16. Referencias y Documentación

### 16.1 Documentación Técnica

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **GraphQL**: https://graphql.org/learn/
- **Radix UI**: https://www.radix-ui.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zod**: https://zod.dev/

### 16.2 Patrones Implementados

- **Feature-First Architecture**: Organización por features autocontenidas
- **Database Inheritance**: PostgreSQL table inheritance para DRY
- **Row Level Security**: Seguridad a nivel de BD
- **Denormalization**: relatedObjects para performance
- **Automatic Auditing**: Triggers automáticos para auditoría
- **GraphQL First**: Preferir GraphQL sobre REST cuando es posible

### 16.3 Recursos del Proyecto

- **CLAUDE.md**: Guía rápida de desarrollo
- **docs/**: Documentación adicional
- **supabase/migrations/**: Historial de cambios en BD
- **supabase/backups/**: Backups de BD

---

## 17. Conclusión

Este documento contiene todo el conocimiento arquitectónico necesario para:

1. ✅ Replicar la estructura en otro proyecto
2. ✅ Continuar el desarrollo de forma consistente
3. ✅ Entrenar nuevos desarrolladores rápidamente
4. ✅ Generar prompts efectivos para IA
5. ✅ Mantener calidad y coherencia en el código

### Principios Fundamentales

1. **Feature-First**: Cada feature es autocontenida y portable
2. **DRY con Herencia**: PostgreSQL inheritance evita repetición
3. **Security by Default**: RLS policies en toda la BD
4. **Audit Everything**: Triggers automáticos para trazabilidad
5. **Performance First**: relatedObjects para queries rápidas
6. **GraphQL Preferred**: Usar GraphQL cuando sea posible
7. **Type Safety**: TypeScript estricto en todo el código
8. **Consistent UI**: Patrones de UI/UX predefinidos

---

**Autor**: Documentación generada por análisis exhaustivo del proyecto
**Fecha**: 2026-01-10
**Versión**: 1.0.0
**Proyecto**: App Blank Solve Seeker
