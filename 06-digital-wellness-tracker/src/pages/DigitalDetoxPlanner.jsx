import { useState } from 'react';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';
import { useApp } from '../context/AppContext';

const initial = { title: '', target: '', duration: 7, allowed: 30, reason: '' };
const presets = [
  { title: 'Quiet Social Evening', target: 'Social media', duration: 3, allowed: 20, reason: 'Create a calmer evening and easier sleep.' },
  { title: 'Study Without Notifications', target: 'Messaging and social apps', duration: 7, allowed: 30, reason: 'Protect focused study blocks.' },
  { title: 'Screen-Free Wind-Down', target: 'All nonessential screens', duration: 7, allowed: 0, reason: 'Stop screens earlier before sleep.' },
];

export default function DigitalDetoxPlanner() {
  const { detoxPlans, addItem, updateItem, deleteItems, showToast } = useApp();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Add a short reset title.';
    if (!form.target.trim()) nextErrors.target = 'Add the app or category you want to limit.';
    if (Number(form.allowed) < 0 || Number(form.allowed) > 1440) nextErrors.allowed = 'Allowed time must be between 0 and 1440 minutes.';
    if (!form.reason.trim()) nextErrors.reason = 'Add the benefit you want to protect.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    addItem('detoxPlans', { ...form, duration: Number(form.duration), allowed: Number(form.allowed), completedDays: [], status: 'active' }, `Created reset plan: ${form.title}`, 'detox');
    showToast('success', 'Digital reset created.');
    setForm(initial);
  };

  const markDay = (plan) => {
    const nextDay = (plan.completedDays?.length || 0) + 1;
    if (nextDay > Number(plan.duration)) return;
    const completedDays = [...(plan.completedDays || []), nextDay];
    updateItem('detoxPlans', plan.id, { completedDays, status: completedDays.length >= Number(plan.duration) ? 'completed' : 'active' }, `Completed reset day ${nextDay}`);
  };

  const togglePause = (plan) => updateItem('detoxPlans', plan.id, { status: plan.status === 'paused' ? 'active' : 'paused' }, `${plan.status === 'paused' ? 'Resumed' : 'Paused'} reset plan`);

  return (
    <main className="private-page detox-page">
      <div className="private-shell">
        <section className="detox-hero detox-hero-bg">
          <div className="detox-hero-copy">
            <span className="eyebrow">Create distance with a reason</span>
            <h1>Make space for something you want back.</h1>
            <p>A digital reset is a temporary boundary—not punishment. Choose one target, one duration, and one benefit worth protecting.</p>
            <div className="detox-preset-row">
              {presets.map((preset) => <button type="button" key={preset.title} onClick={() => setForm(preset)}><strong>{preset.title}</strong><span>{preset.duration} days</span></button>)}
            </div>
          </div>
          <img src="/assets/detox-real.png" alt="A realistic calm planning scene for a digital detox" />
        </section>

        <section className="detox-workspace">
          <article className="detox-form-panel">
            <div className="panel-heading"><span>Create a reset</span><h2>Keep the plan specific.</h2><p>The smaller the target, the easier it is to understand whether the reset helped.</p></div>
            <form className="wellness-form" onSubmit={submit}>
              <FormField label="Reset title" error={errors.title}><input name="title" value={form.title} onChange={update} placeholder="Quiet Social Week" /></FormField>
              <FormField label="App or category" error={errors.target}><input name="target" value={form.target} onChange={update} placeholder="Instagram, gaming, short videos…" /></FormField>
              <div className="form-grid">
                <FormField label="Duration"><select name="duration" value={form.duration} onChange={update}><option value="1">1 day</option><option value="3">3 days</option><option value="7">7 days</option><option value="14">14 days</option></select></FormField>
                <FormField label="Allowed minutes per day" error={errors.allowed}><input name="allowed" type="number" min="0" max="1440" value={form.allowed} onChange={update} /></FormField>
              </div>
              <FormField label="What this space is for" error={errors.reason}><textarea name="reason" rows="3" value={form.reason} onChange={update} placeholder="Better sleep, focused study, more time with family…" /></FormField>
              <button className="button button-full" type="submit">Create digital reset</button>
            </form>
          </article>

          <article className="detox-plan-panel">
            <div className="panel-heading"><span>Your current paths</span><h2>Continue without chasing perfection.</h2><p>Mark a day complete when the boundary was useful. Pause and adjust when real life changes.</p></div>
            <div className="detox-simple-list">
              {detoxPlans.slice(0, 3).map((plan) => {
                const percent = Math.round(((plan.completedDays?.length || 0) / Number(plan.duration)) * 100);
                return <div className="detox-simple-plan" key={plan.id}><div className="detox-plan-title"><div><strong>{plan.title}</strong><span>{plan.target} · {plan.allowed} min/day</span></div><b>{percent}%</b></div><p>{plan.reason}</p><div className="progress-track"><i style={{ width: `${percent}%` }} /></div><small>{plan.completedDays?.length || 0} of {plan.duration} days · {plan.status}</small><div className="detox-actions"><button className="button button-secondary button-small" type="button" disabled={plan.status === 'completed' || plan.status === 'paused'} onClick={() => markDay(plan)}>Complete today</button>{plan.status !== 'completed' && <button className="button button-ghost button-small" type="button" onClick={() => togglePause(plan)}>{plan.status === 'paused' ? 'Resume' : 'Pause'}</button>}<button className="text-button danger-text" type="button" onClick={() => window.confirm('Delete this digital reset?') && deleteItems('detoxPlans', [plan.id], 'Reset')}>Delete</button></div></div>;
              })}
              {!detoxPlans.length && <EmptyState title="No digital reset yet" text="Choose a preset or create a small plan of your own." icon="⌁" />}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
