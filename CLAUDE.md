# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with spotlight sidecar
- `npm run build` - Production build
- `npm run build:nolint` - Build without linting (use NEXT_PUBLIC_DISABLE_LINT=true)
- `npm run start` - Start production server
- `npm run clean` - Clean build artifacts

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Fix linting and format JSON/YAML files
- `npm run check-types` - TypeScript type checking without emit

### Testing
- `npm run test` - Run unit tests with Vitest
- `npm run test:e2e` - Run Playwright end-to-end tests

### Database
- `npm run db:generate` - Generate Drizzle schema migrations
- `npm run db:migrate` - Run database migrations (production)
- `npm run db:studio` - Open Drizzle Studio for database management

### Storybook
- `npm run storybook` - Run Storybook development server
- `npm run storybook:build` - Build Storybook for production

## Application Architecture

### YCB Companion Overview
YCB Companion is a personal knowledge management system that functions as a "Your Cloud Brain" - capturing, organizing, and enabling AI-powered interaction with various content types (text, images, audio, URLs).

### Key Architectural Patterns

**Hybrid Frontend/Backend Architecture**
- Next.js frontend app that proxies API requests to a cloud backend (`CLOUD_URL`)
- Production uses PostgreSQL

**Authentication & Authorization**
- oidc-client-ts with Keycloak provider integration
- JWT-based sessions with token refresh
- All API routes require authentication via token in `Authorization` header


**API Route Structure**
All API routes in `src/app/[locale]/(auth)/api/` follow authentication patterns:
- Content management: add, addImage, addURL, update, delete
- Search & discovery: search, random, list, fetch
- AI features: chat, generateTitle, transcribe
- Organization: inbox, starred entries, collections, flow sessions

**Frontend Components**
- React components in `src/components/` with TypeScript
- UI components using Tailwind CSS and shadcn/ui
- Internationalization with next-intl
- File upload handling for images and audio

### Environment Configuration
- Environment variables managed through `@t3-oss/env-nextjs` in `src/libs/Env.ts`
- Required: `KEYCLOAK_*` variables, `CLOUD_URL`

### Content Management Flow
1. **Content Capture** - Various upload/add endpoints store content
2. **Processing** - AI-powered title generation, transcription, metadata extraction
3. **Organization** - Inbox → Processing → Final storage with relationships
4. **Search & Retrieval** - Semantic search, full-text search, AI chat interface

### Key Libraries & Integrations
- **Sentry** - Error monitoring and performance tracking
- **OpenAI SDK** - GPT-4o integration for chat and title generation
- **MeiliSearch** - Full-text search capabilities
- **D3.js** - Data visualization components
- **React Hook Form + Zod** - Form handling with validation

### Development Notes
- React Strict Mode disabled to avoid double API calls
- Bundle analyzer available via `ANALYZE=true npm run build`
- Path aliases: `@/*` maps to `src/*`, `@/public/*` maps to `public/*`
- TypeScript strict mode enabled with comprehensive rules