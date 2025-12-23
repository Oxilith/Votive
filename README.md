# Identity Foundations Assessment

A full-stack behavioral psychology and habit formation application that guides users through self-discovery and provides AI-powered pattern analysis for sustainable personal change.

## Overview

This application implements a 5-phase framework for identity-based habit formation:

1. **State Awareness** - Understanding fluctuating states (mood, energy, motivation patterns)
2. **Identity Mapping** - Discovering current self-identity through behaviors and values
3. **Identity Design** - Defining aspirational identity with achievable stepping-stones
4. **System Implementation** - Building habit loops and environment design
5. **Feedback & Integration** - Tracking progress and reinforcing identity through behavioral evidence

## Key Concepts

- **Habit Loop**: Cue → Craving → Response → Reward
- **Keystone Behaviors**: Actions with cascading positive effects across life domains
- **Identity-Based Goals**: "I am someone who..." rather than "I want to..."
- **Identity Bridge**: Intermediate identities connecting current self to aspirational self

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Zustand
- **Backend**: Node.js + Express + TypeScript
- **Styling**: Tailwind CSS v4
- **Internationalization**: i18next (English & Polish)
- **AI Analysis**: Claude API via backend proxy
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites
- Node.js >= 20.0.0
- Anthropic API key
- mkcert (for local HTTPS)

### HTTPS Setup (Local Development)

Generate locally-trusted certificates using mkcert:

```bash
# Install mkcert (macOS)
brew install mkcert
mkcert -install

# Generate certificates
mkdir -p certs
cd certs
mkcert localhost 127.0.0.1 ::1
cd ..
```

### Quick Start

```bash
# Backend setup
cd backend
npm install
cp .env.example .env  # Add your ANTHROPIC_API_KEY
npm run dev           # Starts on https://localhost:3001

# Frontend setup (new terminal)
cd app
npm install
npm run dev           # Starts on https://localhost:3000
```

### Environment Setup

**Backend** (`/backend/.env`):
```
ANTHROPIC_API_KEY=sk-ant-...  # Required
PORT=3001
NODE_ENV=development
HTTPS_ENABLED=true
CORS_ORIGIN=https://localhost:3000
THINKING_ENABLED=true         # Enable/disable Claude extended thinking mode
```

**Frontend** (`/app/.env`):
```
VITE_API_URL=https://localhost:3001
```

## Project Structure

```
├── app/                    # React frontend
│   └── src/
│       ├── components/     # UI components (assessment/, insights/, shared/)
│       ├── config/         # AI prompt configurations
│       ├── contexts/       # React contexts (theme)
│       ├── i18n/           # Internationalization (en/, pl/)
│       ├── services/       # API client & service layer
│       ├── stores/         # Zustand state management
│       ├── styles/         # Theme utilities
│       └── types/          # TypeScript interfaces
├── backend/                # Express API proxy
│   └── src/
│       ├── config/         # Environment validation (Zod)
│       ├── middleware/     # CORS, rate limiting, error handling
│       ├── routes/         # API endpoints
│       ├── services/       # Claude API integration
│       └── utils/          # Logger (Pino)
├── docs/                   # Documentation
│   ├── Motivation.md       # Framework theory
│   └── ClaudeDocs/         # Claude Code guidance
└── personas/               # Sample assessment data
```

## Available Commands

### Frontend (`/app`)
```bash
npm run dev           # Start Vite dev server
npm run build         # Production build
npm run lint          # Run ESLint
npm run type-check    # TypeScript check
npm run test          # Run tests (watch)
npm run test:run      # Run tests (once)
npm run test:coverage # Tests with coverage
```

### Backend (`/backend`)
```bash
npm run dev           # Start with hot reload
npm run build         # Compile TypeScript
npm run start         # Run production build
npm run lint          # Run ESLint
npm run test          # Run tests
```

### Docker

#### Quick Start (OCI from Docker Hub)

Pull and run the pre-built multi-arch images:

```bash
ANTHROPIC_API_KEY=<YOUR_KEY> docker compose -f oci://oxilith/identity-assessment-comb:latest up
```

This starts:
- Frontend: https://localhost (port 443, HTTPS)
- Backend: http://localhost:3001 (internal, proxied through nginx)

#### Local Build & Run

```bash
ANTHROPIC_API_KEY=<YOUR_KEY> docker compose up --build
```

#### Trusted HTTPS (No Browser Warning)

By default, Docker generates self-signed certificates (browser shows warning). For trusted HTTPS:

```bash
# Install mkcert and set up local CA (one-time)
brew install mkcert nss
mkcert -install

# Generate trusted certificates
mkdir -p certs && cd certs
mkcert localhost 127.0.0.1 ::1
cd ..

# Run Docker (certificates auto-detected)
ANTHROPIC_API_KEY=<YOUR_KEY> docker compose -f oci://oxilith/identity-assessment-comb:latest up
```

#### Build & Publish (Maintainers)

```bash
# Clean rebuild for multi-arch (linux/amd64 + linux/arm64)
docker rmi oxilith/identity-assessment-frontend:latest
docker rmi oxilith/identity-assessment:latest
docker buildx prune -f
docker buildx bake --push --no-cache

# Publish OCI compose artifact
docker compose publish --with-env oxilith/identity-assessment-comb:latest
```

#### Clear OCI Cache (After Image Updates)

```bash
# macOS
rm -rf "$HOME/Library/Caches/docker-compose/"

# Then re-run
ANTHROPIC_API_KEY=<YOUR_KEY> docker compose -f oci://oxilith/identity-assessment-comb:latest up
```

**Docker Hub Repositories:**
- `oxilith/identity-assessment` - Backend API
- `oxilith/identity-assessment-frontend` - Nginx + React
- `oxilith/identity-assessment-comb` - OCI compose artifact

## Framework Documentation

See [docs/Motivation.md](docs/Motivation.md) for the complete theoretical framework including:
- Core states (Mood, Energy, Motivation)
- Behavior types (Automatic, Motivation-driven, Keystone)
- Habit architecture and mechanisms
- Identity concepts and psychological principles

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
