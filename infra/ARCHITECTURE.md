# Vita Architecture (Initial)

## Components
- `desktop` (Electron): captures local activity and sends normalized events.
- `api` (FastAPI): validates, stores, and aggregates events.
- `db` (PostgreSQL): durable storage for users, events, goals, and sessions.
- `web` (Next.js): presents analytics, trends, and privacy controls.

## High-level data flow
1. User interacts with desktop app.
2. Desktop collector creates activity events.
3. Events are sent to FastAPI (`POST /events`).
4. FastAPI stores raw events in PostgreSQL.
5. Analytics endpoints aggregate data for daily/weekly views.
6. Web dashboard queries analytics endpoints and renders charts.
