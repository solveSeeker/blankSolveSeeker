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
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rutas de autenticación (grupo)
│   ├── (main)/              # Rutas principales (grupo)
│   ├── layout.tsx           # Layout root
│   └── page.tsx             # Home page
│
├── features/                 # 🎯 Organizadas por funcionalidad
│   ├── auth/                # Feature: Autenticación
│   │   ├── components/      # Componentes específicos (LoginForm, etc.)
│   │   ├── hooks/           # Hooks específicos (useAuth, etc.)
│   │   ├── services/        # API calls (authService.ts)
│   │   ├── types/           # Tipos específicos (User, Session, etc.)
│   │   └── store/           # Estado local (authStore.ts)
│   │
│   ├── dashboard/           # Feature: Dashboard
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── store/
│   │
│   └── [feature]/           # Otras features...
│
└── shared/                   # Código reutilizable
    ├── components/          # UI components genéricos (Button, Card, etc.)
    ├── hooks/               # Hooks genéricos (useDebounce, useLocalStorage, etc.)
    ├── stores/              # Estado global (appStore.ts, userStore.ts)
    ├── types/               # Tipos compartidos (api.ts, domain.ts)
    ├── utils/               # Funciones utilitarias
    ├── lib/                 # Configuraciones (supabase.ts, axios.ts)
    ├── constants/           # Constantes de la app
    └── assets/              # Imágenes, iconos, etc.
```

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