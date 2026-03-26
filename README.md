<p align="center">
  <img src="https://img.shields.io/badge/Willofire-v1.0-1a1a2e?style=for-the-badge&labelColor=0f0f23&color=e94560" alt="Willofire Version" />
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/License-Proprietary-333333?style=for-the-badge" alt="License" />
</p>

<h1 align="center">🔥 Willofire</h1>

<p align="center">
  <strong>AI-powered exam preparation infrastructure for India's government exam aspirants.</strong>
</p>

<p align="center">
  Turn static PDFs into interactive learning. Generate MCQs. Evaluate handwritten answers.<br/>
  Built for scale. Designed for seriousness. Engineered for results.
</p>

---

## The Problem

Every year, millions of Indians prepare for UPSC, SSC, State PSC, and dozens of other government examinations. The preparation cycle is grueling — months of reading dense material, writing practice answers, and waiting for subjective feedback that rarely comes.

The tools available today are either glorified PDF viewers or quiz apps built as weekend projects. None of them treat the aspirant's workflow as a **first-class engineering problem**.

Willofire does.

---

## What Willofire Is

Willofire is a full-stack AI-powered SaaS platform that transforms how government exam aspirants study, practice, and improve.

It takes the aspirant's own study material — uploaded as PDFs — and converts it into an **intelligent, interactive learning loop**:

1. **Upload** your study material  
2. **Ask questions** against it — powered by retrieval-augmented AI  
3. **Generate MCQs** from the content automatically  
4. **Take scored quizzes** with instant feedback  
5. **Upload handwritten answers** for subjective questions  
6. **Receive AI-evaluated feedback** with scoring and improvement notes  
7. **Download everything** — reports, MCQs, evaluations — as clean PDFs  

This isn't a chatbot wrapper. It's a purpose-built learning engine with a production-grade backend, queue-driven AI orchestration, and a premium frontend designed for sustained daily use.

---

## Core Capabilities — V1

| Capability | Description |
|:--|:--|
| **PDF Upload & Processing** | Upload study material. Text extraction with intelligent chunking for downstream AI tasks. |
| **Ask PDF (Retrieval Q&A)** | Ask natural language questions against uploaded documents. Context-aware, citation-backed responses. |
| **MCQ Generation** | AI generates multiple-choice questions from document content — topic-aware, difficulty-calibrated. |
| **MCQ Scoring Engine** | Take generated quizzes with real-time scoring and answer review. |
| **Answer Upload** | Upload handwritten or typed answers for subjective evaluation. |
| **AI Answer Evaluation** | Detailed scoring with structured feedback — content accuracy, structure, and depth analysis. |
| **PDF Report Downloads** | Export MCQ sets, evaluation reports, and study summaries as professionally formatted PDFs. |

---

## Product Roadmap

### V2 — Depth

| Feature | Description |
|:--|:--|
| Live Answer Writing Canvas | In-browser answer writing with real-time AI feedback |
| Advanced Retrieval Pipeline | Hybrid search with re-ranking for higher accuracy Q&A |
| Stronger Analytics Dashboard | Per-topic performance tracking, weakness identification, trend graphs |

### V3 — Scale

| Feature | Description |
|:--|:--|
| Daily Current Affairs Module | AI-curated daily briefs tied to exam syllabi |
| Weekly Practice Sets | Auto-generated weekly test series with progressive difficulty |
| Mentor-Assisted Evaluation | AI + human-in-the-loop evaluation for premium users |
| Adaptive Difficulty Engine | Personalized question difficulty based on performance history |
| Institution Partnerships | White-label platform for coaching institutes and universities |

---

## Tech Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        WILLOFIRE STACK                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────┐               │
│   │              FRONTEND                       │               │
│   │  Next.js 16  ·  React 19  ·  TypeScript     │               │
│   │  Tailwind v4  ·  Radix UI  ·  shadcn/ui     │               │
│   │  TanStack Query  ·  React Hook Form  ·  Zod │               │
│   └──────────────────────┬──────────────────────┘               │
│                          │ REST API                             │
│   ┌──────────────────────▼──────────────────────┐               │
│   │              BACKEND                        │               │
│   │  NestJS 11  ·  TypeScript  ·  Passport JWT  │               │
│   │  Mongoose ODM  ·  Winston Logging           │               │
│   └──┬───────────┬───────────┬──────────────────┘               │
│      │           │           │                                  │
│   ┌──▼──┐   ┌────▼────┐  ┌──▼──────────────┐                   │
│   │Mongo│   │  Redis  │  │  Azure Blob     │                   │
│   │ DB  │   │  + Bull │  │  Storage        │                   │
│   │     │   │  MQ     │  │                 │                   │
│   └─────┘   └────┬────┘  └─────────────────┘                   │
│                  │                                              │
│            ┌─────▼─────────────────────┐                        │
│            │   AI ORCHESTRATION LAYER  │                        │
│            │   OpenAI-compatible API   │                        │
│            │   Queue-driven workers    │                        │
│            └───────────────────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture Philosophy

Willofire's backend is built as a **modular monolith** — a deliberate architectural choice that gives us the organizational clarity of microservices without the operational overhead.

**Key principles:**

- **Bounded modules** — Each domain (Auth, PDF, MCQ, Evaluation, AI) lives in its own NestJS module with clean interfaces. Extracting any module into a standalone service requires zero refactoring of business logic.

- **Queue-first design** — Every AI operation (MCQ generation, answer evaluation, document processing) runs through BullMQ workers backed by Redis. Nothing blocks the request-response cycle.

- **Async processing pipeline** — Heavy operations are dispatched to background workers immediately. The client polls for completion. This keeps API response times consistently under 200ms for all user-facing endpoints.

- **Infrastructure isolation** — Database, cache, storage, and queue systems are abstracted behind dedicated infrastructure modules. Swapping MongoDB for Postgres, or Azure Blob for S3, is a configuration change — not a rewrite.

---

## Frontend Philosophy

The Willofire frontend is not a dashboard bolted onto an API. It's a **purpose-built study interface** designed for hours of sustained use.

**Design principles:**

- **Serious edtech UX** — No gamification gimmicks. No cartoonish colors. The interface is clean, calm, and focused — built for people preparing for the hardest exams in the country.

- **Component-driven architecture** — Built on Radix UI primitives and shadcn/ui, every interactive element is accessible, composable, and consistent across the platform.

- **Server-first rendering** — Next.js App Router with server components where possible, client interactivity only where necessary. Fast initial loads, minimal JavaScript shipped.

- **Type-safe from edge to edge** — Zod schemas validate API responses at the boundary. React Hook Form with Zod resolvers validates user input. TypeScript enforces contracts everywhere between.

---

## Project Structure

```
WILLOFIRE/
│
├── src/                            # ── Backend (NestJS) ──────────────
│   ├── main.ts                     # Application bootstrap
│   ├── app.module.ts               # Root module — wires everything together
│   │
│   ├── modules/
│   │   ├── auth/                   # Authentication — JWT, signup, login, guards
│   │   ├── pdf/                    # PDF upload, text extraction, chunking
│   │   ├── ai/                     # AI orchestration — OpenAI client, prompt management
│   │   ├── mcq/                    # MCQ generation, quiz engine, scoring
│   │   ├── evaluation/             # Answer evaluation pipeline
│   │   ├── pdf-generator/          # PDF report generation (PDFKit)
│   │   └── health/                 # Health check endpoint
│   │
│   ├── infrastructure/
│   │   ├── database/               # MongoDB connection, Mongoose configuration
│   │   ├── queues/                 # BullMQ queue definitions, workers, processors
│   │   ├── redis/                  # Redis connection module
│   │   └── storage/                # Azure Blob Storage abstraction
│   │
│   ├── common/
│   │   ├── guards/                 # JWT auth guard
│   │   ├── decorators/             # Custom decorators (CurrentUser, etc.)
│   │   ├── filters/                # Global exception filters
│   │   ├── interceptors/           # Response transformation interceptors
│   │   ├── pipes/                  # Validation pipes
│   │   ├── constants/              # App-wide constants
│   │   └── utils/                  # Shared utility functions
│   │
│   └── config/                     # Environment configuration schema
│
├── willofire-web/                   # ── Frontend (Next.js) ────────────
│   └── src/
│       ├── app/                    # Next.js App Router — pages & layouts
│       ├── components/             # Reusable UI components (shadcn/ui + custom)
│       ├── features/               # Feature-specific modules
│       ├── lib/                    # API client, utilities, helpers
│       └── types/                  # Shared TypeScript type definitions
│
├── test/                           # E2E test configuration
├── .env.example                    # Environment variable template
├── nest-cli.json                   # NestJS CLI configuration
├── tsconfig.json                   # TypeScript compiler configuration
└── package.json                    # Dependencies & scripts
```

---

## API System

Willofire exposes a RESTful API organized by domain module. All endpoints are versioned under `/api/v1`.

| Domain | Purpose | Auth |
|:--|:--|:--|
| `/api/v1/auth` | Registration, login, token refresh | Public |
| `/api/v1/pdf` | Document upload, retrieval, Q&A | JWT |
| `/api/v1/mcq` | MCQ generation, quiz attempts, scoring | JWT |
| `/api/v1/evaluation` | Answer upload, AI evaluation, results | JWT |
| `/api/v1/downloads` | PDF report generation and retrieval | JWT |
| `/api/v1/health` | System health check | Public |

Request validation is handled globally through NestJS validation pipes with `class-validator` decorators. All responses follow a consistent envelope format with standardized error codes.

---

## Infrastructure

| Component | Technology | Role |
|:--|:--|:--|
| **Primary Database** | MongoDB (Mongoose ODM) | Document storage — users, PDFs, MCQs, evaluations |
| **Cache & Broker** | Redis (ioredis) | Session cache, BullMQ message broker |
| **Task Queues** | BullMQ | Async AI job processing — MCQ generation, evaluation, PDF export |
| **Object Storage** | Azure Blob Storage | PDF file storage, generated report storage |
| **AI Provider** | OpenAI-compatible API | LLM inference — GPT-4o-mini for generation & evaluation |
| **PDF Engine** | PDFKit | Server-side PDF report generation |
| **OCR** | Tesseract.js | Handwritten answer image-to-text extraction |

---

## Installation

### Prerequisites

- Node.js ≥ 20
- MongoDB instance (local or Atlas)
- Redis instance
- Azure Blob Storage account (or local storage for development)

### Backend

```bash
# Clone the repository
git clone https://github.com/your-org/willofire.git
cd willofire

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run start:dev
```

### Frontend

```bash
# Navigate to frontend
cd willofire-web

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Set your API base URL

# Start development server
npm run dev
```

The backend runs on `http://localhost:3000` by default.  
The frontend runs on `http://localhost:3001` by default.

---

## Environment Variables

```env
# ── Application ──────────────────────────────────
NODE_ENV=development
PORT=3000
APP_NAME=Willofire
API_VERSION=v1

# ── MongoDB ──────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/willofire

# ── Redis ────────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ── Authentication ───────────────────────────────
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# ── AI Provider ──────────────────────────────────
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
AI_MAX_CHUNKS=5

# ── Azure Blob Storage ──────────────────────────
AZURE_BLOB_CONNECTION_STRING=your-connection-string
AZURE_BLOB_CONTAINER_NAME=willofire-uploads
BLOB_SAS_EXPIRY_HOURS=24
```

---

## Development Workflow

```bash
# ── Backend ──────────────────────────────────────

npm run start:dev          # Start with hot-reload
npm run build              # Production build
npm run start:prod         # Run production bundle

npm run lint               # Lint all source files
npm run format             # Format with Prettier

npm run test               # Run unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
npm run test:e2e           # End-to-end tests

# ── Frontend ─────────────────────────────────────

cd willofire-web
npm run dev                # Start dev server
npm run build              # Production build
npm run lint               # Lint check
```

---

## Backend API Docs

- Full backend API documentation:
  - `docs/backend-api.md`
- Postman collection (import into Postman):
  - `postman/WILLOFIRE-backend.postman_collection.json`

---

## Deployment Readiness

Willofire is engineered with production deployment in mind from day one — not as an afterthought.

- **Stateless API layer** — No in-memory state. Horizontal scaling is trivial behind a load balancer.
- **Externalized storage** — All file assets live in Azure Blob Storage. No local filesystem dependencies in production.
- **Managed database** — MongoDB Atlas-ready configuration with connection pooling and retry logic.
- **Queue persistence** — BullMQ jobs are persisted in Redis. Worker crashes don't lose work. Failed jobs retry automatically with exponential backoff.
- **Environment-driven configuration** — Every deployment parameter is controlled through environment variables. Zero code changes between staging and production.
- **Structured logging** — Winston-based logging with configurable transports. Production logs ship as structured JSON.
- **Health endpoint** — `/api/v1/health` for load balancer probes and uptime monitoring.

---

<p align="center">
  <br/>
  <strong>Willofire</strong> is not another edtech experiment.<br/>
  It is production-grade learning infrastructure — engineered for the aspirants who refuse to settle for less.
  <br/><br/>
  <em>Built with conviction. Shipped with precision.</em>
  <br/><br/>
  <img src="https://img.shields.io/badge/Status-Active_Development-e94560?style=flat-square&labelColor=1a1a2e" alt="Status" />
</p>
