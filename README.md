# Valentine Week

Rose Day (Day 1) built with React + shadcn-style UI and a FastAPI auth gate.

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment

Backend secrets live in `backend/.env` and frontend API config is in `frontend/.env`.

- `AUTH_USERNAME`
- `AUTH_PASSWORD`
- `SESSION_SECRET`
- `CORS_ORIGINS`
- `MONGODB_URI`
- `MONGODB_DB`
- `VITE_API_URL`

## Notes

This setup uses session cookies. The React app checks `/auth/me` and gates content behind the login view.
For stronger protection in production, host the built frontend behind the FastAPI app or use host-level password protection.
MongoDB is required for saving replies. Use a local MongoDB instance or a hosted one (Atlas) and set `MONGODB_URI`.
