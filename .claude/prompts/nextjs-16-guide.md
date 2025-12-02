# Guía Completa de Next.js 16

Referencia completa para las funcionalidades de Next.js 16, cambios importantes y migración desde v15.

---

## El 20% que produce el 80%

### 1. Cache Components + "use cache"

```typescript
// next.config.ts
const nextConfig = {
  cacheComponents: true,
};

// Uso en componentes
async function UserMetrics() {
  'use cache'; // Explicit caching
  const metrics = await fetchMetrics();
  return <MetricsCard data={metrics} />;
}

// Componente dinámico (sin cache)
async function LiveBalance() {
  const balance = await fetchBalance(); // Always fresh
  return <BalanceWidget balance={balance} />;
}
```

### 2. Turbopack (Default, Estable)

- **2-5× más rápido** en builds de producción
- **10× más rápido** en Fast Refresh
- No requiere configuración - es el default

```bash
# Opt-out si necesitas Webpack
next build --webpack
```

### 3. proxy.ts Reemplaza middleware.ts

```typescript
// ANTES: middleware.ts
export function middleware(request: NextRequest) { ... }

// AHORA: proxy.ts
export default function proxy(request: NextRequest) { ... }
```

### 4. React Compiler (Estable)

```typescript
// next.config.ts
const nextConfig = {
  reactCompiler: true, // Auto-memoization
};

// Ya no necesitas useMemo, useCallback, React.memo
function Component({ data }) {
  const processed = processData(data); // Auto-memoized
  return <div>{processed}</div>;
}
```

---

## Cambios Importantes (15 → 16)

### Requiere Node.js 20.9+

```bash
node --version  # Debe ser 20.9+
```

### params y searchParams Asíncronos

```typescript
// ❌ ANTES
export default function Page({ params }) {
  const id = params.id;
}

// ✅ AHORA
export default async function Page({ params }) {
  const { id } = await params;
}
```

### cookies() y headers() Asíncronos

```typescript
// ❌ ANTES
const token = cookies().get('token');

// ✅ AHORA
const cookieStore = await cookies();
const token = cookieStore.get('token');
```

### revalidateTag() requiere cacheLife

```typescript
// ❌ ANTES
revalidateTag('posts');

// ✅ AHORA
revalidateTag('posts', 'max'); // 'max', 'hours', 'days'
```

---

## Migración Rápida

```bash
# 1. Upgrade
npm install next@latest react@latest react-dom@latest

# 2. Run codemod
npx @next/codemod@canary upgrade latest

# 3. Renombrar middleware
git mv middleware.ts proxy.ts

# 4. Probar
npm run build && npm run dev
```

---

## Configuración next.config.ts Recomendada

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
```

---

## Lista de Verificación para Migración

- [ ] Node.js 20.9+ instalado
- [ ] `npm install next@latest`
- [ ] Ejecutar codemod
- [ ] Renombrar `middleware.ts` → `proxy.ts`
- [ ] Agregar `await` a params/searchParams/cookies/headers
- [ ] Actualizar llamadas a `revalidateTag()`
- [ ] Probar build y dev
- [ ] Desplegar a staging primero

---

## Recursos

- [Notas de Lanzamiento Next.js 16](https://nextjs.org/blog/next-16)
- [Guía de Actualización](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Documentación Turbopack](https://nextjs.org/docs/architecture/turbopack)
