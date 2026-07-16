import { useEffect, useMemo, useRef, useState } from 'react';
import EmptyState from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import { formatDate, formatTime, todayISO } from '../utils/helpers';

const modes = [
  { name: 'Focus Sprint', focus: 25, break: 5 },
  { name: 'Deep Work', focus: 50, break: 10 },
  { name: 'Long Focus', focus: 90, break: 20 },
  { name: 'Custom', focus: 30, break: 5 },
];

export default function FocusMode() {
  const { focusHistory, addItem, deleteItems, showToast } = useApp();
  const [selected, setSelected] = useState(modes[0]);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [secondsLeft, setSecondsLeft] = useState(modes[0].focus * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const totalMinutes = selected.name === 'Custom' ? Number(customMinutes) : selected.focus;
  const totalSeconds = totalMinutes * 60;
  const progress = totalSeconds ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  useEffect(() => {
    if (!running) return undefined;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalRef.current);
          setRunning(false);
          showToast('success', 'Focus block finished. Save the session when you are ready.');
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalRef.current);
  }, [running, showToast]);

  useEffect(() => () => window.clearInterval(intervalRef.current), []);

  const chooseMode = (mode) => {
    window.clearInterval(intervalRef.current);
    setRunning(false);
    setSelected(mode);
    setSecondsLeft((mode.name === 'Custom' ? customMinutes : mode.focus) * 60);
  };

  const reset = () => {
    window.clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const complete = () => {
    addItem('focusHistory', { date: todayISO(), mode: selected.name, minutes: totalMinutes, completedAt: new Date().toISOString() }, `Completed a ${totalMinutes}-minute focus session`, 'focus');
    showToast('success', 'Focus session saved.');
    reset();
  };

  const completedToday = useMemo(() => focusHistory.filter((item) => item.date === todayISO()).length, [focusHistory]);
  const minutesToday = useMemo(() => focusHistory.filter((item) => item.date === todayISO()).reduce((sum, item) => sum + Number(item.minutes || 0), 0), [focusHistory]);

  return (
    <main className="private-page focus-page">
      <div className="private-shell">
        <section className="focus-scene focus-scene-bg">
          <img src="/assets/focus-real.png" alt="A realistic calm study scene with a focus timer" />
          <div className="focus-scene-copy">
            <span className="eyebrow light">One task. One ending.</span>
            <h1>Protect a focused block without making the whole day strict.</h1>
            <p>Choose the result you want before starting. The timer holds the boundary so you do not need to keep checking the clock.</p>
            <div className="focus-scene-stats"><div><strong>{completedToday}</strong><span>sessions today</span></div><div><strong>{minutesToday}</strong><span>focused minutes</span></div></div>
          </div>
        </section>

        <section className="focus-workspace">
          <article className="focus-main-panel">
            <div className="mode-selector simplified-modes">
              {modes.map((mode) => <button key={mode.name} type="button" className={selected.name === mode.name ? 'active' : ''} onClick={() => chooseMode(mode)}><strong>{mode.focus}</strong><span>{mode.name}</span></button>)}
            </div>
            {selected.name === 'Custom' && <label className="custom-time-field"><span>Custom minutes</span><input type="number" min="1" max="180" value={customMinutes} onChange={(event) => { const value = Math.min(180, Math.max(1, Number(event.target.value))); setCustomMinutes(value); if (!running) setSecondsLeft(value * 60); }} /></label>}
            <div className="focus-timer-stage">
              <div className="timer-ring" style={{ '--timer-progress': `${progress * 3.6}deg` }}><div><span>{running ? 'Focus in progress' : secondsLeft === 0 ? 'Block complete' : 'Ready'}</span><strong>{formatTime(secondsLeft)}</strong><small>{selected.name}</small></div></div>
              <div className="focus-task-message"><span>Before you start</span><p>Close unrelated tabs, silence nonessential notifications, and keep only one result in view.</p></div>
            </div>
            <div className="timer-controls"><button className="button" type="button" onClick={() => setRunning(true)} disabled={running || secondsLeft === 0}>Start</button><button className="button button-secondary" type="button" onClick={() => setRunning(false)} disabled={!running}>Pause</button><button className="button button-ghost" type="button" onClick={reset}>Reset</button><button className="button button-success" type="button" onClick={complete}>Save session</button></div>
          </article>

          <aside className="focus-history-panel">
            <div className="panel-heading"><span>After the block</span><h2>Take a {selected.break}-minute recovery break.</h2><p>Look into the distance, move your shoulders, drink water, and avoid replacing focused work with a fast feed.</p></div>
            <div className="simple-record-list focus-records">
              {focusHistory.slice(0, 3).map((item) => <div className="simple-record" key={item.id}><div className="simple-record-main"><strong>{item.mode}</strong><p>{item.minutes} minutes · {formatDate(item.date)}</p></div><div className="simple-record-actions"><button type="button" onClick={() => window.confirm('Delete this focus session?') && deleteItems('focusHistory', [item.id], 'Session')}>Delete</button></div></div>)}
              {!focusHistory.length && <EmptyState title="No focus sessions yet" text="Complete one block and save it here." icon="◎" />}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
