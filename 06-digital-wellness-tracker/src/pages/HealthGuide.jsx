import { useEffect, useMemo, useState } from 'react';
import FormField from '../components/FormField';
import { useApp } from '../context/AppContext';
import { getWhoInsights } from '../api/whoApi';

function buildHealthSuggestions(profile, insight) {
  const suggestions = [];
  if (profile.bpLevel === 'High' || profile.bpLevel === 'Very high') {
    suggestions.push('Keep screen breaks active: stand, stretch, or walk regularly, reduce extra salt in meals, and plan a medical follow-up for repeated high blood-pressure readings.');
  } else if (profile.bpLevel === 'Low') {
    suggestions.push('If you often feel weak or dizzy, avoid skipping meals, stay hydrated, and discuss repeated low blood-pressure readings with a clinician.');
  }
  if (profile.sugarLevel === 'High' || profile.sugarLevel === 'Diabetes') {
    suggestions.push('Pair your screen routine with balanced meals, water, and short walks after eating. If your sugar readings remain high, get professional care rather than self-treating.');
  }
  if (profile.stressLevel === 'High') {
    suggestions.push('Use shorter screen blocks, reduce notification noise, and protect a quiet wind-down routine because high stress can make digital overload feel heavier.');
  }
  if (profile.sleepTarget && Number(profile.sleepTarget) < 7) {
    suggestions.push('Try to protect more rest, because too little sleep can make focus and mood recovery harder.');
  }
  if (!suggestions.length) suggestions.push('Keep building balanced habits with movement, water, regular sleep, and calmer transitions away from the screen.');
  if (insight?.digitalHabit) suggestions.push(insight.digitalHabit);
  return suggestions.slice(0, 4);
}

export default function HealthGuide() {
  const { profile, updateProfile } = useApp();
  const [form, setForm] = useState(() => ({
    gender: profile.gender || '',
    ageRange: profile.ageRange || '',
    bpLevel: profile.bpLevel || 'Unsure',
    sugarLevel: profile.sugarLevel || 'Unsure',
    activityLevel: profile.activityLevel || 'Moderate',
    conditions: profile.conditions || '',
  }));
  const [insight, setInsight] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getWhoInsights({ countryName: profile.country, topic: 'healthy habits' }).then((result) => {
      setInsight(result.insights?.[0] || null);
      setMessage(result.message || '');
    });
  }, [profile.country]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const save = (event) => {
    event.preventDefault();
    updateProfile({ ...profile, ...form });
  };

  const suggestions = useMemo(() => buildHealthSuggestions({ ...profile, ...form }, insight), [form, insight, profile]);

  return (
    <main className="private-page health-guide-page">
      <div className="private-shell">
        <section className="health-hero">
          <div className="health-hero-copy">
            <span className="eyebrow">WHO-inspired health guidance</span>
            <h1>Connect your screen habits to your overall health.</h1>
            <p>Share only a few details and DigiBalance will turn public-health context into practical, safe suggestions for your daily routine.</p>
          </div>
          <img src="/assets/health-guide-real.png" alt="A realistic wellness consultation scene with healthy lifestyle planning" />
        </section>

        <section className="health-guide-grid">
          <article className="health-form-panel">
            <div className="panel-heading"><span>Quick health context</span><h2>Only the details that help</h2><p>This page supports healthy-habit reflection. It is not a diagnosis tool.</p></div>
            <form className="wellness-form" onSubmit={save}>
              <div className="form-grid">
                <FormField label="Gender"><select name="gender" value={form.gender} onChange={update}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></FormField>
                <FormField label="Age range"><select name="ageRange" value={form.ageRange} onChange={update}><option value="">Select</option><option>Under 18</option><option>18–24</option><option>25–34</option><option>35–44</option><option>45–54</option><option>55+</option></select></FormField>
                <FormField label="Blood pressure"><select name="bpLevel" value={form.bpLevel} onChange={update}><option>Unsure</option><option>Normal</option><option>Elevated</option><option>High</option><option>Very high</option><option>Low</option></select></FormField>
                <FormField label="Blood sugar"><select name="sugarLevel" value={form.sugarLevel} onChange={update}><option>Unsure</option><option>Normal</option><option>Prediabetes</option><option>High</option><option>Diabetes</option><option>Low</option></select></FormField>
                <FormField label="Activity level"><select name="activityLevel" value={form.activityLevel} onChange={update}><option>Low</option><option>Moderate</option><option>Active</option></select></FormField>
                <FormField label="Known condition or concern"><input name="conditions" value={form.conditions} onChange={update} placeholder="Optional: headaches, eye strain, stress…" /></FormField>
              </div>
              <button className="button" type="submit">Save health context</button>
            </form>
          </article>

          <article className="health-guide-panel">
            <div className="panel-heading"><span>Your gentle next steps</span><h2>Suggested routine support</h2><p>These suggestions stay general and safe. They do not replace a doctor.</p></div>
            <div className="health-suggestion-list">
              {suggestions.map((item) => <div key={item} className="health-suggestion-card"><span>✓</span><p>{item}</p></div>)}
            </div>
            <div className="doctor-support-card">
              <strong>When to seek doctor support</strong>
              <p>If blood pressure or blood sugar stays abnormal, or you feel persistent symptoms like chest pain, dizziness, severe fatigue, or confusion, speak with a doctor as soon as you can.</p>
            </div>
          </article>
        </section>

        <section className="health-insight-band">
          <div>
            <span className="eyebrow light">Public wellness insight</span>
            <h2>{insight?.title || 'Healthy routines support long-term wellbeing.'}</h2>
            <p>{insight?.statistic || 'Balanced sleep, movement, and calmer digital transitions can support general wellbeing.'}</p>
            {message && <small>{message}</small>}
          </div>
          <div className="health-insight-note">
            <strong>Important note</strong>
            <p>For awareness and healthy habit reflection only. DigiBalance does not prescribe medicines.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
