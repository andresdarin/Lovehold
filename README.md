# Lovehold

> Shared expenses for couples — track, split, and balance household spending effortlessly.

Lovehold is a full-stack application that helps couples manage shared and personal finances. Upload receipts for automatic itemization via Gemini AI, categorize expenses, and keep a clear history of who owes whom.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | [Next.js 16](https://nextjs.org/) · [React 19](https://react.dev/) · [TypeScript](https://www.typescriptlang.org/) · [Tailwind CSS v4](https://tailwindcss.com/) · [Framer Motion](https://motion.dev/) · [Recharts](https://recharts.org/) |
| **Backend** | [NestJS 11](https://nestjs.com/) · [TypeScript](https://www.typescriptlang.org/) · [Prisma 7](https://www.prisma.io/) |
| **Database** | PostgreSQL via [Supabase](https://supabase.com/) |
| **Auth** | [Supabase Auth](https://supabase.com/auth) (JWT) |
| **AI** | [Google Gemini 2.5 Flash](https://ai.google.dev/) — receipt scanning |
| **Package** | [pnpm](https://pnpm.io/) workspace monorepo |
| **Testing** | [Vitest](https://vitest.dev/) |

## Monorepo Structure

```
lovehold/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   └── src/
│   │       ├── app/            # Routes (thin pages)
│   │       ├── components/
│   │       │   └── ui/         # Global reusable primitives
│   │       ├── features/       # Domain-organized feature modules
│   │       │   ├── auth/
│   │       │   ├── expenses/
│   │       │   │   └── movements/
│   │       │   ├── personal-finance/
│   │       │   ├── shell/
│   │       │   └── theme/
│   │       └── lib/            # Shared infrastructure
│   └── api/                    # NestJS backend
│       └── src/
│           ├── common/         # Guards, decorators, utils
│           └── expenses/       # Expense module (controller, service)
└── packages/
    └── shared/                 # Types, Zod schemas, constants
```

Every feature lives in `features/<domain>/<feature>/` with its own components, hooks, utils, types, and constants — keeping related code close and global `components/ui/` reserved for truly shared primitives.

## Features

### 📸 Intelligent Receipt Scanning
Upload a receipt photo — Gemini 2.5 Flash extracts product names, quantities, unit prices, categories, and totals. Review before saving.

- **13 expense categories** (Alimentos, Verduras, Frutas, Lácteos, Carnes/Fiambres, Panificados, Bebidas, Alcohol, Snacks/Dulces, Higiene, Limpieza/Hogar, Mascotas, Otros)
- **Uruguayan format support** (`$1.234,56` prices, `DD/MM/YYYY` dates)
- **Discount inference** when item totals exceed the receipt total

### 👤 Personal & Shared Expenses
Two parallel expense systems:
- **Personal expenses** — individual tracking with type classification (fixed, variable, supermarket)
- **Household expenses** — shared expenses with split tracking (ready for balance settlement)

### 📊 Movements & History
Filter, search, and explore your expense history:
- Monthly summaries (total, fixed, supermarket, variable)
- Date-grouped timeline with compact cards
- Detail drawer with full item breakdown
- Search by merchant, title, or category
- Multi-month navigation

### 🏠 Household Management
Create a shared household, invite your partner, and track shared spending with automatic balance calculation.

## Getting Started

### Prerequisites

- **Node.js** >= 22
- **pnpm** >= 8
- A [Supabase](https://supabase.com/) project (free tier works)
- A [Google Gemini API key](https://ai.google.dev/) (for receipt scanning)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/lovehold.git
cd lovehold

# Install all dependencies
pnpm install
```

### Environment Setup

Each app needs its own `.env` file. Copy the examples and fill in your values:

#### `apps/api/.env`

```env
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_JWT_SECRET="your-jwt-secret"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_API_MODEL="gemini-2.5-flash"
```

#### `apps/web/.env`

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
```

### Database

```bash
# Generate Prisma Client
pnpm --filter @lovehold/api prisma:generate

# Run migrations
pnpm --filter @lovehold/api prisma:migrate

# (Optional) Open Prisma Studio to explore data
pnpm --filter @lovehold/api prisma:studio
```

### Development

```bash
# Run both web and API in parallel
pnpm dev

# Run only the frontend
pnpm --filter @lovehold/web dev

# Run only the API
pnpm --filter @lovehold/api dev
```

The web app runs at `http://localhost:3000` and the API at `http://localhost:3001`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Web + API in parallel |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm --filter @lovehold/web vitest` | Run frontend tests |
| `pnpm --filter @lovehold/api vitest` | Run backend tests |
| `pnpm --filter @lovehold/api prisma:generate` | Generate Prisma Client |
| `pnpm --filter @lovehold/api prisma:migrate` | Run database migrations |
| `pnpm --filter @lovehold/api prisma:studio` | Open Prisma Studio |

## Database Schema

Key models:

- **`Profile`** — user linked to Supabase Auth
- **`Household`** — shared space for a couple
- **`Expense`** — household expense with splits
- **`ExpenseItem`** — individual line items with category classification
- **`PersonalExpense`** — individual expense tracking (fixed/variable/supermarket)
- **`Settlement`** — balance settlement between partners

## Architecture Decisions

- **Feature-based folders**: Code lives near its domain, not grouped by file type
- **Thin pages**: Route files under 80 lines, delegating logic to feature hooks
- **Receipt scanning is server-side**: Gemini API key never reaches the browser
- **Portal-based popovers**: All dropdowns and pickers render via `createPortal` to avoid clipping and layout shifts
- **UYU formatting**: `Intl.NumberFormat('es-UY')` consistently throughout

## Contributing

1. Follow the architecture rules in `AGENTS.md`
2. Keep components under 150 lines, hooks under 80, utils/types under 100
3. Write tests alongside new features
4. Run `pnpm lint` and TypeScript checks before committing

## License

MIT — see [LICENSE](LICENSE) for details.
