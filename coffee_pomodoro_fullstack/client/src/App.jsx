import React, { useEffect, useMemo, useRef, useState } from 'react'

const API = import.meta.env.VITE_API_URL || ''

function msFromMinutes(m) { return Math.max(0, Math.round(m) * 60 * 1000) }
function fmt(t) {
  const m = Math.floor(t / 60000)
  const s = Math.floor((t % 60000) / 1000)
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function App() {
  const [cfg, setCfg] = useState({ focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, cyclesPerLongBreak: 4 })
  const [phase, setPhase] = useState('focus') // 'focus' | 'short' | 'long'
  const [remaining, setRemaining] = useState(msFromMinutes(cfg.focusMinutes))
  const [running, setRunning] = useState(false)
  const [cycle, setCycle] = useState(0) // completed focus count toward long break
  const [stats, setStats] = useState({ focusMinutesToday: 0, focusSessionsToday: 0, coffeesEarnedToday: 0 })
  const timerRef = useRef(null)
  const activeSessionId = useRef(null)

  // Load config + stats
  useEffect(() => {
    fetch(`${API}/api/config`).then(r=>r.json()).then(setCfg).catch(()=>{})
    fetch(`${API}/api/stats`).then(r=>r.json()).then(setStats).catch(()=>{})
  }, [])

  // Update remaining when config or phase changes
  useEffect(() => {
    if (phase === 'focus') setRemaining(msFromMinutes(cfg.focusMinutes))
    if (phase === 'short') setRemaining(msFromMinutes(cfg.shortBreakMinutes))
    if (phase === 'long') setRemaining(msFromMinutes(cfg.longBreakMinutes))
  }, [cfg, phase])

  // Tick loop
  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1000
        if (next <= 0) {
          clearInterval(timerRef.current)
          handleComplete()
          return 0
        }
        return next
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running])

  const phaseLabel = useMemo(() => ({
    focus: "Focus",
    short: "Short Break",
    long: "Long Break",
  }[phase]), [phase])

  async function startSession() {
    if (running) return
    const res = await fetch(`${API}/api/sessions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: phase })
    }).then(r=>r.json()).catch(()=>null)
    activeSessionId.current = res?.id || null
    setRunning(true)
  }

  async function pause() {
    setRunning(false)
  }
  async function reset() {
    setRunning(false)
    if (phase === 'focus') setRemaining(msFromMinutes(cfg.focusMinutes))
    if (phase === 'short') setRemaining(msFromMinutes(cfg.shortBreakMinutes))
    if (phase === 'long') setRemaining(msFromMinutes(cfg.longBreakMinutes))
  }

  async function handleComplete() {
    setRunning(false)
    // close session
    if (activeSessionId.current) {
      await fetch(`${API}/api/sessions/${activeSessionId.current}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endTime: new Date().toISOString(), status: 'completed' })
      }).catch(()=>{})
      activeSessionId.current = null
    }
    // next phase logic
    if (phase === 'focus') {
      const nextCycle = cycle + 1
      setCycle(nextCycle)
      if (nextCycle % (cfg.cyclesPerLongBreak || 4) === 0) {
        setPhase('long')
      } else {
        setPhase('short')
      }
    } else {
      setPhase('focus')
    }
    // refresh stats
    fetch(`${API}/api/stats`).then(r=>r.json()).then(setStats).catch(()=>{})
  }

  function skip() {
    setRemaining(0)
    handleComplete()
  }

  function applySettings(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const newCfg = {
      focusMinutes: Number(form.get('focusMinutes')),
      shortBreakMinutes: Number(form.get('shortBreakMinutes')),
      longBreakMinutes: Number(form.get('longBreakMinutes')),
      cyclesPerLongBreak: Number(form.get('cyclesPerLongBreak'))
    }
    fetch(`${API}/api/config`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCfg)
    }).then(r=>r.json()).then(setCfg)
  }

  return (
    <div className="container">
      <div className="header">
        <div className="brand">☕ Coffee Pomodoro</div>
        <div className="badges">
          <div className="badge">React + Vite</div>
          <div className="badge">Express API</div>
          <div className="badge">JSON storage</div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="phase">{phaseLabel}</div>
          <div className="timer-display">{fmt(remaining)}</div>
          <div className="controls">
            <button className="primary" onClick={startSession} disabled={running}>Start</button>
            <button onClick={pause} disabled={!running}>Pause</button>
            <button onClick={reset}>Reset</button>
            <button className="danger" onClick={skip}>Skip</button>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Today's Stats</div>
          <div>Focus minutes: <strong>{stats.focusMinutesToday}</strong></div>
          <div>Focus sessions: <strong>{stats.focusSessionsToday}</strong></div>
          <div>☕ Coffees earned: <strong>{stats.coffeesEarnedToday}</strong></div>
        </div>

        <div className="card" style={{gridColumn: '1 / -1'}}>
          <div className="section-title">Settings</div>
          <form className="settings-form" onSubmit={applySettings}>
            <div className="row" style={{display:'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem'}}>
              <div>
                <label>Focus (min)</label>
                <input name="focusMinutes" type="number" defaultValue={cfg.focusMinutes} min="1" />
              </div>
              <div>
                <label>Short break (min)</label>
                <input name="shortBreakMinutes" type="number" defaultValue={cfg.shortBreakMinutes} min="1" />
              </div>
              <div>
                <label>Long break (min)</label>
                <input name="longBreakMinutes" type="number" defaultValue={cfg.longBreakMinutes} min="1" />
              </div>
              <div>
                <label>Cycles to long break</label>
                <input name="cyclesPerLongBreak" type="number" defaultValue={cfg.cyclesPerLongBreak} min="1" />
              </div>
            </div>
            <div style={{marginTop: '0.75rem'}}>
              <button className="primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
