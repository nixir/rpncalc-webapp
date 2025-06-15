# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build` (includes type checking)
- **Type check only**: `npm run type-check`
- **Lint code**: `npm run lint`
- **Format code**: `npm run format`
- **Run unit tests**: `npm run test:unit`
- **Run e2e tests**: `npm run test:e2e`

## Architecture

This is a Vue 3 + TypeScript web application for an RPN (Reverse Polish Notation) calculator.

**Tech Stack:**
- Vue 3 with Composition API
- TypeScript
- Vite (build tool)
- Pinia (state management)
- Vitest (unit testing)
- Playwright (e2e testing)
- ESLint + Prettier (code quality)

**Project Structure:**
- `src/components/` - Vue components
- `src/stores/` - Pinia stores for state management
- `src/assets/` - Static assets (CSS, images)
- `e2e/` - End-to-end tests
- `src/components/__tests__/` - Unit tests

**Key Conventions:**
- Uses `@` alias for `src/` directory
- Vue SFC (Single File Components) with `<script setup>` syntax
- Composition API with Pinia stores
- TypeScript strict mode enabled

**Deployment Configuration:**
- Vite base path is set to `/rpncalc-webapp/` for GitHub Pages deployment