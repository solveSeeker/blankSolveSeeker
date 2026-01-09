# Diagrama de Arquitectura Backend - Post Refactorización

## 🏗️ Arquitectura de 3 Capas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Next.js)                        │
│                                                                         │
│  Components: role-dialog, company-dialog, users-table, etc.            │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          HOOKS LAYER (Custom Hooks)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  useRoles    │  │ useCompanies │  │ useProfiles  │  │ useAuditLogs│ │
│  │  (API Route) │  │  (GraphQL)   │  │  (GraphQL)   │  │  (GraphQL)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │useMutateRole │  │useMutateComp │  │useUserRoles  │                 │
│  │  (GraphQL)   │  │  (GraphQL)   │  │  (GraphQL)   │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                         │
└────────────┬────────────┬────────────┬────────────┬────────────────────┘
             │            │            │            │
             ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────┐    ┌────────────────────┐    ┌───────────────┐ │
│  │   GraphQL API     │    │  Next.js API Routes│    │ Supabase Auth │ │
│  │   (pg_graphql)    │    │  (/api/*)          │    │               │ │
│  │                   │    │                    │    │               │ │
│  │ - Queries         │    │ - GET /api/roles   │    │ - signIn      │ │
│  │ - Mutations       │    │ - POST /api/admin/ │    │ - signUp      │ │
│  │ - Filters         │    │   users            │    │ - signOut     │ │
│  │ - Joins           │    │ - PUT/DELETE users │    │ - getUser     │ │
│  │ - Pagination      │    │                    │    │               │ │
│  └─────────┬─────────┘    └──────────┬─────────┘    └───────┬───────┘ │
│            │                         │                      │         │
│            └─────────────────────────┴──────────────────────┘         │
│                                      │                                │
│                                      ▼                                │
│                          ┌────────────────────┐                       │
│                          │   Supabase SDK     │                       │
│                          │                    │                       │
│                          │ - Direct queries   │                       │
│                          │ - Row Level Sec    │                       │
│                          │ - Realtime (future)│                       │
│                          └──────────┬─────────┘                       │
└─────────────────────────────────────┼─────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  roles   │  │companies │  │ profiles │  │ auditLog │  │auth.users│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘  └─────────┘ │
│       │             │             │                                   │
│  ┌────▼──────┐  ┌──▼────────┐                                        │
│  │user_roles │  │user_comp  │                                        │
│  └───────────┘  └───────────┘                                        │
│                                                                         │
│  Triggers: auditLogBeforeUpdate, auditLogBeforeInsert                  │
│  RLS Policies: Activas en todas las tablas                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos por Módulo

### 1️⃣ ROLES - Patrón Híbrido

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROLES MODULE                               │
└─────────────────────────────────────────────────────────────────┘

QUERIES (GET):
Frontend → useRoles hook → fetch('/api/roles') → API Route
                                                      ↓
                                            Supabase SDK .from('roles')
                                                      ↓
                                             Filter by visible (RLS)
                                                      ↓
                                            PostgreSQL roles table
                                                      ↓
                                            Return roles[] ← ← ← ←

MUTATIONS (INSERT/UPDATE/DELETE):
Frontend → useMutateRole hook → GraphQL Client
                                      ↓
                              pg_graphql endpoint
                                      ↓
                        insertIntorolesCollection
                        updaterolesCollection
                        deleteFromrolesCollection
                                      ↓
                                 RLS Policies
                                      ↓
                            PostgreSQL roles table
                                      ↓
                            Trigger: auditLogBeforeUpdate
                                      ↓
                            Return mutated role ← ← ← ←
```

**Razón del patrón híbrido**: API Route permite lógica server-side para filtrar por `visible` según tipo de usuario antes de query.

---

### 2️⃣ COMPANIES - 100% GraphQL

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPANIES MODULE                             │
└─────────────────────────────────────────────────────────────────┘

QUERIES:
Frontend → useCompanies hook → GraphQL Client
                                      ↓
                              pg_graphql endpoint
                                      ↓
                           companiesCollection query
                                      ↓
                        Filter by visible (client-side)
                                      ↓
                                 RLS Policies
                                      ↓
                           PostgreSQL companies table
                                      ↓
                            Return companies[] ← ← ← ←

MUTATIONS:
Frontend → useMutateCompany hook → GraphQL Client
                                         ↓
                                 pg_graphql endpoint
                                         ↓
                       insertIntocompaniesCollection
                       updatecompaniesCollection
                       deleteFromcompaniesCollection
                                         ↓
                                    RLS Policies
                                         ↓
                              PostgreSQL companies table
                                         ↓
                           Trigger: auditLogBeforeUpdate
                                         ↓
                            Return mutated company ← ← ← ←
```

---

### 3️⃣ USERS - Patrón Mixto Complejo

```
┌─────────────────────────────────────────────────────────────────┐
│                     USERS MODULE                                │
└─────────────────────────────────────────────────────────────────┘

QUERIES (GraphQL):
┌──────────────────────────────────────────────────────────────┐
│ useProfiles                                                  │
│ useUserRoles                                                 │
│ useUserCompanies                                             │
│ useCurrentUserProfile                                        │
└──────────────────────────────────────────────────────────────┘
                    ↓
          GraphQL Client → pg_graphql
                    ↓
         profilesCollection query
         userRolesCollection query (join roles)
         userCompaniesCollection query (join companies)
                    ↓
              RLS Policies
                    ↓
         PostgreSQL (profiles, user_roles, user_companies)
                    ↓
           Return data[] ← ← ← ←

MUTATIONS (GraphQL - manage-user-roles-dialog):
Frontend → GraphQL Client
              ↓
    insertIntouserRolesCollection
    updateuserRolesCollection (enable/disable)
              ↓
        RLS Policies
              ↓
  PostgreSQL user_roles table
              ↓
    Return mutated data ← ← ← ←

MUTATIONS (Supabase SDK - manage-user-companies-dialog):
Frontend → createClient()
              ↓
    supabase.from('user_companies')
              ↓
         INSERT/DELETE
              ↓
        RLS Policies
              ↓
  PostgreSQL user_companies table
              ↓
    Return success ← ← ← ←

MUTATIONS (API Routes - user creation/update):
Frontend → fetch('/api/admin/users')
              ↓
       Next.js API Route
              ↓
    Supabase Admin SDK
              ↓
  auth.users + profiles tables
              ↓
    Return user data ← ← ← ←
```

---

### 4️⃣ AUDIT - 100% GraphQL Read-Only

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUDIT MODULE                                 │
└─────────────────────────────────────────────────────────────────┘

Frontend → useAuditLogs hook → GraphQL Client
                                      ↓
                              pg_graphql endpoint
                                      ↓
                     auditLogCollection query
                     - Pagination (first, offset)
                     - Filters (nameTable, userIdentifier)
                     - Ordering (updated DESC)
                     - totalCount (server-side)
                                      ↓
                                 RLS Policies
                                      ↓
                           PostgreSQL auditLog table
                                      ↓
                       Return { edges[], totalCount } ← ← ← ←
                                      ↓
                    Parse diff field (JSON string → Object)
                                      ↓
                            Display in UI
```

---

## 📊 Comparativa de Tecnologías

### GraphQL (pg_graphql) vs Supabase SDK

| Aspecto | GraphQL | Supabase SDK |
|---------|---------|--------------|
| **Joins** | ✅ Nativos en query | ⚠️ Requiere múltiples queries o PostgREST hints |
| **Pagination** | ✅ `first`, `offset`, `totalCount` | ⚠️ `range()` + query separado para count |
| **Filters** | ✅ `filter: { field: { ilike } }` | ✅ `.ilike()`, `.eq()`, etc |
| **Type Safety** | ✅ TypeScript interfaces generadas | ✅ TypeScript con tipos generados |
| **RLS** | ✅ Respeta políticas | ✅ Respeta políticas |
| **Performance** | ✅ Query único optimizado | ⚠️ Múltiples queries para joins |
| **Learning Curve** | ⚠️ Sintaxis GraphQL + pg_graphql specific | ✅ Familiar para devs JS |
| **Debugging** | ⚠️ Errores genéricos JSON | ✅ Errores específicos de Postgres |

---

## 🎯 Decisiones de Arquitectura

### ¿Por qué GraphQL para Mutations?

1. **Type Safety**: Interfaces TypeScript garantizan datos correctos
2. **Atomic Operations**: Una sola request para operación compleja
3. **Consistency**: Patrón uniforme para todos los módulos
4. **Audit Trail**: Triggers Postgres funcionan igual que con SDK
5. **RLS Integration**: Respeta row-level security automáticamente

### ¿Por qué mantener Supabase SDK en algunos casos?

1. **Auth Operations**: `supabase.auth.*` es la API oficial
2. **Admin Operations**: Crear usuarios requiere Admin SDK
3. **Simple Operations**: UPDATE de un campo no justifica GraphQL
4. **Legacy Code**: Migración incremental reduce riesgo

### ¿Por qué API Routes en algunos casos?

1. **Server-Side Logic**: Filtrado dinámico por tipo de usuario
2. **Security**: Ocultar lógica de negocio del cliente
3. **Admin Operations**: Operaciones privilegiadas (crear auth.users)
4. **Rate Limiting**: Control centralizado (futuro)

---

## 🚀 Performance Optimizations

### GraphQL Queries

```typescript
// ✅ BIEN: Un query con join
const data = await client.request(gql`
  query GetUserRoles {
    userRolesCollection {
      edges {
        node {
          id
          role {  # Join nativo
            name
            description
          }
        }
      }
    }
  }
`)

// ❌ MAL: Múltiples queries
const userRoles = await supabase.from('user_roles').select('*')
const roles = await supabase.from('roles').select('*').in('id', userRoleIds)
```

### Pagination

```typescript
// ✅ BIEN: Server-side totalCount
const { auditLogCollection: { edges, totalCount } } = await client.request(gql`
  query GetAuditLogs($first: Int!, $offset: Int!) {
    auditLogCollection(first: $first, offset: $offset) {
      totalCount  # Un solo query!
      edges { node { id } }
    }
  }
`)

// ❌ MAL: Query separado para count
const { data } = await supabase.from('audit_log').select('*').range(0, 9)
const { count } = await supabase.from('audit_log').select('*', { count: 'exact', head: true })
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Frontend Validation                               │
│  - Form validation (required fields, formats)               │
│  - Client-side permissions (show/hide UI elements)          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: API Layer                                         │
│  - JWT validation (Supabase Auth)                           │
│  - Role-based access (sysAdmin checks)                      │
│  - Rate limiting (future)                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Database RLS                                      │
│  - Row Level Security policies                              │
│  - auth.uid() verification                                  │
│  - Tenant isolation (company_id, enabled flags)             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Audit Trail                                       │
│  - Before/After state capture                               │
│  - User identification (email, uid)                         │
│  - Timestamp tracking                                       │
│  - Diff calculation (JSON changes)                          │
└─────────────────────────────────────────────────────────────┘
```

---

**Documento complementario a**: `backend-api-analysis.md`
**Última actualización**: 2026-01-04 03:20 UTC
