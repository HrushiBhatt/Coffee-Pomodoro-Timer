# Coffee Pomodoro – Full Stack (React + Express)

A minimal full-stack Coffee Pomodoro timer:
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Storage:** Local JSON file (no database setup required)
- **Features:** Focus/Break cycles, configurable durations, session logging, daily stats

---

## Quick Start (Two terminals)

### Terminal 1 — Backend
```bash
cd server
npm install
npm start           # starts on http://localhost:4000
```

### Terminal 2 — Frontend (dev)
```bash
cd client
npm install
npm run dev         # opens http://localhost:5173 (uses VITE_API_URL to call backend)
```

> If you need to change API URL, edit `client/.env.development`.

---

## Production Build (single server)
Build the client and serve it from Express:

```bash
# 1) Build client
cd client
npm install
npm run build

# 2) Start server (serves client/dist)
cd ../server
npm install
npm start           # http://localhost:4000
```

The server auto-serves `../client/dist` if it exists.

---

## Windows PowerShell notes
If PowerShell blocks npm scripts, either:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```
or run npm via the `.cmd` shim:
```powershell
npm.cmd install
npm.cmd start
```

---

## API
- `GET /api/config` → durations config
- `PUT /api/config` → update config
- `POST /api/sessions` { type: 'focus'|'short'|'long' } → start session
- `PATCH /api/sessions/:id` → end/update session
- `GET /api/sessions` → list recent sessions
- `GET /api/stats` → { focusMinutesToday, focusSessionsToday, coffeesEarnedToday }

---

## Tech Stack
- **Frontend:** React, Vite
- **Backend:** Express
- **Storage:** JSON file
- **Dev convenience:** nodemon (optional)
