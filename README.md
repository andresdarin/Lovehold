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
   - `apps/api/.env` → pegar `DATABASE_URL`
   - `apps/web/.env` → pegar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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
