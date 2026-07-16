import { useMemo, useReducer, useState } from 'react';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';
import { useApp } from '../context/AppContext';
import { formatDate, screenStatus, todayISO } from '../utils/helpers';
import { validateAppUsage, validateScreenEntry } from '../utils/validators';

const screenInitial = { date: todayISO(), total: '', productive: '', entertainment: '', social: '', study: '', notes: '' };
const appInitial = { name: '', category: 'Social Media', timeSpent: '', usageType: 'Neutral', limit: 1, notes: '' };

function formReducer(state, action) {
  switch (action.type) {
    case 'screen-field': return { ...state, screen: { ...state.screen, [action.name]: action.value } };
    case 'app-field': return { ...state, app: { ...state.app, [action.name]: action.value } };
    case 'edit-screen': return { ...state, screen: { ...action.item }, screenEdit: action.item.id, screenErrors: {} };
    case 'edit-app': return { ...state, app: { ...action.item }, appEdit: action.item.id, appErrors: {} };
    case 'screen-errors': return { ...state, screenErrors: action.errors };
    case 'app-errors': return { ...state, appErrors: action.errors };
    case 'reset-screen': return { ...state, screen: screenInitial, screenEdit: null, screenErrors: {} };
    case 'reset-app': return { ...state, app: appInitial, appEdit: null, appErrors: {} };
    default: return state;
  }
}

const categories = ['Social Media', 'Study', 'Work', 'Entertainment', 'Gaming', 'Communication', 'Other'];

export default function UsageHub() {
  const { profile, screenEntries, appUsage, addItem, updateItem, deleteItems, showToast } = useApp();
  const [tab, setTab] = useState('screen');
  const [state, dispatch] = useReducer(formReducer, {
    screen: screenInitial,
    app: appInitial,
    screenEdit: null,
    appEdit: null,
    screenErrors: {},
    appErrors: {},
  });
  const goal = Number(profile.screenGoal || 6);
  const latestScreen = useMemo(() => [...screenEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4), [screenEntries]);
  const latestApps = useMemo(() => [...appUsage].sort((a, b) => Number(b.timeSpent) - Number(a.timeSpent)).slice(0, 4), [appUsage]);
  const topDistraction = useMemo(() => latestApps.find((item) => item.usageType === 'Distracting') || null, [latestApps]);

  const submitScreen = (event) => {
    event.preventDefault();
    const errors = validateScreenEntry(state.screen);
    dispatch({ type: 'screen-errors', errors });
    if (Object.keys(errors).length) return showToast('error', errors.categories || errors.total || errors.date);
    const values = {
      ...state.screen,
      total: Number(state.screen.total || 0),
      productive: Number(state.screen.productive || 0),
      entertainment: Number(state.screen.entertainment || 0),
      social: Number(state.screen.social || 0),
      study: Number(state.screen.study || 0),
    };
    if (state.screenEdit) updateItem('screenEntries', state.screenEdit, values, 'Updated screen time');
    else addItem('screenEntries', values, `Logged ${values.total} hours of screen time`, 'screen');
    showToast(values.total > goal ? 'warning' : 'success', values.total > goal ? 'Today is above your screen-time goal.' : 'Screen-time snapshot saved.');
    dispatch({ type: 'reset-screen' });
  };

  const submitApp = (event) => {
    event.preventDefault();
    const errors = validateAppUsage(state.app);
    dispatch({ type: 'app-errors', errors });
    if (Object.keys(errors).length) return showToast('error', errors.name || errors.timeSpent || errors.limit);
    const values = { ...state.app, timeSpent: Number(state.app.timeSpent), limit: Number(state.app.limit) };
    if (state.appEdit) updateItem('appUsage', state.appEdit, values, `Updated ${values.name} usage`);
    else addItem('appUsage', values, `Added ${values.name} usage`, 'app');
    showToast(values.timeSpent > values.limit ? 'warning' : 'success', values.timeSpent > values.limit ? `${values.name} is above its limit.` : 'App usage saved.');
    dispatch({ type: 'reset-app' });
  };

  return (
    <main className="private-page usage-page">
      <div className="private-shell">
        <section className="usage-intro usage-intro-bg">
          <div className="usage-intro-copy">
            <span className="eyebrow">Notice without overtracking</span>
            <h1>See where your screen time goes.</h1>
            <p>Save one daily total, then add only the apps or categories that influence your focus, sleep, or mood.</p>
            <div className="usage-switch" role="tablist" aria-label="Usage tracker type">
              <button type="button" className={tab === 'screen' ? 'active' : ''} onClick={() => setTab('screen')}>Daily screen time</button>
              <button type="button" className={tab === 'apps' ? 'active' : ''} onClick={() => setTab('apps')}>Important apps</button>
            </div>
          </div>
          <img src="/assets/usage-real.png" alt="A realistic screen-time analytics workspace" />
        </section>

        {tab === 'screen' ? (
          <section className="usage-workspace">
            <article className="usage-form-panel">
              <div className="panel-heading"><span>Daily snapshot</span><h2>{state.screenEdit ? 'Update screen time' : 'Log screen time'}</h2><p>Keep it short. Category values help explain the total, but they do not need to cover every minute.</p></div>
              <form className="wellness-form" onSubmit={submitScreen}>
                <div className="form-grid">
                  <FormField label="Date" error={state.screenErrors.date}><input type="date" value={state.screen.date} onChange={(e) => dispatch({ type: 'screen-field', name: 'date', value: e.target.value })} /></FormField>
                  <FormField label="Total hours" error={state.screenErrors.total}><input type="number" min="0" max="24" step="0.1" value={state.screen.total} onChange={(e) => dispatch({ type: 'screen-field', name: 'total', value: e.target.value })} placeholder="6.5" /></FormField>
                  <FormField label="Study or work"><input type="number" min="0" step="0.1" value={state.screen.study} onChange={(e) => dispatch({ type: 'screen-field', name: 'study', value: e.target.value })} /></FormField>
                  <FormField label="Social media"><input type="number" min="0" step="0.1" value={state.screen.social} onChange={(e) => dispatch({ type: 'screen-field', name: 'social', value: e.target.value })} /></FormField>
                  <FormField label="Entertainment"><input type="number" min="0" step="0.1" value={state.screen.entertainment} onChange={(e) => dispatch({ type: 'screen-field', name: 'entertainment', value: e.target.value })} /></FormField>
                  <FormField label="Other productive use"><input type="number" min="0" step="0.1" value={state.screen.productive} onChange={(e) => dispatch({ type: 'screen-field', name: 'productive', value: e.target.value })} /></FormField>
                </div>
                {state.screenErrors.categories && <p className="form-error-banner">{state.screenErrors.categories}</p>}
                <FormField label="One-line note"><input value={state.screen.notes} onChange={(e) => dispatch({ type: 'screen-field', name: 'notes', value: e.target.value })} placeholder="What shaped today’s usage?" /></FormField>
                <div className="form-actions"><button className="button" type="submit">{state.screenEdit ? 'Save changes' : 'Save snapshot'}</button>{state.screenEdit && <button className="button button-ghost" type="button" onClick={() => dispatch({ type: 'reset-screen' })}>Cancel</button>}</div>
              </form>
            </article>

            <article className="usage-history-panel">
              <div className="panel-heading"><span>Recent days</span><h2>Your screen-time pattern</h2><p>Goal: {goal} hours per day.</p></div>
              <div className="simple-record-list">
                {latestScreen.map((entry) => (
                  <div className="simple-record" key={entry.id}>
                    <div className="simple-record-main"><strong>{formatDate(entry.date)}</strong><span className={`status-badge status-${screenStatus(entry.total, goal).toLowerCase().replace(' ', '-')}`}>{screenStatus(entry.total, goal)}</span><p>{entry.total}h total · {entry.study || entry.productive}h useful · {entry.social}h social</p>{entry.notes && <small>{entry.notes}</small>}</div>
                    <div className="simple-record-actions"><button type="button" onClick={() => dispatch({ type: 'edit-screen', item: entry })}>Edit</button><button type="button" onClick={() => window.confirm('Delete this screen-time record?') && deleteItems('screenEntries', [entry.id], 'Record')}>Delete</button></div>
                  </div>
                ))}
                {!latestScreen.length && <EmptyState title="No screen-time snapshots yet" text="Save today’s total to begin seeing a pattern." icon="◷" />}
              </div>
            </article>
          </section>
        ) : (
          <section className="usage-workspace apps-workspace">
            <article className="usage-form-panel app-form-panel">
              <div className="panel-heading"><span>Only what matters</span><h2>{state.appEdit ? 'Update app usage' : 'Add an app or category'}</h2><p>Track the tools that strongly help or distract you. There is no need to list every app.</p></div>
              <form className="wellness-form" onSubmit={submitApp}>
                <FormField label="App or category" error={state.appErrors.name}><input value={state.app.name} onChange={(e) => dispatch({ type: 'app-field', name: 'name', value: e.target.value })} placeholder="Instagram, YouTube, coding tools…" /></FormField>
                <div className="form-grid">
                  <FormField label="Category"><select value={state.app.category} onChange={(e) => dispatch({ type: 'app-field', name: 'category', value: e.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></FormField>
                  <FormField label="Effect"><select value={state.app.usageType} onChange={(e) => dispatch({ type: 'app-field', name: 'usageType', value: e.target.value })}><option>Helpful</option><option>Neutral</option><option>Distracting</option></select></FormField>
                  <FormField label="Hours used" error={state.appErrors.timeSpent}><input type="number" min="0.1" max="24" step="0.1" value={state.app.timeSpent} onChange={(e) => dispatch({ type: 'app-field', name: 'timeSpent', value: e.target.value })} /></FormField>
                  <FormField label="Daily limit" error={state.appErrors.limit}><input type="number" min="0.1" max="24" step="0.1" value={state.app.limit} onChange={(e) => dispatch({ type: 'app-field', name: 'limit', value: e.target.value })} /></FormField>
                </div>
                <div className="form-actions"><button className="button" type="submit">{state.appEdit ? 'Save changes' : 'Save app'}</button>{state.appEdit && <button className="button button-ghost" type="button" onClick={() => dispatch({ type: 'reset-app' })}>Cancel</button>}</div>
              </form>
            </article>

            <article className="usage-history-panel distraction-panel">
              <div className="panel-heading"><span>Your boundaries</span><h2>Apps worth watching</h2><p>{topDistraction ? `${topDistraction.name} currently needs the clearest boundary.` : 'Your important apps will appear here.'}</p></div>
              <div className="app-meter-list">
                {latestApps.map((item) => {
                  const percent = Math.min(100, (Number(item.timeSpent) / Math.max(Number(item.limit), 0.1)) * 100);
                  return <div className="app-meter" key={item.id}><div><strong>{item.name}</strong><span>{item.usageType}</span></div><p>{item.timeSpent}h of {item.limit}h</p><i><b style={{ width: `${percent}%` }} /></i><div className="simple-record-actions"><button type="button" onClick={() => dispatch({ type: 'edit-app', item })}>Edit</button><button type="button" onClick={() => window.confirm('Delete this app record?') && deleteItems('appUsage', [item.id], 'App')}>Delete</button></div></div>;
                })}
                {!latestApps.length && <EmptyState title="No important apps added" text="Add only the apps that strongly help or distract you." icon="▦" />}
              </div>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}
