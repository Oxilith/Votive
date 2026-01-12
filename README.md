# Votive

[![CI](https://github.com/Oxilith/Votive/actions/workflows/ci.yml/badge.svg)](https://github.com/Oxilith/Votive/actions/workflows/ci.yml)
[![codecov](https://codecov.io/github/Oxilith/Votive/graph/badge.svg?token=SG0YTF6RYB)](https://codecov.io/github/Oxilith/Votive)

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
- **Prompt Service**: Express + Prisma + PostgreSQL
- **Worker**: Background job scheduler (node-cron)
- **Build**: tsup (server packages) + Vite (frontend)
- **Styling**: Tailwind CSS v4
- **Internationalization**: i18next (English & Polish)
- **AI Analysis**: Claude API via backend proxy
- **Testing**: Vitest + React Testing Library (all packages)

## Getting Started

### Prerequisites
- Docker and Docker Compose
- kind (Kubernetes in Docker): `brew install kind`
- kubectl: `brew install kubernetes-cli`
- helm: `brew install helm`
- sops + age (for secrets): `brew install sops age`
- mkcert (for HTTPS certificates): `brew install mkcert`
- yq (for E2E testing): `brew install yq`

See [Kubernetes Guide](docs/kubernetes-guide.md#prerequisites) for Windows installation instructions.

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

### Quick Start (Local Development with kind)

Votive uses Kubernetes for deployment. For local development, use kind (Kubernetes in Docker):

```bash
# 1. Create cluster with ingress and cert-manager
make cluster-create

# 2. Build and load images
make build-and-load

# 3. Install PostgreSQL
make install-postgres-dev

# 4. Deploy application
make deploy-dev

# 5. Access application
open https://votive.127.0.0.1.nip.io
```

Once running:
- **Frontend**: https://votive.127.0.0.1.nip.io
- **Admin UI**: https://votive.127.0.0.1.nip.io/admin

### E2E Testing

Run E2E tests with Docker Compose (mocked Claude API):

```bash
make test-e2e-full    # All-in-one: start, test, stop
```

See [Kubernetes Guide](docs/kubernetes-guide.md) for complete documentation including:
- Local development workflow
- Secret management with SOPS/age
- Production deployment to Azure AKS
- Windows deployment instructions

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
│   ├── prisma/             # PostgreSQL schema & migrations
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

# E2E Testing (uses Docker Compose with mocked Claude API)
make test-e2e-full       # Start services, run tests, stop services
make test-up             # Start test environment
make test-e2e            # Run E2E tests (services must be running)
make test-down           # Stop test environment
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design, diagrams, and technical decisions |
| [Kubernetes Guide](docs/kubernetes-guide.md) | Local development, K8s deployment, and secrets management |
| [AI Agent Codebase Instructions](docs/AI-Agent-Codebase-Instructions.md) | Module system, imports, build, and coding conventions |
| [Ink & Stone Design System](docs/votive-ink-design-system.md) | Visual language, component patterns, and animation guidelines |
| [Internationalization Guide](docs/InternationalizationGuide.md) | i18n setup, namespaces, and translation patterns |
| [Production Deployment](docs/production-deployment.md) | Environment variables, security, and deployment best practices |
| [Known Limitations](docs/known-limitations.md) | Cache behavior, scaling considerations, and operational details |
| [Motivation](docs/Motivation.md) | Theoretical framework and psychology principles |
| [Testing Strategy](docs/testing-strategy.md) | Test pyramid, patterns, and conventions |

## API Endpoints

### Backend Service (port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/claude/analyze` | Submit assessment for AI analysis |
| GET | `/health` | Backend health check |

### Prompt Service - User Authentication (port 3002)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/user-auth/register` | - | Create new user account |
| POST | `/api/user-auth/login` | - | Authenticate and get tokens |
| POST | `/api/user-auth/refresh` | - | Refresh access token |
| POST | `/api/user-auth/refresh-with-user` | - | Refresh token + get user data |
| POST | `/api/user-auth/logout` | CSRF | Invalidate refresh token |
| POST | `/api/user-auth/logout-all` | JWT+CSRF | Invalidate all sessions |
| POST | `/api/user-auth/password-reset` | - | Request password reset email |
| POST | `/api/user-auth/password-reset/confirm` | - | Confirm password reset |
| GET | `/api/user-auth/verify-email/:token` | - | Verify email address |
| POST | `/api/user-auth/resend-verification` | JWT+CSRF | Resend verification email |
| GET | `/api/user-auth/me` | JWT | Get current user profile |
| PUT | `/api/user-auth/profile` | JWT+CSRF | Update user profile |
| PUT | `/api/user-auth/password` | JWT+CSRF | Change password |
| DELETE | `/api/user-auth/account` | JWT+CSRF | Delete account |

### Prompt Service - User Data (port 3002)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/user-auth/assessment` | JWT+CSRF | Save assessment |
| GET | `/api/user-auth/assessment` | JWT | List user's assessments |
| GET | `/api/user-auth/assessment/:id` | JWT | Get specific assessment |
| POST | `/api/user-auth/analysis` | JWT+CSRF | Save analysis |
| GET | `/api/user-auth/analyses` | JWT | List user's analyses |
| GET | `/api/user-auth/analysis/:id` | JWT | Get specific analysis |

### Prompt Service - Admin (port 3002)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | - | Admin login (API key) |
| POST | `/api/auth/logout` | - | Admin logout |
| GET | `/api/auth/verify` | - | Check admin auth status |
| GET | `/api/prompts` | Admin | List all prompts |
| POST | `/api/prompts` | Admin | Create prompt |
| GET | `/api/ab-tests` | Admin | List A/B tests |
| POST | `/api/ab-tests` | Admin | Create A/B test |
| POST | `/api/resolve` | - | Resolve prompt config (internal) |

**Auth Legend:** JWT = Access token required, CSRF = CSRF token required, Admin = API key or session cookie

## Test Data

Sample personas available in `/personas/` for quick testing:
- `persona-1-burned-out-achiever-{en,pl}.json`
- `persona-2-scattered-creative-{en,pl}.json`
- `persona-3-careful-planner-{en,pl}.json`
