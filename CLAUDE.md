# CLAUDE.md

This file provides guidance to Claude Code when working with the squadron project.

## Project Overview

Squadron is a TypeScript/Node.js web application.

## Commands

```bash
# Development
yarn install              # Install dependencies
yarn dev                  # Start development server with hot reload

# Building
yarn build                # Compile TypeScript to JavaScript

# Production
yarn start                # Run compiled application

# Quality
yarn lint                 # Run ESLint
yarn test                 # Run tests
```

## Architecture

- `src/` - TypeScript source code
- `dist/` - Compiled JavaScript output (generated)

## Development Guidelines

- Write TypeScript with strict mode enabled
- Use ES2022+ features
- Keep code modular and well-organized
