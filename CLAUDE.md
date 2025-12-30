# Proyecto: appSolveSeeker (App Blank Solve Seeker)

## 📝 Configuración del Proyecto

### Puerto de Desarrollo
- **Puerto**: `4855`
- **Significado**: `4pp 8lank 5olve 5eeker` (4=A, 8=B, 5=S, 5=S)
- **URL Local**: http://localhost:4855

Este puerto fue elegido como identificador memorable del proyecto usando leet speak numérico.

## 🎯 Principios de Desarrollo (Context Engineering)

### Design Philosophy
- **KISS**: Keep It Simple, Stupid - Prefiere soluciones simples
- **YAGNI**: You Aren't Gonna Need It - Implementa solo lo necesario  
- **DRY**: Don't Repeat Yourself - Evita duplicación de código
- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion

### Descripción del Proyecto
[Breve descripción de qué hace tu proyecto y sus características principales]

## 🏗️ Tech Stack & Architecture

### Core Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Next.js 16 (App Router)
- **Base de Datos**: PostgreSQL/Supabase
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library
- **Schema Validation**: Zod

### Architecture: Feature-First

**Enfoque: Arquitectura Feature-First optimizada para desarrollo asistido por IA**

Este proyecto usa una arquitectura **Feature-First** donde cada feature es independiente y contiene toda la lógica relacionada (componentes, hooks, servicios, tipos).

#### Frontend: Feature-First
```
app/                          # Next.js App Router
├── auth/                     # Rutas de autenticación
│   └── login/               # Login page (usa LoginPage de features/auth)
│       └── page.tsx         # Re-exporta LoginPage
│   └── signout/             # Signout route
│       └── route.ts         # API route para cerrar sesión
│
├── dashboard/               # Dashboard de gestión
│   ├── layout.tsx           # Layout con Sidebar y Header
│   ├── page.tsx             # Redirect a /dashboard/users
│   └── users/               # Gestión de usuarios
│       └── page.tsx         # Página de usuarios

│
├── layout.tsx               # Layout root
└── page.tsx                 # Home page (redirect a /dashboard)

features/                     # 🎯 Organizadas por funcionalidad
├── auth/                    # Feature: Autenticación
│   ├── components/          # LoginForm, RegisterForm
│   ├── pages/               # LoginPage (página completa con layout)
│   ├── hooks/               # useAuth, etc.
│   ├── services/            # authService.ts
│   ├── types/               # User, Session, etc.
│   └── store/               # authStore.ts
│
├── users/                   # Feature: Usuarios
│   ├── hooks/               # useProfiles, useUserRoles (GraphQL)
│   ├── types/               # user.types.ts
│   └── services/            # userService.ts (si es necesario)
│
└── [feature]/               # Otras features...

shared/                       # Código reutilizable
├── components/              # Sidebar, Button, Card, etc.
├── hooks/                   # useDebounce, useLocalStorage, etc.
├── stores/                  # appStore.ts, userStore.ts
├── types/                   # api.ts, domain.ts
├── utils/                   # Funciones utilitarias
├── lib/                     # Configuraciones
│   ├── supabase/           # client.ts, server.ts
│   └── graphql/            # client.ts (GraphQL client)
├── constants/               # Constantes de la app
└── assets/                  # Imágenes, iconos, etc.
```

#### Separación de Responsabilidades: `app/` vs `features/`

**🎯 Regla Clave**: `app/` solo contiene rutas, `features/` contiene la lógica.

- **`app/`**: Define las rutas de Next.js y re-exporta páginas desde `features/`
  - Ejemplo: `app/auth/login/page.tsx` → `import { LoginPage } from '@/features/auth/pages'`
  - Solo routing, NO lógica de negocio

- **`features/`**: Contiene toda la lógica, componentes y páginas
  - Ejemplo: `features/auth/pages/LoginPage.tsx` → Página completa con layout y componentes
  - Ejemplo: `features/auth/components/LoginForm.tsx` → Formulario reutilizable

- **`shared/`**: Código compartido entre múltiples features
  - Ejemplo: `shared/components/Sidebar.tsx` → Usado en layout de admin
  - Ejemplo: `shared/lib/graphql/client.ts` → Cliente GraphQL compartido

**¿Por qué?** Esta separación permite que las features sean **completamente portables** y **reutilizables** en diferentes rutas sin duplicar código.

#### Patrón de Headers en Módulos del Dashboard

**🎯 Regla Importante**: Los headers de los módulos del dashboard se definen en `app/dashboard/layout.tsx`, NO en los componentes individuales.

**Estructura correcta**:
1. **Layout del Dashboard** (`app/dashboard/layout.tsx`):
   - Define el header con icono, título y descripción para cada ruta
   - Usa `usePathname()` para detectar la ruta actual
   - Renderiza el header en la barra superior del main content

2. **Componentes de Features** (ej: `features/users/components/users-table.tsx`):
   - NO incluyen header propio
   - Solo contienen la funcionalidad específica (búsqueda, tabla, acciones)

**Ejemplo de implementación en layout.tsx**:
```typescript
const getPageInfo = () => {
  if (pathname.includes('/users')) {
    return {
      title: 'Usuarios',
      description: 'Gestiona los usuarios y sus roles en el sistema',
      icon: <UserCog className="w-5 h-5" />
    }
  }
  if (pathname.includes('/audit')) {
    return {
      title: 'Auditoría',
      description: 'Registro de cambios en el sistema',
      icon: <ScrollText className="w-5 h-5" />
    }
  }
  // ...más módulos
}

// Renderizado del header:
<div className="flex items-center h-16 px-8 border-b border-gray-200 bg-white">
  {pageInfo.title && (
    <div className="flex items-center gap-3">
      {pageInfo.icon && <div className="text-gray-700">{pageInfo.icon}</div>}
      <h1 className="text-lg font-semibold text-gray-900">{pageInfo.title}</h1>
      {pageInfo.description && (
        <>
          <span className="text-gray-400">-</span>
          <p className="text-sm text-gray-600">{pageInfo.description}</p>
        </>
      )}
    </div>
  )}
</div>
```

**¿Por qué?**: Esto mantiene la consistencia visual entre todos los módulos y centraliza la configuración de headers en un solo lugar. Evita duplicación de código y facilita cambios futuros.

### Estructura de Proyecto Completa
```
proyecto/
├── src/
│   ├── app/                 # Next.js routes
│   ├── features/            # Features por funcionalidad
│   └── shared/              # Código reutilizable
├── public/                  # Archivos estáticos
├── supabase/                # Migraciones de BD
│   └── migrations/
├── .claude/                 # Configuración Claude Code
├── docs/                    # Documentación técnica
├── package.json
├── tsconfig.json
└── next.config.js
```

> **🤖 ¿Por qué Feature-First?**
>
> Esta estructura fue diseñada específicamente para **desarrollo asistido por IA**. La organización clara por features permite que los AI assistants:
> - **Localicen rápidamente** todo el código relacionado con una feature en un mismo lugar
> - **Entiendan el contexto completo** sin navegar múltiples directorios
> - **Mantengan la separación de responsabilidades** al generar código nuevo
> - **Escalen el proyecto** añadiendo features sin afectar el código existente
> - **Generen código consistente** siguiendo patrones establecidos por feature
>
> *La IA puede trabajar de forma más efectiva cuando la información está organizada siguiendo principios claros y predecibles.*

## 🔌 MCPs Clave (Backend as a Service)

### Chrome DevTools MCP - "Ojos" para el Agente
Te da visibilidad del navegador para desarrollo visual.

| Comando | Uso |
|---------|-----|
| `take_screenshot` | Captura visual de la página |
| `take_snapshot` | Estado del DOM (árbol de accesibilidad) |
| `click` / `fill` | Interactuar con elementos |
| `list_console_messages` | Ver errores de consola |
| `list_network_requests` | Debug de llamadas API/fetch |
| `resize_page` | Probar responsive (mobile/tablet/desktop) |

**Cuándo usar**: Bucle agéntico visual → código → screenshot → comparar → iterar hasta pixel-perfect.

### Supabase MCP - Acceso Directo a BDD
Interactúa con PostgreSQL sin CLI ni migraciones manuales.

| Comando | Uso |
|---------|-----|
| `execute_sql` | SELECT, INSERT, UPDATE, DELETE |
| `apply_migration` | CREATE TABLE, ALTER, índices, RLS |
| `list_tables` | Ver estructura de BD |
| `get_logs` | Debug de auth/postgres/edge-functions |
| `get_advisors` | Detectar tablas sin RLS (seguridad) |

**Cuándo usar**: Siempre que necesites consultar o modificar la base de datos. NO uses CLI ni apliques migraciones manualmente.

> Ver `.claude/prompts/supabase-mcp-baas.md` para guía completa.

## 🛠️ Comandos Importantes

### Development
- `npm run dev` - Servidor de desarrollo (auto-detecta puerto 3000-3006)
- `npm run build` - Build para producción
- `npm run preview` - Preview del build

### Quality Assurance
- `npm run test` - Ejecutar tests
- `npm run test:watch` - Tests en modo watch
- `npm run test:coverage` - Coverage report
- `npm run lint` - ESLint
- `npm run lint:fix` - Fix automático de linting
- `npm run typecheck` - Verificación de tipos TypeScript

### Git Workflow
- `npm run commit` - Commit con Conventional Commits
- `npm run pre-commit` - Hook de pre-commit

## 📝 Convenciones de Código

### File & Function Limits
- **Archivos**: Máximo 500 líneas
- **Funciones**: Máximo 50 líneas
- **Componentes**: Una responsabilidad clara

### Naming Conventions
- **Variables/Functions**: `camelCase`
- **Components**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case.extension`
- **Folders**: `kebab-case`

### UI/UX Standards

#### Diálogos (Modals)
**🎯 Regla CRÍTICA**: TODOS los diálogos (Dialog y AlertDialog) SIEMPRE deben tener fondo blanco explícito con `bg-white`.

Esta regla aplica sin excepción a:
- `<DialogContent>` - Diálogos normales
- `<AlertDialogContent>` - Diálogos de alerta/confirmación

```typescript
// ✅ CORRECTO - Dialog normal
<DialogContent className="sm:max-w-md bg-white">
  {/* contenido del diálogo */}
</DialogContent>

// ✅ CORRECTO - AlertDialog
<AlertDialogContent className="sm:max-w-md bg-white">
  {/* contenido del diálogo de alerta */}
</AlertDialogContent>

// ❌ INCORRECTO - sin bg-white
<DialogContent className="sm:max-w-md">
  {/* contenido del diálogo */}
</DialogContent>

// ❌ INCORRECTO - AlertDialog sin bg-white
<AlertDialogContent className="sm:max-w-md">
  {/* contenido del diálogo de alerta */}
</AlertDialogContent>
```

**Ejemplos de implementación correcta:**
- [manage-user-companies-dialog.tsx](features/users/components/manage-user-companies-dialog.tsx) - Dialog con `bg-white`
- [disabled-companies-warning-dialog.tsx](features/users/components/disabled-companies-warning-dialog.tsx) - AlertDialog con `bg-white`

**¿Por qué?**: Mantiene consistencia visual en toda la aplicación, mejora la legibilidad del contenido y evita que los diálogos hereden colores de fondo no deseados del tema.

#### Inputs (Campos de Texto)
**🎯 Estándar de Proyecto**: Todos los inputs tienen bordes claros y cambian a oscuro al tener foco.

El componente base `Input` (`components/ui/input.tsx`) ya está configurado con estos estilos:

```typescript
// Estilos por defecto en todos los inputs:
- border-gray-200           // Borde gris claro sin foco
- focus-visible:border-gray-900  // Borde gris oscuro/negro con foco
- focus-visible:ring-0      // Sin anillo de enfoque (solo borde)
```

**NO es necesario agregar estas clases manualmente** - todos los componentes `<Input />` las heredan automáticamente.

```typescript
// ✅ CORRECTO - usa el componente sin clases adicionales
<Input
  id="fullName"
  type="text"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  placeholder="Tu nombre completo"
/>

// ❌ INNECESARIO - no repitas las clases del componente base
<Input
  className="border-gray-200 focus-visible:border-gray-900"
  // ...props
/>
```

**¿Por qué?**:
- Mantiene consistencia visual en todos los formularios
- Mejora la accesibilidad al indicar claramente qué campo está activo
- Centraliza el estilo en un solo lugar para facilitar cambios futuros
- Evita duplicación de código en cada uso de Input

#### Convención de Nombres para Acciones
**🎯 Estándar de Proyecto**: Nomenclatura consistente para acciones de INSERT en la UI.

**Regla para Títulos de Diálogos**:
- **SIEMPRE usar "Agregar"** para operaciones de inserción de registros
- **NUNCA usar** "Nueva", "Nuevo", "Crear" en títulos de diálogos

```typescript
// ✅ CORRECTO
<DialogTitle>Agregar Empresa</DialogTitle>
<DialogTitle>Agregar Usuario</DialogTitle>
<DialogTitle>Agregar Rol</DialogTitle>

// ❌ INCORRECTO
<DialogTitle>Nueva Empresa</DialogTitle>
<DialogTitle>Nuevo Usuario</DialogTitle>
<DialogTitle>Crear Rol</DialogTitle>
```

**Regla para Botones de Acción**:
- **SIEMPRE usar "Guardar"** para el botón de confirmación
- **Aplica tanto para INSERT como para UPDATE**

```typescript
// ✅ CORRECTO - Tanto para agregar como para editar
<Button type="submit">
  {isLoading ? 'Guardando...' : 'Guardar'}
</Button>

// ❌ INCORRECTO - No usar "Crear"
<Button type="submit">
  {isLoading ? 'Creando...' : 'Crear'}
</Button>
```

**Alcance**:
- **Aplica a**: Títulos de diálogos/modals SOLAMENTE
- **Módulos afectados**: TODOS (Empresas, Usuarios, Roles, Auditoría, etc.)
- **No aplica a**: Botones de navegación, enlaces, o texto descriptivo

**Ejemplos de implementación**:
- Empresas: "Agregar Empresa" + botón "Guardar"
- Usuarios: "Agregar Usuario" + botón "Guardar"
- Roles: "Agregar Rol" + botón "Guardar"

**¿Por qué?**: Mantiene consistencia lingüística en toda la aplicación, facilita la comprensión del usuario y establece un patrón claro de nomenclatura para futuras features.

#### Botones de Eliminación
**🎯 Estándar de Proyecto**: Los botones de eliminación SIEMPRE deben ser rojos y alineados a la derecha.

**Reglas**:
- **SIEMPRE usar `variant="destructive"`** en botones de eliminar
- **SIEMPRE usar `<AlertDialogFooter>`** para estructura consistente
- **NUNCA usar `<div className="flex">`** manual - usar componentes estándar
- El color rojo indica visualmente una acción destructiva
- Los botones deben estar alineados a la DERECHA en desktop

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

// ❌ INCORRECTO - Sin justify-end
<div className="flex gap-2 justify-end">
  {/* Usar AlertDialogFooter en su lugar */}
</div>
```

**¿Por qué AlertDialogFooter?**:
- Alineación automática a la derecha en desktop (`sm:justify-end`)
- Stacking vertical automático en móvil (`flex-col-reverse`)
- Espaciado consistente entre botones (`sm:space-x-2`)
- Mejor responsive sin código extra
- Mantenibilidad centralizada

**Ejemplos de implementación correcta**:
- [delete-company-dialog.tsx](features/companies/components/delete-company-dialog.tsx:75-89) ✅
- [delete-role-dialog.tsx](features/roles/components/delete-role-dialog.tsx) ✅
- [delete-user-dialog.tsx](features/users/components/delete-user-dialog.tsx) ✅
- [hide-role-dialog.tsx](features/roles/components/hide-role-dialog.tsx) ✅
- [hide-company-dialog.tsx](features/companies/components/hide-company-dialog.tsx) ✅

**¿Por qué?**: El color rojo es universalmente reconocido como advertencia para acciones irreversibles o peligrosas. La alineación a la derecha sigue el patrón estándar de UI donde el botón primario/peligroso está a la derecha. Usar `AlertDialogFooter` asegura consistencia con el sistema de diseño y mejora la UX al prevenir eliminaciones accidentales.

### Reglas de Borrado y Visibilidad de Registros

**🎯 Regla Crítica**: Control de borrado basado en usuario y tipo de operación.

#### Borrado Físico (DELETE)
- **SOLO** el usuario `solve.seeker.dev@gmail.com` puede realizar borrado físico de registros
- El borrado físico elimina permanentemente el registro de la base de datos
- Debe implementarse con confirmación explícita del usuario

```typescript
// Ejemplo de verificación para borrado físico
const canPhysicallyDelete = (userEmail: string): boolean => {
  return userEmail === 'solve.seeker.dev@gmail.com'
}

// En el componente
{canPhysicallyDelete(user.email) ? (
  <Button onClick={handlePhysicalDelete}>Eliminar</Button>
) : (
  <Button onClick={handleLogicalDelete}>Deshabilitar</Button>
)}
```

#### Borrado Lógico (Soft Delete)
- **Cualquier usuario autorizado** puede realizar borrado lógico
- El borrado lógico establece el campo `enabled` en `false`
- Los registros con `enabled: false` se mantienen en la base de datos pero se consideran inactivos

```typescript
// Ejemplo de borrado lógico
const handleLogicalDelete = async (id: string) => {
  await supabase
    .from('table_name')
    .update({ enabled: false })
    .eq('id', id)
}
```

#### Visibilidad de Registros Deshabilitados
- **SOLO en las grillas de los módulos del dashboard** se muestran registros con `enabled: false`
- En los selectores, dropdowns y diálogos de asignación **NO se muestran** registros deshabilitados no asociados
- Si un registro deshabilitado ya está asociado a una entidad, se muestra con:
  - Fondo gris (`bg-gray-100`)
  - Badge "Deshabilitada" (`<Badge variant="secondary">`)
  - Opacidad reducida en checkbox (`opacity-70`)

```typescript
// Ejemplo de filtrado en grilla (muestra todos)
const allRecords = await supabase
  .from('companies')
  .select('*')
  .order('created', { ascending: false })

// Ejemplo de filtrado en selector (solo habilitadas)
const activeRecords = await supabase
  .from('companies')
  .select('*')
  .eq('enabled', true)
  .order('name')
```

#### Advertencias al Quitar Registros Deshabilitados
Cuando un usuario intenta quitar una asociación con un registro deshabilitado, debe mostrarse un diálogo de advertencia:

```typescript
// Mensaje estándar de advertencia
"Las [entidades] deshabilitadas que quites de este [contexto] no podrán
ser reasignadas ya que están inactivas en el sistema. ¿Deseas continuar?"
```

**Ejemplo de implementación**: Ver [manage-user-companies-dialog.tsx](features/users/components/manage-user-companies-dialog.tsx) y [disabled-companies-warning-dialog.tsx](features/users/components/disabled-companies-warning-dialog.tsx)

### TypeScript Guidelines
- **Siempre usar type hints** para function signatures
- **Interfaces** para object shapes
- **Types** para unions y primitives
- **Evitar `any`** - usar `unknown` si es necesario

### Patrones de Componentes
```typescript
// ✅ BIEN: Estructura de componente correcta
interface Props {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

export function Button({ children, variant = 'primary', onClick }: Props) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

## 🧪 Estrategia de Testing

### Desarrollo Guiado por Tests (TDD)
1. **Rojo**: Escribe el test que falla
2. **Verde**: Implementa código mínimo para pasar
3. **Refactorizar**: Mejora el código manteniendo tests verdes

### Estructura de Tests (Patrón AAA)
```typescript
// ✅ BIEN: Estructura de test clara
test('should calculate total with tax', () => {
  // Preparar (Arrange)
  const items = [{ price: 100 }, { price: 200 }];
  const taxRate = 0.1;

  // Actuar (Act)
  const result = calculateTotal(items, taxRate);

  // Afirmar (Assert)
  expect(result).toBe(330);
});
```

### Objetivos de Cobertura
- **Tests Unitarios**: 80%+ de cobertura
- **Tests de Integración**: Rutas críticas
- **Tests E2E**: Flujos principales de usuario

## 🔒 Mejores Prácticas de Seguridad

### Validación de Entrada
- Validar todas las entradas de usuario
- Sanitizar datos antes de procesar
- Usar validación de esquema (Zod, Yup, etc.)

### Autenticación y Autorización
- Tokens JWT con expiración
- Control de acceso basado en roles
- Gestión segura de sesiones

### Protección de Datos
- Nunca registrar datos sensibles
- Cifrar datos en reposo
- Usar HTTPS en todo lugar

## ⚡ Guías de Rendimiento

### División de Código
- División basada en rutas
- Carga diferida de componentes
- Importaciones dinámicas

### Gestión de Estado
- Estado local primero
- Estado global solo cuando sea necesario
- Memoización para cálculos costosos

### Optimización de Base de Datos
- Indexar columnas consultadas frecuentemente
- Usar paginación para conjuntos grandes de datos
- Cachear consultas repetidas

## 🔄 Flujo de Git y Reglas de Repositorio

### Estrategia de Ramas
- `main` - Código listo para producción
- `develop` - Rama de integración
- `feature/TICKET-123-descripcion` - Ramas de features
- `hotfix/TICKET-456-descripcion` - Hotfixes

### Convención de Commits (Conventional Commits)
```
tipo(alcance): descripción

feat(auth): agregar integración OAuth2
fix(api): manejar respuesta de usuario nula
docs(readme): actualizar pasos de instalación
```

### Reglas de Pull Request
- **Sin commits directos** a `main` o `develop`
- **Requerir revisión de PR** antes de merge
- **Todos los tests deben pasar** antes de merge
- **Squash and merge** para mantener historia limpia

## ❌ No Hacer (Critical)

### Calidad de Código
- ❌ No usar `any` en TypeScript
- ❌ No hacer commits sin tests
- ❌ No omitir manejo de errores
- ❌ No hardcodear configuraciones

### Seguridad
- ❌ No exponer secrets en código
- ❌ No loggear información sensible
- ❌ No saltarse validación de entrada
- ❌ No usar HTTP en producción

### Arquitectura
- ❌ No editar archivos en `src/legacy/`
- ❌ No crear dependencias circulares
- ❌ No mezclar responsabilidades en un componente
- ❌ No usar estado global innecesariamente

## 🔄 Error-First Development Protocol

### Manejo de Errores Predictivos
```python
# ✅ BIEN: Siempre incluir fallbacks
try:
    ai_result = await openai_call()
except Exception as e:
    print(f"Llamada IA falló: {e}")
    ai_result = get_mock_fallback()  # Siempre tener fallback
```

### Depuración Sin Visibilidad Directa
- **Usar logs extensivos** con emojis para fácil identificación
- **Crear endpoints de prueba** (`/test-connection`, `/health`)
- **Implementar timeouts** en todas las llamadas externas
- **Hacer requests incrementales** - nunca asumir que algo complejo funcionará

### Mejores Prácticas
- ❌ **NO usar `uvicorn main:app` directamente** → puerto hardcodeado
- ✅ **SÍ usar `python dev_server.py`** → detección automática de puerto
- ❌ **NO usar `next dev` directamente** → puerto hardcodeado
- ✅ **SÍ usar `npm run dev`** → detección automática de puerto

---

*Este archivo es la fuente de verdad para desarrollo en este proyecto. Todas las decisiones de código deben alinearse con estos principios.*