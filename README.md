# Vita

Vita is a desktop-first productivity and activity insights platform that helps users understand how they spend time on their devices and turn that data into actionable habits.

##  Vision

**Turn daily digital activity into clear, actionable productivity insights.**

Vita combines:
- A modern web dashboard for analytics and goal tracking
- A FastAPI backend for secure ingestion and analytics
- A desktop application (Electron) for device activity collection

##  Monorepo Structure

```text
Vita/
├── api/                  # FastAPI backend (Python)
├── desktop/              # Electron desktop app
├── web/                  # Next.js frontend (TypeScript + Tailwind)
├── infra/                # Infrastructure, deployment, and ops docs
├── .gitignore
├── README.md
└── docker-compose.yml    # Local development services (PostgreSQL)
```

##  Tech Stack

### Frontend (`web/`)
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend (`api/`)
- FastAPI
- SQLAlchemy (planned)
- Alembic (planned)
- PostgreSQL

### Desktop (`desktop/`)
- Electron
- TypeScript

### Data
- PostgreSQL

##  MVP Scope

- User authentication
- Activity event ingestion (`POST /events`)
- Daily and weekly analytics
- Focus sessions
- Goals tracking
- Privacy controls (pause tracking, delete/export user data)

##  Directory Details

### `web/`
Contains the user-facing interface:
- Dashboard (daily/weekly insights)
- Goals and focus views
- Settings and privacy controls

### `api/`
Contains backend services:
- REST API endpoints
- Data validation and business logic
- Analytics computation
- Database access layer

### `desktop/`
Contains the desktop collector app:
- Local activity monitoring
- Secure event batching and sync
- User controls (pause/resume tracking)

### `infra/`
Contains infrastructure and ops documentation:
- Environment variable templates
- Deployment notes
- Architecture references

##  Getting Started

### 1) Clone the repository

```bash
git clone https://github.com/ChaoticIssam/Vita.git
cd Vita
```

### 2) Run PostgreSQL locally

```bash
docker compose up -d
```

### 3) Setup backend

```bash
cd api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4) Setup frontend

```bash
cd web
npm install
npm run dev
```

### 5) Setup desktop app

```bash
cd desktop
npm install
npm run dev
```

##  Environment Variables (planned)

Each app will include its own `.env.example` file.

High-level variables:
- `DATABASE_URL` for API/PostgreSQL connection
- `API_BASE_URL` for web/desktop clients
- `JWT_SECRET` (or equivalent auth secret)

##  Testing Strategy (planned)

- Backend: `pytest` (unit + integration)
- Frontend: component tests + e2e
- Desktop: basic integration smoke tests

## 🗺 Roadmap

- [x] Repository scaffold
- [ ] Backend API foundation
- [ ] Frontend dashboard foundation
- [ ] Electron collector foundation
- [ ] Auth + user profiles
- [ ] Analytics engine (daily/weekly)
- [ ] Privacy/export/delete workflows
- [ ] Deployment and demo video

##  Contribution Guidelines

For now, this is a personal portfolio project. Suggested workflow:
1. Create a feature branch from `main`
2. Open PR with clear description and screenshots (if UI)
3. Keep commits small and focused

##  License

No license selected yet. Add one before public distribution.
