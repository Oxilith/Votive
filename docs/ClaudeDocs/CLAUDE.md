# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Identity Foundations Assessment - a full-stack behavioral psychology assessment application with AI-powered analysis.

**Architecture**: Monorepo with three packages:
- `/app` - React frontend
- `/backend` - Express API proxy
- `/shared` - Shared TypeScript types (single source of truth)

## Build & Development Commands

### Frontend (`/app`)
```bash
npm run dev           # Vite dev server (localhost:5174)
npm run build         # TypeScript + Vite production build
npm run lint          # ESLint
npm run type-check    # TypeScript only
npm run test          # Vitest watch mode
npm run test:run      # Vitest single run
npm run test:coverage # Coverage report (80% threshold)
```

### Backend (`/backend`)
```bash
npm run dev           # tsx watch (localhost:3001)
npm run build         # TypeScript compile
npm run start         # Run compiled dist/
npm run lint          # ESLint
npm run type-check    # TypeScript only
npm run test          # Vitest
npm run test:coverage # Coverage report
```

### Docker
```bash
docker compose up --build   # Build and run full stack (frontend:80, backend:3001)
docker compose up           # Run existing images
docker compose down         # Stop containers
```
Requires `ANTHROPIC_API_KEY` environment variable (export or .env file).

## Code Standards

### TypeScript
- **No `any` types** - use specific types or `unknown`
- **Path aliases** - always use `@/` imports, never relative paths
- **Shared types** - use `shared/` for types shared between frontend/backend (not `@shared/`)
- **Strict mode** - `noUnusedLocals`, `noUnusedParameters` enforced
- Use `React.ComponentRef` (not deprecated `React.ElementRef`)

### Documentation Headers
Every component/service requires JSDoc header:
```typescript
/**
 * @file src/path/to/file.ts
 * @purpose Single sentence describing business value (max 25 words)
 * @functionality
 * - Feature bullet 1
 * - Feature bullet 2
 * @dependencies
 * - React hooks, custom components, external libraries
 */
```

### Quality Gates
- All changes must pass `npm run lint` and `npm run type-check` with zero warnings/errors
- Documentation must be updated when code changes

## Architecture

### Shared Package (`/shared/src`)

Single source of truth for types, validation, and utilities used by both frontend and backend:
- `assessment.types.ts` - Core domain types (TimeOfDay, MoodTrigger, CoreValue, WillpowerPattern, AssessmentResponses)
- `analysis.types.ts` - AI analysis result types (AnalysisPattern, AnalysisContradiction, AnalysisBlindSpot, AnalysisLeveragePoint, AnalysisRisk, IdentitySynthesis, AIAnalysisResult)
- `api.types.ts` - API types (AnalysisLanguage, SUPPORTED_LANGUAGES)
- `labels.ts` - Human-readable label mappings for enum values
- `validation.ts` - Enum value arrays for Zod schemas, REQUIRED_FIELDS, field categorization (ARRAY_FIELDS, NUMBER_FIELDS, STRING_FIELDS)
- `responseFormatter.ts` - Shared `formatResponsesForPrompt()` function for AI analysis
- `prompts.ts` - AI prompt templates (IDENTITY_ANALYSIS_PROMPT)
- `index.ts` - Barrel exports

Import via `shared/index` in both frontend and backend (e.g., `import { ... } from 'shared/index'`).

### Frontend (`/app/src`)

**State Management** - Zustand stores (not Redux):
- `stores/useAssessmentStore.ts` - Assessment responses with localStorage persistence
- `stores/useUIStore.ts` - View state, navigation, loading/error
- `stores/useAnalysisStore.ts` - AI analysis results

**Service Layer**:
- `services/api/ApiClient.ts` - HTTP client with retry logic, timeout handling
- `services/api/ClaudeService.ts` - Backend API calls for analysis
- `services/interfaces/` - TypeScript interfaces for dependency injection

**Key Directories**:
- `components/assessment/` - Multi-phase questionnaire wizard (split into steps/, hooks/, navigation/)
- `components/insights/` - AI analysis display
- `components/shared/` - Header, theme toggle
- `styles/theme.ts` - Shared Tailwind utilities (cardStyles, textStyles)
- `i18n/resources/` - Translations (en/, pl/)
- `config/prompts.ts` - AI prompt configurations (imports prompt from shared)

### Backend (`/backend/src`)

**API Proxy** - Protects Anthropic API key from browser exposure:
- `services/claude.service.ts` - Claude API integration with retry logic (uses prompt and formatter from shared)
- `controllers/claude.controller.ts` - Request handler for analysis endpoint
- `routes/api/v1/` - API route definitions (`/api/v1/claude/analyze`)
- `validators/claude.validator.ts` - Zod request validation using enum arrays from shared
- `types/claude.types.ts` - Re-exports shared types, defines API request/response types
- `middleware/` - CORS, rate limiting, error handling, helmet
- `config/index.ts` - Zod-validated environment configuration
- `utils/logger.ts` - Pino structured logging

### Data Flow
```
Frontend (Zustand) → ApiClient → Backend (Express) → Claude API
                    ↓                        ↓
              localStorage                Pino logs
```

## Environment Variables

### Backend (`/backend/.env`)
```
ANTHROPIC_API_KEY=sk-ant-...  # Required
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5174
```

### Frontend (`/app/.env`)
```
VITE_API_URL=http://localhost:3001
```

## Testing

- Frontend: Vitest + React Testing Library + MSW for mocking
- Backend: Vitest + Supertest
- Test files: `**/__tests__/*.test.ts` or `**/*.test.tsx`
- Coverage thresholds: 80% lines/functions/statements, 75% branches

## Domain Framework

5-phase psychological model (see `/docs/Motivation.md`):
1. **State Awareness** - Energy, mood, motivation patterns
2. **Identity Mapping** - Current self through behaviors/values
3. **Identity Design** - Aspirational identity with stepping-stones
4. **System Implementation** - Habit loops, environment design
5. **Feedback & Integration** - Progress tracking

**AI Analysis Output** (`AIAnalysisResult` type):
- `patterns` - Behavioral patterns with evidence
- `contradictions` - Tensions between values and behaviors
- `blindSpots` - Data-revealed but user-unseen insights
- `leveragePoints` - High-ROI areas for change
- `risks` - Why change attempts might fail
- `identitySynthesis` - Core identity, hidden strengths, next steps

## Docker Architecture

### Shared Package in Docker

The shared package uses `file:../shared` dependency. In Docker:
- TypeScript compiles shared code to `dist/shared/src/`
- Dockerfile copies compiled shared to `node_modules/shared/` at runtime
- Backend imports resolve to `node_modules/shared/` in production

### Container Setup
- Frontend: Nginx Alpine serving Vite build on port 80
- Backend: Node.js 22 Alpine running Express on port 3001
- Backend health check (`/health`) required before frontend starts
- Non-root user (expressjs) in backend container for security

## Test Data

Sample personas in `/personas/`:
- `persona-1-burned-out-achiever-{en,pl}.json`
- `persona-2-scattered-creative-{en,pl}.json`
- `persona-3-careful-planner-{en,pl}.json`
