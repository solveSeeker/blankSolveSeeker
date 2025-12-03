# 🚀 Guía de Deployment

## 📌 Arquitectura de Deployment

```
Repositorio Privado (devBlankSolveSeeker)
    ↓
    Push a main
    ↓
GitHub Actions Workflow
    ↓
    Sincroniza (excluye archivos sensibles)
    ↓
Repositorio Público (blankSolveSeeker)
    ↓
    Vercel detecta cambios
    ↓
    Build y Deploy automático
    ↓
Producción (blank-solve-seeker.vercel.app)
```

## 🎯 Objetivo

Mantener un repositorio **privado** para desarrollo (con herramientas, configuraciones y documentación interna) y un repositorio **público** limpio solo con el código necesario para el deployment en Vercel.

## 📁 Estructura de Repositorios

### Repositorio Privado: `devBlankSolveSeeker`

**Contiene**:
- ✅ Todo el código fuente
- ✅ Configuración de MCPs (`.mcp.json`)
- ✅ Documentación interna (`CLAUDE.md`, `bitacora/`)
- ✅ Herramientas de desarrollo
- ✅ Variables de entorno locales (`.env.local`)
- ✅ GitHub Actions workflows

**NO se sincroniza al público**:
- `.claude/` - Configuración de Claude Code
- `bitacora/` - Documentos de trabajo
- `.mcp.json` - Credenciales de MCPs
- `CLAUDE.md` - Documentación interna
- `.env.local` - Variables de entorno locales
- `README.md` - README con info sensible
- `setup-mcp.ps1` - Scripts de setup

### Repositorio Público: `blankSolveSeeker`

**Contiene**:
- ✅ Código fuente de la app
- ✅ Configuración de Next.js
- ✅ Dependencias (package.json)
- ✅ Migraciones de Supabase
- ✅ `.env.example` (sin valores reales)

## 🔧 Configuración Inicial

### 1. Crear Repositorios en GitHub

**Repo Privado**:
1. Ve a GitHub → New Repository
2. Nombre: `devBlankSolveSeeker`
3. Visibilidad: **Private**
4. Inicializa sin README (ya existe)

**Repo Público**:
1. Ve a GitHub → New Repository
2. Nombre: `blankSolveSeeker`
3. Visibilidad: **Public**
4. No inicialices (GitHub Actions lo llenará)

### 2. Conectar Repo Privado

```bash
cd c:\works\cursor\IA\soft\appBlankSolveSeeker
git init
git add .
git commit -m "Initial commit: FASE 1 + FASE 1.5"
git remote add origin https://github.com/solveSeeker/devBlankSolveSeeker.git
git push -u origin main
```

### 3. Crear Personal Access Token

**Para qué**: Permitir que GitHub Actions del repo privado haga push al repo público

**Pasos**:
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Nombre: "Public Repo Sync"
5. Scopes necesarios:
   - ✅ `repo` (Full control of repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Expiration: No expiration (o según tu política)
7. Generate token
8. **Copia el token** (solo se muestra una vez)

### 4. Agregar Token como Secret

1. Ve al repo privado: `devBlankSolveSeeker`
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `PUBLIC_REPO_TOKEN`
5. Value: [pega el token copiado]
6. Click "Add secret"

### 5. GitHub Actions Workflow

El archivo `.github/workflows/sync-public-repo.yml` ya está creado:

```yaml
name: Sync to Public Repository

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read

jobs:
  sync:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout private repo
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Remove sensitive files and folders
        run: |
          rm -rf .claude/
          rm -rf bitacora/
          rm -f .mcp.json
          rm -f CLAUDE.md
          rm -f .env.local
          rm -f setup-mcp.ps1
          rm -f README.md

      - name: Configure git
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"

      - name: Push to public repository
        env:
          PUSH_TOKEN: ${{ secrets.PUBLIC_REPO_TOKEN }}
        run: |
          if [ -z "$PUSH_TOKEN" ]; then
            echo "ERROR: PUSH_TOKEN is empty!"
            exit 1
          fi
          echo "Token is present (length: ${#PUSH_TOKEN})"

          git add -A
          git commit -m "Sync from private repo [skip ci]" || echo "No changes to commit"

          git push https://x-access-token:${PUSH_TOKEN}@github.com/solveSeeker/blankSolveSeeker.git HEAD:refs/heads/main --force
```

**Features**:
- ✅ Se ejecuta automáticamente en cada push a `main`
- ✅ También se puede ejecutar manualmente (`workflow_dispatch`)
- ✅ Elimina archivos sensibles antes de sincronizar
- ✅ Usa force push para mantener repos sincronizados

### 6. Conectar Vercel

**Pasos**:
1. Ve a [vercel.com](https://vercel.com)
2. Sign in con GitHub
3. Click "Add New Project"
4. Importa el repo **público**: `blankSolveSeeker`
5. Framework Preset: Next.js (detectado automáticamente)
6. Root Directory: `./`
7. Build Command: `next build`
8. Output Directory: `.next`

**Variables de Entorno en Vercel**:
1. En la configuración del proyecto en Vercel
2. Settings → Environment Variables
3. Agregar:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://lddfsrsmifmujbhfdbsd.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [tu anon key]
   - `NEXT_PUBLIC_APP_URL`: `https://blank-solve-seeker.vercel.app`

4. Click "Deploy"

## 🔄 Flujo de Trabajo Diario

### Desarrollo Local

```bash
# 1. Hacer cambios en el código
# ... editar archivos ...

# 2. Probar localmente
npm run dev
# Abre http://localhost:4855

# 3. Commit cambios
git add .
git commit -m "feat: agregar nueva feature X"

# 4. Push al repo privado
git push origin main
```

### Sincronización Automática

```
1. Push detectado por GitHub
    ↓
2. GitHub Actions se ejecuta automáticamente
    ↓
3. Elimina archivos sensibles
    ↓
4. Push al repo público
    ↓
5. Vercel detecta cambios
    ↓
6. Build automático
    ↓
7. Deploy a producción (2-3 minutos)
```

### Verificar Deployment

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en tu proyecto
3. Ve a "Deployments"
4. Verifica que el deployment fue exitoso
5. Click "Visit" para ver el sitio en producción

## 🐛 Troubleshooting

### Workflow falla con 403 error

**Causa**: Token no tiene permisos o no está configurado

**Solución**:
1. Verifica que el token es **Classic** (no Fine-grained)
2. Verifica que tiene scopes `repo` + `workflow`
3. Verifica que el secret se llama exactamente `PUBLIC_REPO_TOKEN`
4. Regenera el token si es necesario

### Vercel deployment falla

**Causa**: Error en el build o variables de entorno faltantes

**Solución**:
1. Ve a Vercel → Deployments → [failed deployment]
2. Click en "View Function Logs"
3. Identifica el error
4. Común: Falta variable de entorno
   - Ve a Settings → Environment Variables
   - Agrega las faltantes
   - Redeploy

### Cambios no aparecen en producción

**Causa**: GitHub Actions no se ejecutó o Vercel no detectó cambios

**Solución**:
1. Ve al repo privado → Actions
2. Verifica que el workflow corrió
3. Si falló, revisa los logs
4. Ve al repo público → Check last commit
5. Ve a Vercel → Deployments → Verifica último deployment

### Archivos sensibles aparecen en repo público

**Causa**: No se agregaron al script de eliminación

**Solución**:
1. Edita `.github/workflows/sync-public-repo.yml`
2. Agrega el archivo a la sección `Remove sensitive files`
3. Push los cambios
4. El próximo sync eliminará el archivo

## 🔒 Seguridad

### ⚡ IMPORTANTE

- ❌ **NUNCA** commitees secrets al repo privado
- ❌ **NUNCA** hagas el repo privado público
- ✅ **SIEMPRE** usa variables de entorno en Vercel
- ✅ **SIEMPRE** revisa el repo público antes de hacerlo público

### Checklist Pre-Deployment

Antes de hacer el primer deployment:

- [ ] `.mcp.json` NO está en el repo público
- [ ] `.env.local` NO está en el repo público
- [ ] `CLAUDE.md` NO está en el repo público
- [ ] `bitacora/` NO está en el repo público
- [ ] Variables de entorno configuradas en Vercel
- [ ] Token de GitHub tiene permisos correctos
- [ ] Workflow de sincronización probado

## 📊 Monitoreo

### Vercel Analytics

**Activar**:
1. Ve a tu proyecto en Vercel
2. Analytics tab
3. Enable Analytics

**Métricas**:
- Page views
- Unique visitors
- Top pages
- Countries
- Devices

### Vercel Logs

**Ver logs**:
1. Proyecto → Deployments
2. Click en un deployment
3. Function Logs o Build Logs

**Útil para**:
- Debug de errores en producción
- Ver requests lentos
- Identificar crashes

## 🎯 Best Practices

1. **Commit frecuentemente**: Push pequeños cambios regularmente
2. **Mensajes claros**: Usa Conventional Commits
3. **Probar localmente primero**: Siempre prueba antes de push
4. **Monitorear deployments**: Verifica que cada deployment fue exitoso
5. **Variables de entorno**: Nunca hardcodees valores sensibles

## 📚 Referencias

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**URLs del Proyecto**:
- **Desarrollo**: http://localhost:4855
- **Producción**: https://blank-solve-seeker.vercel.app
- **Repo Privado**: https://github.com/solveSeeker/devBlankSolveSeeker
- **Repo Público**: https://github.com/solveSeeker/blankSolveSeeker

**Última actualización**: 3 de diciembre, 2025
