# Copilot Instructions for Cortexus

## Project Overview
Cortexus is a full-stack application for manufacturing line monitoring and analytics. It consists of a React + TypeScript + Vite frontend and a Node.js (Express) backend. The backend integrates with RabbitMQ (for messaging) and InfluxDB (for time-series data).

## Architecture & Data Flow
- **Frontend (`frontend/`)**: Built with React, TypeScript, Vite, and Tailwind CSS. Organized by features (see `src/features/`). Pages assemble features and shared components. State management uses Redux Toolkit (see `src/store/`).
- **Backend (`backend/`)**: Node.js/Express API (`src/api/server.js`) exposes endpoints (e.g., `/api/health`). RabbitMQ consumer (`src/services/rabbitmqConsumer.js`) ingests messages for processing and (future) DB storage. Environment variables configure service URLs.
- **Integration**: RabbitMQ and InfluxDB are orchestrated via Docker Compose (`backend/docker-compose.yaml`). The backend connects to these services using environment variables.

## Developer Workflows
- **Frontend**:
  - Start dev server: `npm run dev` (in `frontend/`)
  - Build: `npm run build`
  - Lint: `npm run lint`
  - Preview: `npm run preview`
- **Backend**:
  - Start server: `npm run start` (in `backend/`)
  - Dev mode (auto-reload): `npm run dev`
  - RabbitMQ/InfluxDB: `docker-compose up` (in `backend/`)

## Key Patterns & Conventions
- **Feature-based structure**: Each feature in `frontend/src/features/` is self-contained (components, hooks, state).
- **Shared UI**: Reusable UI components live in `frontend/src/components/ui/` and layout in `frontend/src/components/layout/`.
- **API communication**: Frontend will interact with backend via REST endpoints (see `server.js`).
- **Messaging**: Backend consumes messages from RabbitMQ (`rabbitmqConsumer.js`). Messages are expected to be JSON and will be persisted to DB in future.
- **Environment config**: Use `.env` files for service URLs and secrets. Backend expects `RABBITMQ_URL`.

## External Dependencies
- **RabbitMQ**: Message broker for backend ingestion.
- **InfluxDB**: Time-series database (integration planned).
- **Tailwind CSS**: Used for frontend styling.
- **Heroicons**: Used for dashboard icons.

## Examples
- **Dashboard UI**: See `frontend/src/features/machineDashboard/DashboardPage.tsx` for KPI cards, charts, and status components.
- **RabbitMQ Consumer**: See `backend/src/services/rabbitmqConsumer.js` for message handling pattern.
- **API Health Check**: See `backend/src/api/server.js` for REST endpoint example.

## Tips for AI Agents
- Follow feature-based structure for new functionality.
- Use existing UI and state management patterns for consistency.
- Reference Docker Compose for service orchestration.
- Prefer REST endpoints for frontend-backend communication.
- Use environment variables for service URLs and secrets.

---
If any section is unclear or missing, please ask for clarification or provide feedback to improve these instructions.
