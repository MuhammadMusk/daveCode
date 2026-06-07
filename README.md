## PeerShare — Web-Based Peer Learning & Skill Sharing System

This is a full-stack undergraduate-ready project that implements:

- **User + Profile Management**: registration/login (JWT), profiles, skills inventory, visible reputation + rank
- **Smart Peer Matching**: suggests peers by **skill reputation + global reputation + proficiency − workload**
- **Peer Help Forum**: posts, answers, upvote/downvote, **best answer** selection
- **Real-Time Chat**: in-app chat via **WebSockets (Django Channels)**
- **Mobile-first UI**: React (Vite) + Tailwind CSS
- **Database**: PostgreSQL (Docker) + optional SQLite for quick local dev
- **Deployment**: Docker + Nginx reverse proxy

### Tech stack (as requested)

- **Frontend**: React.js (Vite), Tailwind CSS
- **Backend**: Django + Django REST Framework
- **DB**: PostgreSQL
- **Real-time**: Django Channels + Redis
- **Deployment**: Docker, Nginx, Daphne (ASGI)

---

## Run (Option A) — Local dev without Docker (fastest)

This uses **SQLite** and an **in-memory channel layer** (WebSocket chat works in a single backend process).

### 1) Backend

```powershell
cd backend
$env:USE_SQLITE="1"
$env:REDIS_URL=""
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_skills
python manage.py runserver 8000
```

Backend API: `http://localhost:8000/api/`

### 2) Frontend

```powershell
cd frontend
npm install
$env:VITE_API_URL="http://localhost:8000/api"
npm run dev
```

Frontend: `http://localhost:5173/`

---

## Run (Option B) — Full stack with Docker (PostgreSQL + Redis + Nginx)

### Requirements
- Docker Desktop installed (Docker must be available on PATH)

### Start

```powershell
copy .env.example .env
docker compose up -d --build
```

App: `http://localhost/`

---

## Main API endpoints

- **Auth**
  - `POST /api/auth/register/` (username, email?, password)
  - `POST /api/auth/token/` (username, password) → access/refresh
  - `POST /api/auth/token/refresh/`
- **Profile**
  - `GET /api/me/`
  - `PATCH /api/me/profile/`
- **Skills**
  - `GET /api/skills/`
  - `GET/POST /api/user-skills/`
- **Matching**
  - `GET /api/matching/suggest/?skill_id=<id>`
  - `POST /api/matching/requests/`
  - `POST /api/matching/requests/<id>/match/` (peer_id)
- **Forum**
  - `GET/POST /api/forum/posts/`
  - `POST /api/forum/posts/<id>/vote/` (value: 1 or -1)
  - `GET/POST /api/forum/posts/<id>/answers/`
  - `POST /api/forum/answers/<id>/vote/` (value: 1 or -1)
  - `POST /api/forum/posts/<id>/set_best_answer/` (answer_id)
- **Chat**
  - `GET/POST /api/chat/conversations/`
  - `GET/POST /api/chat/conversations/<id>/messages/`

### WebSocket chat

Connect with JWT access token:

- `ws://localhost:8000/ws/chat/conversations/<conversationId>/?token=<accessToken>`

---

## Project structure

- `backend/`: Django + DRF + Channels
- `frontend/`: React + Tailwind
- `deploy/nginx/`: Nginx config + Dockerfile

