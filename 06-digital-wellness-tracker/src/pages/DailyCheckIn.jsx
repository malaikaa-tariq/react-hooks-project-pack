import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';
import { useApp } from '../context/AppContext';
import { getWeatherBreak } from '../api/weatherApi';
import { formatDate, todayISO } from '../utils/helpers';

const initial = {
  date: todayISO(),
  mood: 'Calm',
  energy: 6,
  stress: 4,
  sleepHours: 8,
  breaks: 3,
  screenBeforeSleep: 'No',
  trigger: '',
  reflection: '',
};
const moods = ['Calm', 'Focused', 'Tired', 'Anxious', 'Distracted', 'Happy'];

export default function DailyCheckIn() {
  const { profile, moodEntries, sleepEntries, saveDailyCheckIn, showToast } = useApp();
  const [form, setForm] = useState(initial);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    getWeatherBreak(profile.country).then(setWeather);
  }, [profile.country]);

  const combined = useMemo(() => {
    const dates = [...new Set([...moodEntries.map((item) => item.date), ...sleepEntries.map((item) => item.date)])];
    return dates.sort((a, b) => b.localeCompare(a)).slice(0, 4).map((date) => ({
      date,
      mood: moodEntries.find((item) => item.date === date),
      sleep: sleepEntries.find((item) => item.date === date),
    }));
  }, [moodEntries, sleepEntries]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const loadRecord = (record) => {
    setForm({
      date: record.date,
      mood: record.mood?.mood || 'Calm',
      energy: record.mood?.energy || 6,
      stress: record.mood?.stress || 4,
      sleepHours: record.sleep?.sleepHours || 8,
      breaks: record.sleep?.breaks || 0,
      screenBeforeSleep: record.sleep?.screenBeforeSleep || 'No',
      trigger: record.mood?.trigger || '',
      reflection: record.mood?.reflection || record.sleep?.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (event) => {
    event.preventDefault();
    const sleepHours = Number(form.sleepHours);
    const energy = Number(form.energy);
    const stress = Number(form.stress);
    const breaks = Number(form.breaks);
    if (!form.date) return showToast('error', 'Choose a date.');
    if (sleepHours < 0 || sleepHours > 24) return showToast('error', 'Sleep hours must be between 0 and 24.');

    const moodValues = { date: form.date, mood: form.mood, energy, stress, trigger: form.trigger, reflection: form.reflection };
    const sleepValues = { date: form.date, sleepHours, breaks, screenBeforeSleep: form.screenBeforeSleep, notes: form.reflection, bedtime: '', wakeTime: '', longestBreak: 0 };
    saveDailyCheckIn(moodValues, sleepValues);

    const needsCare = sleepHours < Number(profile.sleepTarget || 8) - 1 || stress >= 8 || form.screenBeforeSleep === 'Yes';
    showToast(needsCare ? 'guidance' : 'success', needsCare ? 'Check-in saved. Choose a softer screen stopping time or one extra break today.' : 'Daily check-in saved.');
  };

  return (
    <main className="private-page checkin-page">
      <div className="private-shell">
        <section className="checkin-layout">
          <article className="checkin-story-panel checkin-story-bg">
            <img src="/assets/checkin-real.png" alt="A realistic evening wellness check-in scene" />
            <div className="checkin-story-copy">
              <span className="eyebrow light">One check-in, four useful signals</span>
              <h1>Notice how your digital day felt.</h1>
              <p>Mood, energy, sleep, and breaks belong together. Saving them in one place makes the next healthy choice easier to see.</p>
              {weather && <div className="weather-message"><span>{weather.guidance.icon}</span><div><strong>{weather.guidance.title}</strong><p>{weather.guidance.text}</p></div></div>}
            </div>
          </article>

          <article className="checkin-form-panel">
            <div className="panel-heading"><span>Daily reflection</span><h2>Save today’s check-in</h2><p>Saving the same date again updates that day instead of creating a duplicate.</p></div>
            <form className="wellness-form" onSubmit={submit}>
              <FormField label="Date"><input name="date" type="date" value={form.date} onChange={update} /></FormField>
              <FormField label="Mood"><div className="mood-selector compact-moods">{moods.map((mood) => <button key={mood} type="button" className={form.mood === mood ? 'active' : ''} onClick={() => setForm((current) => ({ ...current, mood }))}>{mood}</button>)}</div></FormField>
              <div className="range-pair">
                <FormField label={`Energy ${form.energy}/10`}><input name="energy" type="range" min="1" max="10" value={form.energy} onChange={update} /></FormField>
                <FormField label={`Stress ${form.stress}/10`}><input name="stress" type="range" min="1" max="10" value={form.stress} onChange={update} /></FormField>
              </div>
              <div className="form-grid">
                <FormField label="Sleep hours"><input name="sleepHours" type="number" min="0" max="24" step="0.5" value={form.sleepHours} onChange={update} /></FormField>
                <FormField label="Mindful breaks"><input name="breaks" type="number" min="0" max="30" value={form.breaks} onChange={update} /></FormField>
              </div>
              <FormField label="Screen use before sleep"><select name="screenBeforeSleep" value={form.screenBeforeSleep} onChange={update}><option>No</option><option>Yes</option></select></FormField>
              <FormField label="Main digital trigger"><input name="trigger" value={form.trigger} onChange={update} placeholder="Notifications, comparison, multitasking…" /></FormField>
              <FormField label="One reflection"><textarea name="reflection" rows="3" value={form.reflection} onChange={update} placeholder="What would make the next few hours feel better?" /></FormField>
              <button className="button button-full" type="submit">Save daily check-in</button>
            </form>
          </article>
        </section>

        <section className="checkin-history">
          <div className="section-heading compact-heading"><div><span className="eyebrow">Recent reflections</span><h2>Your last few check-ins</h2></div><p>Select a record to bring its values back into the form.</p></div>
          <div className="checkin-record-grid">
            {combined.map((record) => (
              <button className="checkin-record" type="button" key={record.date} onClick={() => loadRecord(record)}>
                <span>{record.mood?.mood || 'Check-in'}</span>
                <strong>{formatDate(record.date)}</strong>
                <p>{record.sleep?.sleepHours ?? '—'}h sleep · {record.sleep?.breaks ?? 0} breaks</p>
                <small>Energy {record.mood?.energy ?? '—'} · Stress {record.mood?.stress ?? '—'}</small>
              </button>
            ))}
            {!combined.length && <EmptyState title="No daily check-ins yet" text="Save mood, energy, sleep, and breaks together." icon="◡" />}
          </div>
        </section>
      </div>
    </main>
  );
}
