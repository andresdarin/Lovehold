# Changelog

All notable changes to the Lovehold project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/) and [Conventional Commits](https://www.conventionalcommits.org/).

---

## [0.1.0] - 2026-08-29

### Added

- **Finance Engine**
  - Finance engine core with normalization, scheduling, and snapshot services (`62e22f4`)
  - Core finance engine, persistence layer, and authentication UI (`f22576d`)
  - Finance engine and core schemas for money handling, cash flows, and spending simulations (`43b8349`)
  - Finance engine golden test specification and supporting fixture snapshots (`756471f`)
  - Core finance schemas and web feature architecture (`cf7a211`)

- **Expense Management**
  - Expense management feature with receipt scanning, new entry form, and background sync service worker (`0a17ead`)

- **Tooling**
  - ESLint configuration and Next.js TypeScript declarations for web app (`d708d7c`)

---

## [0.1.0-rc.3] - 2026-06-26

### Added

- **Personal Finance**
  - Personal finance feature suite: category breakdown, monthly summaries, product rankings, and mobile-first navigation shell (`9574e68`)
  - Personal finance dashboard with monthly tracking and expense analytics (`d832b7a`)

- **PWA & Authentication**
  - Authentication flows and PWA support with service worker and icons (`604f3a1`)

---

## [0.1.0-rc.2] - 2026-06-25

### Added

- **Expense Tracking**
  - Expense tracking features including receipt scanning, manual form entry, and responsive layout management (`1a6b9c7`)

- **Mobile & PWA**
  - Mobile navigation shell, receipt scanning review UI, and PWA manifest configuration (`3347e03`)

---

## [0.1.0-rc.1] - 2026-06-18

### Added

- **Personal Finance**
  - Personal finance module features and application shell structure (`6b9d1cc`)
  - Dashboard and personal finance shell components with onboarding state (`6a86ced`)
  - Personal finance product monthly ranking component and app shell navigation structure (`a9cd1b5`)

---

## [0.1.0-beta.2] - 2026-06-17

### Added

- **Infrastructure**
  - GitHub Actions workflows for CI (lint, typecheck, build) and CD (deploy to Render/Vercel on main) (`94bf742`)
  - Automatic versioning `0.<commits>.<run>` and display on login/profile (`51d4357`)
  - API workspace initialization with NestJS, Prisma configuration, and environment variable schema (`ff059b3`)
  - API project initialization with Prisma service and configuration (`9242331`)
  - Health check module and application module registration (`dda6014`)
  - Singleton Supabase browser client with stub support for static generation (`35228f2`)

- **Authentication**
  - Authentication signup and login pages with Supabase integration (`7ede89f`)

- **Profile**
  - Modular profile feature architecture with new identity, status, and progress cards (`1c98867`)
  - New profile identity components including headlines, sidebars, and achievement features (`d112eee`)
  - User profile management features including UI components, API services, and liquid glass styling system (`b8c42f6`)
  - User avatar upload functionality with Supabase storage and RLS policies (`21fe0f0`)

- **Expense Management**
  - Expense management UI components including custom date picker and toolbar (`b643f19`)
  - Receipt scanning infrastructure and review interface for expense management (`5442add`)

### Fixed

- Remove PrismaPg adapter, use plain PrismaClient to avoid TLS cert issue with Supavisor pooler (`32e3855`)
- CI: install ESLint, add configs, fix lint errors (`cf86d49`)
- CI: remove version from `pnpm/action-setup@v4` (`8944690`)
- CI: run `prisma generate` before typecheck and build (`395c637`)

---

## [0.1.0-beta.1] - 2026-06-14

### Added

- **Gamification**
  - Gamification system with XP tracking and rank visualization components (`019c286`)

- **User Profile**
  - User profile management features including UI components, API services, and liquid glass styling system (`b8c42f6`)
  - User avatar upload functionality with Supabase storage and RLS policies (`21fe0f0`)

---

## [0.1.0-alpha.5] - 2026-06-13

### Added

- **Design System**
  - Liquid glass design system, month picker component, and floating popover utility (`d608a48`)
  - Complete refactorization and architecture improvement (`32d2c4d`)

- **Movements / Financial Tracking**
  - Movements listing page with filtering, pagination, and detail views (`dca3a02`)
  - Movement management components including list, details, and summary views (`f6bd12c`)
  - Movement list, filtering components, and formatting utilities (`97c83d3`)
  - Movement filtering, detailed view drawer, and reusable UI components for financial tracking (`7880444`)

- **Expense Creation**
  - Expense creation system with interactive forms, receipt scanning, and mobile-responsive item management (`9a3eb43`)
  - Expense creation form components and utility logic (`34dee8d`)
  - Expense creation service and DTOs with support for personal and household scopes (`e4eb575`)

- **Receipt Scanning**
  - Receipt scanning infrastructure, backend service, and specialized UI components for expense management (`04ac6aa`)
  - Receipt scanning utilities and logic for normalizing, validating, and distributing receipt totals (`75cea65`)
  - Receipt scanning feature using Gemini API with frontend upload and validation support (`b59ca07`)
  - Receipt text parsing logic with Tailwind CSS global styles and boilerplate auth pages (`bf045cc`)

- **Documentation**
  - Project README overhaul with expanded stack details, architecture decisions, and setup instructions (`46ac0d0`)

### Fixed

- API: handle null values for `quantity` and `unitPrice` when creating `PersonalExpenseItem` (`da02eb0`)
- Web: strip item `id` field before sending supermarket items to the API (`b51bd71`)

### Changed

- Web: allow bulk pasting supermarket receipt ticket directly inside `ReceiptItemsEditor` (`3d02cd9`)

---

## [0.1.0-alpha.4] - 2026-06-13

### Added

- **Personal Finance**
  - Personal finance module with receipt parsing and expense tracking functionality (`636f4fb`)

- **App Shell & Navigation**
  - Modular AppShell sidebar and establish architectural guidelines (`7f0fa39`)
  - Finanzas and profile pages, complete modular sidebar integration (`c2c3fea`)

---

## [0.1.0-alpha.3] - 2026-06-12

### Added

- **Expenses Module**
  - Expenses module with database schema, API endpoints, and initial UI navigation (`99925c2`)

---

## [0.1.0-alpha.2] - 2026-06-10

### Added

- **Web App Scaffold**
  - Web application scaffold with authentication layouts, app shell, and core dashboard components (`f417f47`)
  - Authentication module initialization with login and signup pages, shared layout, and routing configuration (`c603a2b`)

---

## [0.1.0-alpha.1] - 2026-06-09

### Added

- **Project Initialization**
  - Monorepo initialization with NestJS API, Next.js web app, shared packages, and Supabase documentation skills (`7a91439`)
  - NestJS API project initialization with Prisma schema and authentication guard (`c40289e`)
  - Authentication flow implementation, user login page, and database schema for household creators and settlements (`7f1ca7d`)
