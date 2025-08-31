const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// Simple JSON file "db"
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_PATH)) {
  const initial = {
    config: {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      cyclesPerLongBreak: 4
    },
    sessions: []  // {id, type: 'focus'|'short'|'long', startTime, endTime?, status}
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Routes
app.get('/api/config', (req, res) => {
  const db = readDB();
  res.json(db.config);
});

app.put('/api/config', (req, res) => {
  const db = readDB();
  const { focusMinutes, shortBreakMinutes, longBreakMinutes, cyclesPerLongBreak } = req.body || {};
  db.config = {
    focusMinutes: Number(focusMinutes) || db.config.focusMinutes,
    shortBreakMinutes: Number(shortBreakMinutes) || db.config.shortBreakMinutes,
    longBreakMinutes: Number(longBreakMinutes) || db.config.longBreakMinutes,
    cyclesPerLongBreak: Number(cyclesPerLongBreak) || db.config.cyclesPerLongBreak,
  };
  writeDB(db);
  res.json(db.config);
});

app.post('/api/sessions', (req, res) => {
  const db = readDB();
  const { type, startTime } = req.body || {};
  if (!['focus','short','long'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  const session = {
    id: uuidv4(),
    type,
    startTime: startTime || new Date().toISOString(),
    status: 'running'
  };
  db.sessions.push(session);
  writeDB(db);
  res.status(201).json(session);
});

app.patch('/api/sessions/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { endTime, status } = req.body || {};
  const s = db.sessions.find(x => x.id === id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  if (endTime) s.endTime = endTime;
  if (status) s.status = status;
  writeDB(db);
  res.json(s);
});

app.get('/api/sessions', (req, res) => {
  const db = readDB();
  res.json(db.sessions.slice(-200)); // last 200 sessions
});

app.get('/api/stats', (req, res) => {
  const db = readDB();
  // Aggregate focus minutes for today
  const today = new Date();
  const isoDate = today.toISOString().slice(0,10);
  let focusMinutesToday = 0;
  let sessionsToday = 0;

  for (const s of db.sessions) {
    if (!s.endTime) continue;
    if (s.type !== 'focus') continue;
    const end = new Date(s.endTime);
    const dateKey = end.toISOString().slice(0,10);
    if (dateKey === isoDate) {
      const start = new Date(s.startTime);
      const mins = Math.max(0, (end - start) / 60000);
      focusMinutesToday += mins;
      sessionsToday += 1;
    }
  }
  res.json({
    focusMinutesToday: Math.round(focusMinutesToday),
    focusSessionsToday: sessionsToday,
    // whimsical metric: 1 coffee per 25 min focus
    coffeesEarnedToday: Math.floor(focusMinutesToday / 25)
  });
});

// --- Serve client build in production if exists ---
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
