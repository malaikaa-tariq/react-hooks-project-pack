import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDailyAdvice } from '../api/adviceApi';
import { getWeatherBreak } from '../api/weatherApi';
import { getWhoInsights } from '../api/whoApi';
import { useApp } from '../context/AppContext';
import { useWellnessScore } from '../hooks/useWellnessScore';

export default function Dashboard() {
  const { profile, screenEntries, appUsage, focusHistory, detoxPlans, moodEntries, sleepEntries } = useApp();
  const [advice, setAdvice] = useState(null);
  const [weather, setWeather] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const wellness = useWellnessScore({ profile, screenEntries, appUsage, focusHistory, detoxPlans, moodEntries, sleepEntries });

  const loadCue = useCallback(async () => {
    setLoading(true);
    const [tip, breakIdea, who] = await Promise.all([
      getDailyAdvice(),
      getWeatherBreak(profile.country),
      getWhoInsights({ countryName: profile.country, topic: 'healthy habits' }),
    ]);
    setAdvice(tip);
    setWeather(breakIdea);
    setInsight(who.insights?.[0] || null);
    setLoading(false);
  }, [profile.country]);

  useEffect(() => { loadCue(); }, [loadCue]);

  const latestScreen = useMemo(() => [...screenEntries].sort((a, b) => b.date.localeCompare(a.date))[0], [screenEntries]);
  const latestSleep = useMemo(() => [...sleepEntries].sort((a, b) => b.date.localeCompare(a.date))[0], [sleepEntries]);
  const latestMood = useMemo(() => [...moodEntries].sort((a, b) => b.date.localeCompare(a.date))[0], [moodEntries]);
  const focusToday = focusHistory.filter((item) => item.date === new Date().toISOString().slice(0, 10)).length;
  const topDistracting = [...appUsage].filter((item) => item.usageType === 'Distracting').sort((a, b) => Number(b.timeSpent) - Number(a.timeSpent))[0];
  const activeDetox = detoxPlans.find((item) => item.status === 'active');

  const nextAction = latestScreen?.total > Number(profile.screenGoal || 6)
    ? 'Your usage is above goal. Shorten one evening screen block today.'
    : Number(latestSleep?.sleepHours || 0) < Number(profile.sleepTarget || 8)
      ? 'Your sleep is below target. Choose an earlier screen stopping time tonight.'
      : latestMood?.stress >= 8
        ? 'Stress looks high. Take one quiet break before opening another app.'
        : activeDetox
          ? `Continue “${activeDetox.title}” with one realistic boundary today.`
          : 'Protect one focused block and one meaningful screen-free break.';

  return (
    <main className="private-page dashboard-page clean-dashboard-page">
      <div className="private-shell">
        <section className="dashboard-top-hero clean-page-hero">
          <div className="dashboard-top-copy">
            <span className="eyebrow">Today’s overview</span>
            <h1>Hello, {profile.fullName?.split(' ')[0] || 'there'}.</h1>
            <p>See the health signal that matters, take one action, and continue with your day.</p>
          </div>
          <img src="/assets/dashboard-health-real.png" alt="A calm digital wellness workspace" />
        </section>

        <section className="dashboard-clean-overview">
          <article className="wellness-card clean-score-card">
            <div className="score-large"><strong>{wellness.score}%</strong><span>{wellness.label}</span></div>
            <div>
              <span className="eyebrow">Digital wellness score</span>
              <h2>Your current balance</h2>
              <p>{wellness.message}</p>
            </div>
          </article>

          <article className="wellness-card clean-next-card">
            <span className="eyebrow">One next step</span>
            <h2>{nextAction}</h2>
            <div className="clean-action-links">
              <Link to="/usage">Log usage</Link>
              <Link to="/focus">Start focus</Link>
              <Link to="/check-in">Check in</Link>
            </div>
          </article>
        </section>

        <section className="dashboard-stat-grid clean-stat-grid">
          <article className="stat-card"><span>Screen time</span><strong>{latestScreen ? `${latestScreen.total}h` : '—'}</strong><small>Goal {profile.screenGoal || 6}h</small></article>
          <article className="stat-card"><span>Focus today</span><strong>{focusToday}</strong><small>completed sessions</small></article>
          <article className="stat-card"><span>Sleep</span><strong>{latestSleep ? `${latestSleep.sleepHours}h` : '—'}</strong><small>{latestMood ? `${latestMood.mood} mood` : 'No check-in yet'}</small></article>
          <article className="stat-card"><span>Top distraction</span><strong className="compact-stat-value">{topDistracting?.name || 'None yet'}</strong><small>{topDistracting ? `${topDistracting.timeSpent}h saved` : 'Add it in Usage'}</small></article>
        </section>

        <section className="dashboard-support-grid">
          <article className="wellness-card clean-support-card">
            <div>
              <span className="eyebrow">Daily reset</span>
              <h2>{loading ? 'Preparing a calm reminder…' : advice?.text}</h2>
            </div>
            <button className="button button-ghost button-small" type="button" onClick={loadCue}>Refresh</button>
          </article>

          <article className="wellness-card clean-support-card">
            <div className="support-icon">{weather?.guidance?.icon || '☁'}</div>
            <div>
              <span className="eyebrow">Break suggestion</span>
              <h2>{weather?.guidance?.title || 'A useful break is being prepared.'}</h2>
              <p>{weather?.guidance?.text}</p>
            </div>
          </article>

          <article className="wellness-card clean-support-card health-support-card">
            <div>
              <span className="eyebrow">Health awareness</span>
              <h2>{insight?.title || 'Healthy routines support overall wellbeing.'}</h2>
              <p>{insight?.digitalHabit || 'Use screen transitions as cues to move, hydrate, and rest.'}</p>
            </div>
            <Link className="button button-small" to="/health-guide">Health Guide</Link>
          </article>
        </section>
      </div>
    </main>
  );
}
