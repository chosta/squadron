# CLAUDE.md

This file provides guidance to Claude Code when working with the squadron project.

## Project Overview

Squadron is a full-stack Next.js 14 application with PostgreSQL database, Prisma ORM, and Tailwind CSS. It provides user management functionality with an admin panel.

## Commands

```bash
# Quick Start Development
yarn start:dev            # Start everything (Docker + DB + dev server)

# Initial Setup
yarn install              # Install dependencies
docker compose up -d      # Start PostgreSQL container
yarn db:generate          # Generate Prisma client
yarn db:push              # Push schema to database
yarn db:seed              # Seed database with sample users

# Or use the setup script
bash scripts/setup-db.sh  # One-command database setup

# Development
yarn dev --port 3001      # Start Next.js dev server (port 3001 required for Privy)

# Building
yarn build                # Build for production

# Production
yarn start                # Start production server

# Quality
yarn lint                 # Run ESLint

# Database
yarn db:generate          # Regenerate Prisma client
yarn db:push              # Push schema changes
yarn db:migrate           # Run migrations
yarn db:seed              # Re-seed database
yarn db:studio            # Open Prisma Studio GUI
```

## Architecture

```
squadron/
├── app/                    # Next.js App Router
│   ├── api/users/          # REST API routes
│   ├── admin/              # Admin panel pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   ├── AdminNav.tsx        # Admin navigation
│   └── UserForm.tsx        # User create/edit form
├── lib/                    # Utilities
│   ├── prisma.ts           # Prisma client singleton
│   ├── config.ts           # Configuration
│   └── api-client.ts       # API client
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── types/                  # TypeScript types
└── docker-compose.yml      # PostgreSQL container
```

## Key Features

- **User CRUD**: Full create, read, update, delete for users
- **Admin Panel**: Dashboard with statistics, user table, forms
- **API**: RESTful endpoints at `/api/users`
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Privy (Web3) + Ethos Network integration

## Environment Variables

### File Structure

| File | Purpose | Git Status |
|------|---------|------------|
| `.env` | Local development secrets | gitignored |
| `.env.local` | Local overrides (Vercel CLI may write here) | gitignored |
| `.env.example` | Template with placeholders | tracked |

### Database Configuration

**Local Development:**
- Uses Docker PostgreSQL container (port 5433)
- `DATABASE_URL` set in `.env`
- Run `docker compose up -d` to start the database

**Common Issue:** If you see database connection errors pointing to `db.prisma.io` instead of localhost, check if `.env.local` has a `DATABASE_URL` override from `vercel env pull`. Comment it out for local development.

**Production:**
- Managed automatically by **Vercel + Prisma Postgres**
- Vercel injects `DATABASE_URL` at build/runtime - DO NOT set manually
- Prisma Accelerate provides connection pooling and caching
- No database credentials should be stored in code or local files for production

### Privy Authentication

**Required env vars:**
- `NEXT_PUBLIC_PRIVY_APP_ID` - Public app ID (safe to expose)
- `PRIVY_APP_SECRET` - Server-side secret (never expose)

**Allowed Origins (configure in Privy Dashboard):**
- Local: `http://localhost:3001`
- Production: Your Vercel deployment URL(s)

### Ethos Network

- `ETHOS_CLIENT_ID` - Client identifier for Ethos API

## Development Guidelines

- Use TypeScript with strict mode
- Follow Next.js App Router conventions
- Use Server Components for data fetching
- Use Client Components for interactivity
- Style with Tailwind CSS utility classes

## Testing Local Setup

Before starting the dev server, always check if one is already running:

```bash
# Check for existing server on port 3001
lsof -i :3001
```

If a server is already running, do NOT start a new one. The default port is **3001**.

Only start a new server if nothing is running:
```bash
yarn start:dev
```

## Vercel Integration

This project is deployed on Vercel. Use the following tools for Vercel operations:

### Tool Priority

1. **Vercel CLI (`npx vercel`)** - Preferred for most operations:
   - Environment variables
   - Monitoring build logs (real-time)
   - Deployments
   - Project linking

2. **Vercel MCP** - Use for queries when CLI isn't suitable:
   - `search_vercel_documentation` - Vercel docs lookup
   - `get_project` - Quick project info
   - Fetching protected deployment URLs

### Monitoring Builds After Push

After `git push`, use the CLI to monitor the build in real-time:

```bash
# Watch latest deployment logs (best way to monitor after push)
npx vercel logs --follow

# Check latest deployment status
npx vercel ls

# Get logs for a specific deployment URL
npx vercel logs <deployment-url>

# Inspect latest deployment details
npx vercel inspect
```

### Environment Variable Management

```bash
# List all env vars
npx vercel env ls

# Add env var to production
echo "secret_value" | npx vercel env add VAR_NAME production

# Add to all environments (production, preview, development)
echo "secret_value" | npx vercel env add VAR_NAME production preview development

# Remove env var
npx vercel env rm VAR_NAME production -y

# Pull env vars to local .env.local (use with caution)
npx vercel env pull
```

**IMPORTANT:** Never expose secrets in command output or logs. Use `echo "value" | npx vercel env add` to pipe secrets safely.

### Deployments

```bash
# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod

# List recent deployments
npx vercel ls

# Promote a preview deployment to production
npx vercel promote <deployment-url>
```

## Git Workflow

This project uses standard `git push` - do NOT use `git review` (that's only for billing and storpool projects).

## Maintaining This Documentation

**Proactively suggest updates to this CLAUDE.md** when you observe patterns that work well or discover important project knowledge. Examples:

- **Workflow patterns**: Effective ways to run, test, or deploy the project
- **Common issues**: Problems encountered and their solutions
- **Tool usage**: CLI commands, MCP tools, or scripts that prove useful
- **Architecture decisions**: Important design choices or constraints
- **Environment setup**: Configuration that took trial-and-error to get right
- **Integration quirks**: Third-party service behaviors (Privy, Ethos, Vercel, etc.)

When suggesting changes, briefly explain why the addition would be valuable. Keep documentation concise and actionable - focus on what helps get work done, not exhaustive reference material.
