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
yarn dev                  # Start Next.js dev server (port 3000)

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

## Development Guidelines

- Use TypeScript with strict mode
- Follow Next.js App Router conventions
- Use Server Components for data fetching
- Use Client Components for interactivity
- Style with Tailwind CSS utility classes
