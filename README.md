# Votive

> *Every action is a vote for who you're becoming.*

Self-discovery before goal-setting. Most habit apps fail because they skip the foundation—understanding who you already are.

Votive guides you through a behavioral psychology assessment, then uses AI to find patterns, contradictions, and blind spots you can't see yourself.

## The Framework

A 5-phase identity-based approach to sustainable change:

| Phase | Focus | Status |
|-------|-------|--------|
| 1. State Awareness | Energy, mood, motivation patterns | ✅ Implemented |
| 2. Identity Mapping | Current self through behaviors & values | ✅ Implemented |
| 3. Identity Design | Aspirational identity with stepping-stones | 🔜 Planned |
| 4. System Implementation | Habit loops & environment design | 🔜 Planned |
| 5. Feedback & Integration | Progress tracking & reinforcement | 🔜 Planned |

## Core Principles

- **Identity over outcomes** — "I am someone who..." beats "I want to..."
- **Keystone behaviors** — Small actions with cascading effects across life
- **Identity bridges** — Believable stepping-stones between current and aspirational self
- **Systems over motivation** — Habits bypass the unreliable need for willpower

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Zustand
- **Backend**: Node.js + Express + TypeScript
- **Prompt Service**: Express + Prisma + SQLite (encrypted with libsql)
- **Worker**: Background job scheduler (node-cron)
- **Build**: tsup (server packages) + Vite (frontend)
- **Styling**: Tailwind CSS v4
- **Internationalization**: i18next (English & Polish)
- **AI Analysis**: Claude API via backend proxy
- **Testing**: Vitest + React Testing Library (all packages)

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Anthropic API key
- mkcert (for HTTPS certificates)

### HTTPS Certificates Setup

Generate locally-trusted certificates using mkcert (required for Docker):

```bash
# Install mkcert (macOS)
brew install mkcert
mkcert -install

# Install mkcert (Windows - run as Administrator)
choco install mkcert
mkcert -install

# Generate certificates
mkdir -p certs
cd certs
mkcert localhost 127.0.0.1 ::1
cd ..
```

### Quick Start

Run the full stack using Docker:

```bash
# macOS/Linux
ANTHROPIC_API_KEY=<YOUR_KEY> \
DATABASE_KEY=<32+_CHAR_SECRET> \
ADMIN_API_KEY=<32+_CHAR_SECRET> \
SESSION_SECRET=<32+_CHAR_SECRET> \
JWT_ACCESS_SECRET=<32+_CHAR_SECRET> \
JWT_REFRESH_SECRET=<32+_CHAR_SECRET> \
  docker compose up --build

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="<YOUR_KEY>"
$env:DATABASE_KEY="<32+_CHAR_SECRET>"
$env:ADMIN_API_KEY="<32+_CHAR_SECRET>"
$env:SESSION_SECRET="<32+_CHAR_SECRET>"
$env:JWT_ACCESS_SECRET="<32+_CHAR_SECRET>"
$env:JWT_REFRESH_SECRET="<32+_CHAR_SECRET>"
docker compose up --build
```

Once running:
- **Frontend**: https://localhost (via nginx)
- **Backend API**: https://localhost/api/v1
- **Admin UI**: http://localhost:3002/admin

For pre-built images (faster startup):

```bash
docker compose -f oci://oxilith/votive-oci:latest up
```

See [Docker Hub Workflow](docs/docker-hub.md) for complete documentation including:
- Local build instructions
- HTTPS configuration
- Multi-arch image publishing (maintainers)
- Troubleshooting guide

See [Production Deployment](docs/production-deployment.md#environment-variables) for the complete environment variable reference.

## Project Structure

```
├── app/                    # React frontend
│   └── src/
│       ├── components/     # UI components (assessment/, insights/, shared/)
│       ├── contexts/       # React contexts (theme)
│       ├── i18n/           # Internationalization (en/, pl/)
│       ├── services/       # API client & service layer
│       ├── stores/         # Zustand state management
│       └── styles/         # Theme utilities
├── backend/                # Express API proxy
│   └── src/
│       ├── config/         # Environment validation (Zod)
│       ├── health/         # Health checks (prompt-service dependency)
│       ├── middleware/     # CORS, rate limiting, error handling
│       ├── routes/         # API endpoints
│       ├── services/       # Claude API, prompt client, circuit breaker, cache
│       └── utils/          # Logger (Pino)
├── prompt-service/         # Prompt management microservice
│   ├── prisma/             # SQLite schema & migrations
│   └── src/
│       ├── admin/          # React admin UI
│       ├── routes/         # REST API endpoints
│       └── services/       # Prompt CRUD, A/B testing, resolver
├── worker/                 # Background job scheduler
│   └── src/
│       ├── jobs/           # Job implementations (token cleanup)
│       └── scheduler/      # Generic cron scheduler
├── shared/                 # Shared TypeScript types
│   └── src/                # Types, validation, utilities
├── docs/                   # Documentation
└── personas/               # Sample assessment data
```

## Available Commands

This repository uses **npm workspaces** for unified dependency management. Run commands from the project root.

```bash
npm install              # Install all workspaces
npm run lint             # Lint all projects
npm run type-check       # Type-check all projects
npm run build            # Build all projects (shared first)
npm run test:run         # Run all tests (once)
npm run test:coverage    # Run all tests with coverage

# Database (prompt-service)
npm run db:migrate       # Run database migrations
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed initial data
npm run db:studio        # Open Prisma Studio
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design, diagrams, and technical decisions |
| [AI Agent Codebase Instructions](docs/AI-Agent-Codebase-Instructions.md) | Module system, imports, build, and coding conventions |
| [Ink & Stone Design System](docs/votive-ink-design-system.md) | Visual language, component patterns, and animation guidelines |
| [Production Deployment](docs/production-deployment.md) | Environment variables, security, and deployment best practices |
| [Docker Hub Workflow](docs/docker-hub.md) | Container deployment, publishing, and troubleshooting |
| [Known Limitations](docs/known-limitations.md) | Cache behavior, scaling considerations, and operational details |
| [Motivation](docs/Motivation.md) | Theoretical framework and psychology principles |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/claude/analyze` | Submit assessment for AI analysis |
| GET | `/health` | Backend health check |

## Test Data

Sample personas available in `/personas/` for quick testing:
- `persona-1-burned-out-achiever-{en,pl}.json`
- `persona-2-scattered-creative-{en,pl}.json`
- `persona-3-careful-planner-{en,pl}.json`
