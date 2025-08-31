☕ Coffee Pomodoro – Full Stack

A full-stack Pomodoro timer built with React (Vite) and Node.js + Express.
It helps you stay productive by timing focus sessions, short breaks, and long breaks — while tracking your daily progress.



✨ Features

Start, pause, reset, and skip sessions

Automatic switching between focus, short break, and long break phases

Configurable session lengths and cycles per long break

Daily stats: total focus minutes, completed sessions, and “☕ coffees earned”

Lightweight JSON storage — no database required



🚀 Getting Started
Development

Run frontend and backend in separate terminals:

# Backend
cd server
npm install
npm start       # runs at http://localhost:4000

# Frontend
cd client
npm install
npm run dev     # runs at http://localhost:5173

Production
cd client
npm run build   # builds React app to /dist

cd ../server
npm start       # serves API + built client on http://localhost:4000

⚙️ Tech Stack

Frontend: React, Vite, CSS

Backend: Node.js, Express

Storage: JSON file (sessions + config)



🔑 API Endpoints

GET /api/config – get timer settings

PUT /api/config – update timer settings

POST /api/sessions – start a new session

PATCH /api/sessions/:id – update or end a session

GET /api/stats – today’s focus stats



🌟 Future Improvements

Desktop notifications & sound alerts

Weekly/monthly charts for focus history

User accounts with database support

PWA for offline use



<img width="1072" height="597" alt="image" src="https://github.com/user-attachments/assets/0e1d8c90-53f9-445b-afe7-0f139767e2dc" />
