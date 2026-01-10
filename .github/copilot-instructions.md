# CedarJS/Redwood Full-Stack Project - AI Agent Instructions

## Project Overview

**Floorkick** is a comprehensive sidekick application designed for flooring contractors to quickly and efficiently manage business operations. The app enables contractors to estimate jobs, invoice clients, track payments, and manage service data with minimal friction.

### Phased Development Approach

The project follows a structured build order from low to high coupling:
1. **Phase 0**: Foundation (Auth, ownership)
2. **Phase 1**: Reference Data (MeasurementUnit, Service, Rate)
3. **Phase 2**: Entities (Client, Retailer, Installer data)
4. **Phase 3**: Line Items (BillableItem, Adjustments)
5. **Phase 4**: Estimates (Editable documents with statuses)
6. **Phase 5**: Invoices (Locked financial records)
7. **Phase 6**: Payments & PayStubs (Money tracking)

Each phase builds on the previous with minimal schema disruption, ensuring features are usable at every stage.

As new data models are added, features to export and import it easily via the UX should are prioritized as data migration and resets will be invevitable during development.

---

This is a **CedarJS** (formerly Redwood) full-stack web application with monorepo structure using **Node 24** and **Yarn workspaces**. The project uses **TypeScript**, **React 18**, **GraphQL**, **Prisma ORM**, and **PostgreSQL**.

## Project Architecture

### Monorepo Structure
- **`/api`** - Backend GraphQL server (port 8911) using `@cedarjs/graphql-server`
- **`/web`** - Frontend React app (port 8910) with Vite bundler
- **`/scripts`** - Database seeding and utility scripts

### Key Tech Stack
- **Backend**: GraphQL (Apollo), Prisma ORM, DbAuth (built-in auth), Nodemailer for email
 - **Backend**: GraphQL (Apollo), Prisma ORM, DbAuth (built-in auth), Nodemailer for email
 - **Mailer**: CedarJS mailer is used for transactional email (see https://cedarjs.com/docs/mailer)
- **Frontend**: React 18, Tailwind CSS v4 (with @tailwindcss/vite), React Hook Form, Zod validation
- **Database**: PostgreSQL with Prisma migrations
- **UI**: Radix UI primitives (`@radix-ui/*`), ShadCN, custom scaffold components

### Data Flow
1. **GraphQL SDL** (`api/src/graphql/*.sdl.ts`) defines schema with `@requireAuth` and `@skipAuth` directives
2. **Services** (`api/src/services/{entity}/{entity}.ts`) implement resolvers using Prisma
3. **Directives** (`api/src/directives/`) enforce auth rules on fields
4. **Web Components** use `@cedarjs/forms` (React Hook Form wrapper) for mutations and queries
5. **Cells** pattern: `{Entity}Cell.tsx` handles loading/error/success states for async data

## Documentation & Resources

Quick reference links for the main packages used in this project:

- **[CedarJS](https://cedarjs.com/docs)** - Full-stack framework documentation and API reference
- **[Prisma ORM](https://www.prisma.io/docs/)** - Database schema modeling and migrations
- **[GraphQL](https://graphql.org/learn/)** - Query language and schema concepts
- **[Apollo Client](https://www.apollographql.com/docs/react/)** - GraphQL client for React queries and mutations
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Utility-first CSS framework (v4)
- **[Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)** - Accessible, unstyled UI component primitives
- **[ShadCN Components](https://ui.shadcn.com/docs/components)** - Pre-built component library built on Radix UI
- **[React Hook Form](https://react-hook-form.com/)** - Performant form state management
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation library

## Critical Development Workflows

### Setup & Dev Server
```bash
yarn install
yarn cedar dev  # Starts both API (8911) and web (8910) simultaneously
```

### Database
- Edit schema: `api/db/schema.prisma`
- Create migration: `yarn cedar prisma migrate dev --name <description>`
- Reset database (dev only): `yarn cedar prisma migrate reset`
- Seed database: `yarn cedar prisma db seed`

### Code Generation
- CedarJS auto-generates GraphQL types in `api/types/graphql.d.ts` and `web/types/graphql.d.ts`
- Always regenerate types after GraphQL SDL changes

### Testing
```bash
yarn test                    # Run all tests
yarn test --watch           # Watch mode
yarn test api               # Test API only
yarn test web               # Test web only
```

## Code Patterns & Conventions

### Backend Service Pattern
Services directly work with Prisma (no separate repository layer):
```typescript
// api/src/services/{entity}/{entity}.ts
export const users = () => db.user.findMany()
export const createUser = ({ input }) => db.user.create({ data: input })
```

### GraphQL Directives (Auth Enforcement)
- `@requireAuth(roles: [String])` - Requires authentication, optional role-based access
- `@skipAuth` - Allows unauthenticated access
- Implemented in `api/src/directives/` using `createValidatorDirective`

### Frontend Form Pattern (React Hook Form + Zod)
Uses `@cedarjs/forms` wrapper around React Hook Form:
```typescript
<Form<InputType> onSubmit={handler}>
  <TextField name="field" />
  <Submit>Save</Submit>
</Form>
```

### Layout Composition
- `WrapperLayout` - Main wrapper with nav, footer, theme provider
- `ScaffoldLayout` - Admin panel layout with sidebar, specific to resource CRUD pages
- Route protection via `PrivateSet` in Routes.tsx (requires auth + role check)

### Database Schema Conventions
- All tables have `id String @id @default(uuid())` (UUIDs, not auto-increment)
- Timestamp fields: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
- Auth fields: `hashedPassword`, `salt`, `resetToken`, `resetTokenExpiresAt`, `roles` (string enum)

### Email Handling
- Configuration in `api/src/lib/mail.ts` (Nodemailer)
- Password reset flow in `api/src/functions/auth.ts`: generates token hash, sends reset email
- Email addresses sent in plain text only (no sensitive data in response)

### Testing Pattern
Tests use `scenario()` helper (from `@cedarjs/testing`) for seeded test data:
```typescript
scenario('returns all users', async (scenario: StandardScenario) => {
  const result = await users()
  expect(result.length).toEqual(Object.keys(scenario.user).length)
})
```
Scenarios defined in `*.scenarios.ts` files via Faker-generated data.

### Reference Data & Unit Conversions
**Phase 1 reference data** includes foundational lookup tables like `MeasurementUnit`. Key patterns:
- **Fixed vocabularies** use Prisma enums (e.g., `UnitDimension`, `UnitCategory`) to enforce data integrity
- **Conversion logic** lives in component utilities (`web/src/lib/unitConversions.ts`), not in resolvers
- **ConversionFactor** on MeasurementUnit enables calculators to normalize across units: `baseValue = rawValue × conversionFactor`
- Example: Convert 100 sq ft to sq yd: `(100 × 0.092903) / 0.836127 ≈ 11.1 sq yd`
- Export/import CSV data via scripts for bulk updates to reference data

## File Organization

### Backend
```
api/src/
  ├── directives/          # GraphQL validation directives
  ├── functions/           # Lambda/API handler functions (auth.ts, graphql.ts)
  ├── graphql/             # SDL schema definitions
  ├── lib/                 # Utilities (db.ts, auth.ts, logger.ts, mail.ts)
  ├── services/{entity}/   # Business logic & resolvers
  └── types/               # Generated TypeScript types
```

### Frontend
```
web/src/
  ├── components/          # Reusable UI (ui/, User/, mode-*, theme-*)
  ├── layouts/             # Page wrappers (WrapperLayout, ScaffoldLayout, admin-nav)
  ├── pages/               # Route-level pages (HomePage, LoginPage, User/*)
  ├── lib/                 # Utilities (formatters, utils, auth.ts)
  ├── App.tsx              # Root provider setup (Auth, Apollo, Theme, Redux if needed)
  ├── Routes.tsx           # Route definitions with PrivateSet for auth
  └── types/               # Generated GraphQL types
```

## Important Implementation Details

### Auth System
- **DbAuth** (built-in to CedarJS): username/password, session-based, token in HTTP-only cookie
- **Web client**: `useAuth()` hook from `@cedarjs/auth-dbauth-web` provides `logIn`, `logOut`, `currentUser`
- **API**: `requireAuth()` utility in `api/src/lib/auth.ts` checks session in directives
- **Password reset**: Token generated in DB, sent via email, hashed before storage

### Styling
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin (fast HMR)
- **Radix UI** for unstyled accessible components
- **Theme switching**: `next-themes` with dark mode toggle (see `mode-cycle.tsx`)
- **ShadCN** Custom UI components in `web/src/components/ui/` (Button, Badge, Dropdown, Tooltip)

### Error Handling
- GraphQL errors via Apollo Client
- Form validation via Zod + React Hook Form
- Error display component: `FormError` from `@cedarjs/forms`
- Fatal error page: `FatalErrorPage` wraps app with `FatalErrorBoundary`

## When Adding Features

1. **New Entity (User, Project, etc.)**
   - Add to `api/db/schema.prisma`, run migration
   - Generate SDL in `api/src/graphql/{entity}.sdl.ts` (use scaffold command if available)
   - Create service in `api/src/services/{entity}/{entity}.ts`
   - Add routes to `web/src/Routes.tsx` under appropriate `PrivateSet` or `Set`

2. **New Page**
   - Create in `web/src/pages/{EntityName}/` folder
   - If reading data: Create Cell component (`{Entity}Cell.tsx`) to handle loading/error
   - Wrap with layout (WrapperLayout or ScaffoldLayout)

3. **New Component**
   - Keep in `web/src/components/` organized by domain
   - Use React Hook Form + Zod for input handling
   - Import UI components from `web/src/components/ui/`

4. **New API Endpoint**
   - Add query/mutation to SDL
   - Implement resolver in service (calls Prisma directly)
   - Apply `@requireAuth` directive if protected

## Key Commands

| Command | Purpose |
|---------|---------|
| `yarn cedar dev` | Start dev servers (API + web) |
| `yarn test` | Run all tests |
| `yarn cedar prisma migrate dev --name <name>` | Create and run DB migration |
| `yarn cedar prisma migrate reset` | Reset DB to clean state (dev only) |
| `yarn cedar prisma studio` | Visual DB explorer |
| `yarn build` | Production build |

## Notes for AI Agents

- **Monorepo workspace**: Ensure `api/` and `web/` workspaces are both updated when adding shared types or utilities
- **Type safety**: GraphQL types are auto-generated; never edit `types/graphql.d.ts` manually
- **Relative imports**: Use `src/` path alias in TypeScript (configured in tsconfig)
- **Testing**: Scenarios provide seeded test data; always import from `*.scenarios.ts`
- **Environment**: Node 24 required; Yarn 4.12.0+ for workspaces
