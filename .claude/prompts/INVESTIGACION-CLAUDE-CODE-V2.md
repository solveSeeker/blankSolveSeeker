# Investigación: Componentes .claude/ - SaaS Factory V2

Investigación exhaustiva de la documentación oficial de Anthropic para optimizar la Fábrica de SaaS.

---

## Resumen Ejecutivo

La carpeta `.claude/` es el cerebro de la configuración de Claude Code. Contiene 6 componentes principales que trabajan en conjunto:

| Componente | Ubicación | Activación | Propósito |
|------------|-----------|------------|-----------|
| **Commands** | `.claude/commands/` | Manual (`/comando`) | Prompts reutilizables |
| **Agents** | `.claude/agents/` | Delegado/Manual | Subagentes especializados |
| **Skills** | `.claude/skills/` | **Automática** (IA decide) | Paquetes de conocimiento |
| **Prompts** | `.claude/prompts/` | Referencia | Metodologías documentadas |
| **Hooks** | `.claude/settings.json` | Automática (eventos) | Control determinístico |
| **MCPs** | `.mcp.json` | Automática | Herramientas externas |

---

## 1. COMMANDS (Slash Commands)

### Qué Son
Archivos Markdown que se invocan con `/nombre-comando`. Son **prompts guardados y reutilizables**.

### Ubicación
- **Proyecto**: `.claude/commands/` (compartido via git)
- **Personal**: `~/.claude/commands/` (solo tu máquina)

### Formato de Archivo

```markdown
---
description: "Descripción breve del comando"
argument-hint: "[argumentos-esperados]"
allowed-tools: Bash(command:*)
model: claude-opus  # Opcional: modelo específico
---

# Título del Comando

Instrucciones en markdown.

Usa $ARGUMENTS para capturar input del usuario.
Usa $1, $2, etc. para argumentos posicionales.
Usa @archivo.ts para incluir contenido de archivos.
```

### Variables Disponibles

| Variable | Uso | Ejemplo |
|----------|-----|---------|
| `$ARGUMENTS` | Todos los argumentos | `/cmd hola mundo` → `"hola mundo"` |
| `$1`, `$2`... | Argumentos posicionales | `/cmd arg1 arg2` → `$1="arg1"` |
| `@filepath` | Incluir archivo | `@src/utils.ts` |

### Campos del Frontmatter

| Campo | Tipo | Propósito |
|-------|------|-----------|
| `description` | string | Mostrado en autocompletado |
| `argument-hint` | string | Guía de argumentos esperados |
| `allowed-tools` | string | Herramientas permitidas |
| `model` | string | `claude-opus`, `claude-sonnet-4-5`, etc. |

### Cuándo Usar Commands

✅ **Usar cuando:**
- Repites el mismo prompt frecuentemente
- Quieres control explícito (usuario decide cuándo)
- Es una tarea simple (1-10 pasos)
- Necesitas pasar argumentos dinámicos

❌ **NO usar cuando:**
- La tarea requiere múltiples archivos complejos → Usa **Skills**
- Necesitas contexto aislado → Usa **Agents**
- Quieres activación automática → Usa **Skills**

### Ejemplo Real: `/generar-prp`

```markdown
---
description: "Genera una PRP comprehensiva con investigación"
argument-hint: "[archivo-requerimientos o descripción]"
---

# Generador de PRP

## Archivo de Input: $ARGUMENTS

Si se proporciona un archivo, léelo primero...

## Proceso
1. Analizar codebase existente
2. Investigar best practices
3. Generar PRP completa
```

---

## 2. AGENTS (Subagentes)

### Qué Son
Asistentes IA especializados con **contexto propio aislado**, modelo específico y permisos de herramientas definidos.

### Diferencia Clave vs Commands
- **Commands**: Mismo contexto, mismo modelo, prompt directo
- **Agents**: Contexto aislado, modelo configurable, ejecutan tareas complejas independientemente

### Ubicación
- **Proyecto**: `.claude/agents/` (compartido via git)
- **Personal**: `~/.claude/agents/`

### Formato de Archivo

```yaml
---
name: "nombre-agente"
description: "Cuándo y por qué invocar este agente"
model: "sonnet"  # sonnet | opus | haiku | inherit
tools: Read, Write, Edit, Grep, Glob  # Opcional: limitar herramientas
color: green  # Opcional: identificador visual
---

# System Prompt del Agente

Eres un agente especializado en [dominio].

## Tu Misión
[Responsabilidades principales...]

## Metodología
[Cómo abordar el trabajo...]

## Formato de Output
[Estructura esperada de resultados...]
```

### Modelos Disponibles

| Modelo | Uso Recomendado |
|--------|-----------------|
| `haiku` | Tareas rápidas, búsqueda de código |
| `sonnet` | **Default recomendado** - análisis profundo |
| `opus` | Razonamiento complejo, decisiones arquitectónicas |
| `inherit` | Heredar modelo de la sesión principal |

### Herramientas Configurables

```yaml
# Solo lectura (análisis)
tools: Read, Grep, Glob, LS

# Documentación (lectura + escritura)
tools: Read, Write, Edit, MultiEdit, Grep, Glob, LS

# Testing (ejecución + todo)
tools: Bash, Read, Write, Edit, MultiEdit, Grep, Glob, TodoWrite
```

**Importante**: Si omites `tools`, el agente hereda **todas** las herramientas.

### Cuándo Usar Agents

✅ **Usar cuando:**
- La tarea se beneficia de contexto aislado
- Necesitas modelo específico (opus para razonamiento complejo)
- Quieres limitar herramientas por seguridad
- La tarea es compleja y multi-paso

❌ **NO usar cuando:**
- Es un prompt simple → Usa **Commands**
- Quieres activación automática → Usa **Skills**

### Ejemplo Real: `codebase-analyst`

```yaml
---
name: "codebase-analyst"
description: "Análisis profundo de patrones y convenciones del codebase"
model: "sonnet"
---

Eres un agente de análisis especializado.

## Tu Misión
Descubrir patrones, convenciones y approaches de implementación.

## Metodología
1. Buscar docs de arquitectura (CLAUDE.md, README)
2. Analizar estructura de directorios
3. Extraer patrones de naming
4. Identificar testing approach
5. Documentar integraciones

## Output Format (YAML)
project_info:
  name: ...
  framework: ...
patterns:
  naming: ...
  architecture: ...
```

---

## 3. SKILLS (El Componente Más Malentendido)

### Qué Son
**Paquetes de conocimiento modular** que Claude activa **automáticamente** cuando detecta que son relevantes.

### Diferencia Crítica vs Commands

| Aspecto | Commands | Skills |
|---------|----------|--------|
| **Activación** | Manual (`/cmd`) | **Automática** (IA decide) |
| **Estructura** | Un archivo .md | Directorio con SKILL.md + recursos |
| **Propósito** | Prompts reutilizables | **Expertise empaquetado** |

### Ubicación
- **Proyecto**: `.claude/skills/` (compartido via git)
- **Personal**: `~/.claude/skills/`

### Estructura de Directorio

```
.claude/skills/
└── mi-skill/
    ├── SKILL.md           # REQUERIDO: metadata + instrucciones
    ├── scripts/           # Opcional: código ejecutable
    │   └── helper.py
    ├── references/        # Opcional: documentación detallada
    │   └── api-docs.md
    └── assets/            # Opcional: templates, recursos
        └── template.tsx
```

### Formato de SKILL.md

```yaml
---
name: nombre-del-skill
description: "Descripción detallada de QUÉ hace y CUÁNDO usarlo"
allowed-tools:              # Opcional: restringir herramientas
  - "grep"
  - "read"
---

# Título del Skill

## Propósito
Qué problema resuelve este skill.

## Cuándo se Activa
- Cuando el usuario pregunta sobre X
- Cuando se detecta patrón Y
- Cuando se trabaja con tecnología Z

## Cómo Funciona
### Paso 1: ...
### Paso 2: ...

## Ejemplos de Uso
- Ejemplo 1
- Ejemplo 2

## Referencias
- Ver `references/` para documentación detallada
```

### Progressive Disclosure (Concepto Clave)

Los skills siguen el principio de **revelación progresiva**:

1. **Metadata** (~100 palabras) → Siempre en contexto
2. **SKILL.md** (<5,000 palabras) → Cuando se activa
3. **Resources** (ilimitado) → Bajo demanda

**Por eso los archivos grandes van en `references/`**, no en SKILL.md.

### La Clave: El Campo `description`

El `description` es **crítico** porque determina cuándo Claude activa el skill:

```yaml
# ❌ MAL - muy genérico
description: "Skill de base de datos"

# ✅ BIEN - específico con triggers
description: "Optimiza queries de base de datos cuando se analizan problemas de performance, se revisa código SQL, o se detectan queries lentas en logs"
```

### Cuándo Usar Skills vs Commands vs Prompts

| Escenario | Usar |
|-----------|------|
| Expertise complejo con múltiples archivos | **Skills** |
| Prompt rápido que repites mucho | Commands |
| Metodología documentada (referencia) | Prompts |
| Quieres que la IA decida cuándo usar | **Skills** |
| Quieres control manual explícito | Commands |

### Problema Actual en SaaS Factory

Tus "skills" actuales parecen ser más **prompts** o **commands** que skills verdaderos:

```
# Estructura actual (problemática)
.claude/skills/
├── supabase-auth-memory/      # ¿Es realmente un skill?
├── nextjs-16-complete-guide/  # Esto debería ser una reference doc
└── skill-creator/             # Este sí es un skill correcto
```

**Recomendación**: Evaluar si cada skill tiene:
- ✅ Múltiples archivos de soporte
- ✅ Activación automática útil
- ✅ Expertise que Claude necesita "descubrir"

Si no, probablemente debería ser un **command** o **prompt**.

---

## 4. PROMPTS (Metodologías)

### Qué Son
**Documentos de referencia** que describen metodologías y workflows. NO se activan automáticamente, se referencian.

### Ubicación
`.claude/prompts/`

### Propósito
- Documentar approaches sistemáticos
- Servir como referencia para commands y agents
- Compartir metodologías con el equipo

### Ejemplo: `bucle-agentico.md`

```markdown
# Bucle Agéntico

Metodología sistemática para problemas complejos.

## Proceso
1. Delimitar problema(s)
2. Ingeniería inversa
3. Planificación jerárquica
4. Ejecución iterativa
5. Validación continua
6. Reporte final

## Cuándo Usar
- Problemas complejos con múltiples partes
- Features nuevas end-to-end
- Refactorings grandes
```

### Diferencia con Skills

| Prompts | Skills |
|---------|--------|
| Referencia pasiva | Activación automática |
| Un archivo | Directorio con recursos |
| Se menciona en conversación | Claude detecta cuándo usar |
| Metodología | Expertise empaquetado |

---

## 5. HOOKS (Control Determinístico)

### Qué Son
**Scripts shell que se ejecutan automáticamente** en eventos específicos del ciclo de vida de Claude Code.

### Concepto Clave
> "Al codificar reglas como hooks en lugar de instrucciones de prompt, conviertes sugerencias en código a nivel de aplicación que se ejecuta cada vez."

### Ubicación de Configuración

```
~/.claude/settings.json        # Usuario (todos los proyectos)
.claude/settings.json          # Proyecto (compartido via git)
.claude/settings.local.json    # Local (ignorado, testing)
```

### Tipos de Hooks Disponibles (10)

| Hook | Trigger | Uso Principal |
|------|---------|---------------|
| `PreToolUse` | Antes de ejecutar herramienta | Validar/bloquear operaciones |
| `PostToolUse` | Después de herramienta exitosa | Formatear, limpiar |
| `PermissionRequest` | Al pedir permiso | Auto-aprobar/denegar |
| `UserPromptSubmit` | Usuario envía prompt | Validar input, bloquear secrets |
| `Stop` | Agente termina | Determinar si continuar |
| `SubagentStop` | Subagente termina | Similar a Stop |
| `Notification` | Notificación enviada | Alertas externas |
| `SessionStart` | Sesión inicia | Cargar contexto, setup |
| `SessionEnd` | Sesión termina | Cleanup, logging |
| `PreCompact` | Antes de compactar | Custom handling |

### Formato de Configuración

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "timeout": 60,
        "hooks": [
          {
            "type": "command",
            "command": "/ruta/absoluta/al/script.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*.ts",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/local/bin/prettier-hook.sh"
          }
        ]
      }
    ]
  }
}
```

### Matchers (Patrones)

- **Exacto**: `Write` - solo la herramienta Write
- **Regex**: `Edit|Write` - Edit O Write
- **Wildcard**: `*` - todas las herramientas
- **MCP**: `mcp__servidor__herramienta`

### Exit Codes

| Código | Significado |
|--------|-------------|
| `0` | Éxito (continuar) |
| `2` | Error bloqueante (detener operación) |
| Otros | Error no-bloqueante (solo warning) |

### Casos de Uso Prácticos

**1. Auto-formatear archivos TypeScript:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "/path/to/prettier-hook.sh"
        }]
      }
    ]
  }
}
```

**2. Proteger archivos sensibles:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "/path/to/protect-env-files.sh"
        }]
      }
    ]
  }
}
```

**3. Bloquear secrets en prompts:**
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [{
          "type": "command",
          "command": "/path/to/block-secrets.sh"
        }]
      }
    ]
  }
}
```

### Oportunidades para SaaS Factory V2

1. **Hook de formateo automático** → PostToolUse con Prettier
2. **Hook de protección de .env** → PreToolUse bloqueando edición
3. **Hook de logging** → PostToolUse registrando comandos
4. **Hook de notificaciones** → Notification para alertas desktop

---

## 6. MCPs (Model Context Protocol)

### Qué Son
**Servidores externos** que extienden las capacidades de Claude Code con herramientas adicionales.

### Ubicación de Configuración

- **Proyecto**: `.mcp.json` (compartido, usar example.mcp.json)
- **Usuario**: `~/.claude/settings.local.json`

### Formato de .mcp.json

```json
{
  "mcpServers": {
    "nombre-servidor": {
      "command": "npx",
      "args": ["-y", "@paquete/mcp-server"],
      "env": {
        "API_KEY": "${MI_API_KEY}",
        "URL": "${BASE_URL:-https://default.com}"
      }
    }
  }
}
```

### Tipos de Transporte

| Tipo | Uso |
|------|-----|
| `stdio` | Servidores locales (NPM packages) |
| `http` | Servidores remotos (APIs cloud) |
| `sse` | Deprecated |

### Variables de Entorno

```json
{
  "env": {
    "REQUIRED_VAR": "${VAR}",           // Falla si no existe
    "OPTIONAL_VAR": "${VAR:-default}"   // Usa default si no existe
  }
}
```

### MCPs en SaaS Factory

| MCP | Propósito | Bucle Agéntico |
|-----|-----------|----------------|
| `playwright` | Control de navegador, screenshots | ✅ Core |
| `chrome-devtools` | Debugging avanzado | ✅ Core |
| `supabase` | Acceso directo a DB | BaaS |
| `brave-search` | Búsqueda web | Investigación |
| `firecrawl-mcp` | Web scraping | Investigación |
| `sequential-thinking` | Razonamiento mejorado | Análisis |

### Patrón Recomendado

```bash
# 1. Committear template (sin secrets)
example.mcp.json  ← En git

# 2. Crear config real localmente
cp example.mcp.json .mcp.json
# Editar con valores reales

# 3. Ignorar config real
.mcp.json  ← En .gitignore
```

---

## 7. DIAGNÓSTICO: Estado Actual vs Ideal

### Commands ✅ Bien Implementados

Tu estructura actual es correcta:
```
.claude/commands/
├── explorador.md
├── generar-prp.md
├── ejecutar-prp.md
└── ...
```

### Agents ⚠️ Pueden Mejorar

Tienes 3 agentes especializados, pero podrían agregarse:

| Agente Actual | Agente Sugerido |
|---------------|-----------------|
| codebase-analyst | ✅ |
| gestor-documentacion | ✅ |
| validacion-calidad | ✅ |
| - | `frontend-specialist` (UI/UX) |
| - | `backend-specialist` (API/DB) |
| - | `vercel-deployer` (Vercel CLI) |
| - | `supabase-admin` (BaaS ops) |

### Skills ⚠️ Necesitan Reevaluación

**Problema**: Algunos "skills" actuales son más documentación que expertise:

```
# Actual
nextjs-16-complete-guide/  → Debería ser reference doc o prompt
supabase-auth-memory/      → ¿Se activa automáticamente? ¿Cuándo?

# Verdaderos skills (estructura correcta)
skill-creator/             → ✅ Tiene scripts, references, activación clara
```

**Pregunta clave para cada skill:**
> "¿Claude decide automáticamente cuándo usar esto, o yo lo invoco manualmente?"

- Si es manual → Debería ser **command**
- Si es referencia → Debería ser **prompt** o archivo en CLAUDE.md
- Si es automático con recursos → Es un **skill** verdadero

### Prompts ✅ Bien Usados

`bucle-agentico.md` es un excelente ejemplo de prompt/metodología.

### Hooks 🔴 No Implementados

Oportunidad enorme:
- Auto-formateo con Prettier
- Protección de archivos sensibles
- Logging de operaciones
- Notificaciones desktop

### MCPs ✅ Bien Configurados

Tu `example.mcp.json` incluye los MCPs correctos para el bucle agéntico.

---

## 8. RECOMENDACIONES PARA V2

### 1. Reorganizar Skills

```
# ANTES (confuso)
.claude/skills/
├── nextjs-16-complete-guide/
├── supabase-auth-memory/
└── skill-creator/

# DESPUÉS (claro)
.claude/
├── skills/
│   ├── auth-implementation/      # Skill verdadero con scripts
│   │   ├── SKILL.md
│   │   ├── scripts/setup-auth.sh
│   │   └── references/flows.md
│   └── skill-creator/            # Mantener
│
├── prompts/
│   ├── bucle-agentico.md
│   ├── nextjs-16-patterns.md     # Mover aquí
│   └── supabase-auth-guide.md    # Mover aquí
```

### 2. Agregar Agentes Especializados

```yaml
# .claude/agents/frontend-specialist.md
---
name: "frontend-specialist"
description: "Especialista en UI/UX, componentes React, Tailwind"
model: "sonnet"
tools: Read, Write, Edit, Grep, Glob
---

# .claude/agents/vercel-deployer.md
---
name: "vercel-deployer"
description: "Maneja deployments con Vercel CLI"
model: "haiku"
tools: Bash, Read
---

# .claude/agents/supabase-admin.md
---
name: "supabase-admin"
description: "Operaciones de base de datos y auth con Supabase"
model: "sonnet"
tools: Bash, Read, Write
---
```

### 3. Implementar Hooks Básicos

```json
// .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/auto-format.sh"
        }]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/protect-files.sh"
        }]
      }
    ]
  }
}
```

### 4. Actualizar CLAUDE.md

Incluir sección de BaaS:

```markdown
## Backend as a Service (BaaS)

Esta fábrica usa **Supabase** como BaaS:
- Authentication: Supabase Auth
- Database: PostgreSQL via Supabase
- Storage: Supabase Storage
- Realtime: Supabase Realtime

### Convenciones
- Queries via MCP cuando sea posible
- RLS (Row Level Security) siempre activo
- Migrations en `supabase/migrations/`
```

### 5. Crear Skill de Autenticación Real

```
.claude/skills/supabase-auth/
├── SKILL.md
│   ---
│   name: supabase-auth
│   description: "Implementa autenticación con Supabase cuando se
│                 detectan rutas protegidas, login forms, o
│                 referencias a auth/session"
│   ---
│
├── scripts/
│   ├── setup-auth-tables.sql
│   └── check-rls-policies.sh
│
├── references/
│   ├── auth-flows.md
│   ├── common-patterns.md
│   └── troubleshooting.md
│
└── assets/
    └── auth-component-template.tsx
```

---

## 9. MATRIZ DE DECISIÓN FINAL

### ¿Qué componente usar?

```
┌─────────────────────────────────────────────────────────────────┐
│                    ¿QUÉ NECESITAS?                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ¿Prompt reutilizable que invocas manualmente?                 │
│  └─→ COMMAND (.claude/commands/)                               │
│                                                                 │
│  ¿Expertise que Claude debería detectar automáticamente?       │
│  └─→ SKILL (.claude/skills/)                                   │
│                                                                 │
│  ¿Tarea compleja que necesita contexto aislado?               │
│  └─→ AGENT (.claude/agents/)                                   │
│                                                                 │
│  ¿Metodología documentada para referencia?                     │
│  └─→ PROMPT (.claude/prompts/)                                 │
│                                                                 │
│  ¿Regla que SIEMPRE debe ejecutarse en ciertos eventos?       │
│  └─→ HOOK (.claude/settings.json)                              │
│                                                                 │
│  ¿Herramienta externa (browser, DB, search)?                  │
│  └─→ MCP (.mcp.json)                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. PRÓXIMOS PASOS

1. **Auditar skills actuales** → ¿Son skills o prompts?
2. **Crear hooks básicos** → Formateo, protección
3. **Agregar agentes especializados** → Frontend, Backend, Deploy
4. **Actualizar CLAUDE.md** → Sección BaaS con Supabase
5. **Documentar en README** → Explicar cada componente

---

*Documento de investigación para SaaS Factory V2*
*Basado en documentación oficial de Anthropic - Claude Code*
*Fecha: 2025-01-28*
