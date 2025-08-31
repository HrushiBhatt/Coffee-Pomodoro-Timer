<img width="1072" height="597" alt="image" src="https://github.com/user-attachments/assets/0e1d8c90-53f9-445b-afe7-0f139767e2dc" /># Coffee-Pomodoro-Timer

☕ Coffee Pomodoro – Full Stack

A full-stack Pomodoro timer that helps you stay productive with focus sessions and breaks.
Built with React (Vite) on the frontend and Node.js + Express on the backend, it provides:

Configurable focus, short break, and long break durations

Automatic phase switching and cycle tracking

Daily stats (focus minutes, sessions, and ☕ coffees “earned”)

Lightweight persistence using a local JSON file — no database setup needed

🚀 Getting Started
Run in Development
# Start the backend
cd server
npm install
npm start       # API runs on http://localhost:4000

# Start the frontend (new terminal)
cd client
npm install
npm run dev     # React app runs on http://localhost:5173

Run in Production
# Build the frontend
cd client
npm run build

# Serve build + API with Express
cd ../server
npm start       # Full app runs on http://localhost:4000

📂 Project Structure
coffee-pomodoro-fullstack/
├── client/   # React + Vite frontend
│   ├── src/App.jsx   # Timer UI & logic
│   ├── src/styles.css
│   └── .env.development (API URL)
└── server/   # Express backend
    ├── index.js       # REST API
    └── data/db.json   # Config + session history

⚙️ Tech Stack

Frontend: React, Vite, CSS

Backend: Node.js, Express, CORS, UUID

Storage: JSON file (config + sessions)

🔑 API Overview

GET /api/config – fetch timer settings

PUT /api/config – update settings

POST /api/sessions – start a new session

PATCH /api/sessions/:id – update/end a session

GET /api/stats – get today’s focus stats

🌟 Future Enhancements

Desktop notifications & sounds when a session ends

Weekly/monthly history and streak charts

User accounts with database support

PWA for offline use
