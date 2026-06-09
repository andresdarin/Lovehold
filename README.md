# Lovehold

App de gastos compartidos para parejas.

## Stack

| Capa     | Tecnología                                    |
| -------- | --------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4 |
| Backend  | NestJS 11, TypeScript, Prisma                 |
| DB       | Supabase Postgres                             |
| Auth     | Supabase Auth                                 |
| Paquete  | pnpm workspace (monorepo)                     |

## Requisitos

- **Node.js** >= 22
- **pnpm** >= 8

## Instalación

```bash
# Clonar el repo y entrar
cd lovehold

# Instalar todas las dependencias del monorepo
pnpm install
```

## Desarrollo

### Correr todo en paralelo

```bash
pnpm dev
```

### Correr solo la web

```bash
pnpm --filter @lovehold/web dev
```

### Correr solo la API

```bash
pnpm --filter @lovehold/api dev
```

## Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Ir a **Project Settings > Database > Connection string** y copiar la URI
3. Copiar los archivos `.env.example` a `.env` en cada app:
   - `apps/api/.env` → pegar `DATABASE_URL`, `SUPABASE_URL` y `SUPABASE_JWT_SECRET`
   - `apps/web/.env` → pegar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Verificar algoritmo JWT del proyecto

Supabase puede usar HS256 (simétrico, default) o RS256/ES256 (asimétrico, con JWT Signing Keys).

Para saber cuál usa tu proyecto sin exponer secretos:

```bash
# 1. Copiá un access token de Supabase Auth (desde la consola del navegador,
#    o desde la respuesta de sign-in en Supabase).

# 2. Decodificá solo el header (primera parte del JWT):
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" | base64 -d 2>/dev/null || echo "{\"alg\": \"HS256\"}"
```

O desde la app, usando el helper incluido:

```bash
# Arrancá la API y ejecutá esto en otro terminal:
pnpm tsx -e "
const {debugTokenAlgorithm} = require('./apps/api/src/common/utils/decode-token-header');
debugTokenAlgorithm('copiá-acá-tu-token-sin-verificar');
"
```

Si el `alg` es:
- **HS256** → el AuthGuard actual funciona con `SUPABASE_JWT_SECRET`.
- **RS256** o **ES256** → el AuthGuard necesita migrarse a JWKS (ver `auth.guard.ts`).

## Prisma

```bash
# Generar Prisma Client
pnpm --filter @lovehold/api prisma:generate

# Crear migración inicial (cuando la DB esté configurada)
pnpm --filter @lovehold/api prisma:migrate

# Abrir Prisma Studio
pnpm --filter @lovehold/api prisma:studio
```

## Estructura del proyecto

```
lovehold/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend + Prisma
├── packages/
│   └── shared/       # Tipos, schemas Zod, constantes
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## Scripts disponibles

| Script                          | Descripción                        |
| ------------------------------- | ---------------------------------- |
| `pnpm dev`                      | Web + API en paralelo              |
| `pnpm build`                    | Build de todos los paquetes        |
| `pnpm lint`                     | Lint de todos los paquetes         |
| `pnpm format`                   | Formatear código con Prettier      |
| `pnpm --filter @lovehold/api prisma:generate` | Generar Prisma Client |
| `pnpm --filter @lovehold/api prisma:migrate`  | Correr migraciones     |
| `pnpm --filter @lovehold/api prisma:studio`   | Abrir Prisma Studio   |
