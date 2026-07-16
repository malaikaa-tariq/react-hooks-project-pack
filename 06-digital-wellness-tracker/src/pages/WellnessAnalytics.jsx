import { useEffect, useMemo, useState } from 'react';
import { getWhoInsights } from '../api/whoApi';
import { useApp } from '../context/AppContext';
import { average } from '../utils/helpers';

const shortDay = (date) => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' });

export default function WellnessAnalytics() {
  const { profile, screenEntries, appUsage, focusHistory, detoxPlans, moodEntries, sleepEntries } = useApp();
  const [globalInsight, setGlobalInsight] = useState(null);
  const [insightMessage, setInsightMessage] = useState('');

  useEffect(() => {
    getWhoInsights({ countryName: profile.country, topic: 'physical activity' }).then((result) => {
      setGlobalInsight(result.insights?.[0] || null);
      setInsightMessage(result.message || '');
    });
  }, [profile.country]);

  const screenTrend = useMemo(() => [...screenEntries].sort((a, b) => a.date.localeCompare(b.date)).slice(-7), [screenEntries]);
  const sleepTrend = useMemo(() => [...sleepEntries].sort((a, b) => a.date.localeCompare(b.date)).slice(-7), [sleepEntries]);
  const productive = useMemo(() => appUsage.filter((item) => item.usageType === 'Helpful').reduce((sum, item) => sum + Number(item.timeSpent || 0), 0), [appUsage]);
  const distracting = useMemo(() => appUsage.filter((item) => item.usageType === 'Distracting').reduce((sum, item) => sum + Number(item.timeSpent || 0), 0), [appUsage]);
  const topDistraction = useMemo(() => [...appUsage].filter((item) => item.usageType === 'Distracting').sort((a, b) => Number(b.timeSpent) - Number(a.timeSpent))[0], [appUsage]);
  const averageSleep = average(sleepEntries.map((item) => item.sleepHours));
  const averageBreaks = average(sleepEntries.map((item) => item.breaks));
  const totalFocusMinutes = focusHistory.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  const activePlan = detoxPlans.find((plan) => plan.status === 'active') || detoxPlans[0];
  const latestMood = [...moodEntries].sort((a, b) => b.date.localeCompare(a.date))[0];

  const bestHabit = averageSleep >= Number(profile.sleepTarget || 8) - 0.5
    ? 'Your recovery time is staying close to target.'
    : totalFocusMinutes >= 100
      ? 'Defined focus blocks are becoming a reliable strength.'
      : averageBreaks >= 3
        ? 'You are creating regular moments away from the screen.'
        : 'Consistent daily snapshots are your next strongest habit.';

  return (
    <main className="private-page analytics-page">
      <div className="private-shell">
        <section className="analytics-hero">
          <div className="analytics-hero-copy"><span className="eyebrow">Review, then close the app</span><h1>Keep the habits that are actually helping.</h1><p>Analytics shows a few meaningful patterns instead of repeating every dashboard card and tracker function.</p></div>
          <img src="/assets/analytics-view.svg" alt="A simple digital wellness analytics overview" />
        </section>

        <section className="analytics-focus-grid">
          <article className="analytics-chart-panel screen-trend-panel">
            <div className="panel-heading"><span>Screen-time direction</span><h2>Last seven saved days</h2><p>Your daily goal is {profile.screenGoal || 6} hours.</p></div>
            <div className="clean-bar-chart">
              {screenTrend.map((item) => <div key={item.id}><div><i style={{ height: `${Math.min(100, Number(item.total) / 12 * 100)}%` }}><span>{item.total}h</span></i><b style={{ bottom: `${Math.min(100, Number(profile.screenGoal || 6) / 12 * 100)}%` }} /></div><small>{shortDay(item.date)}</small></div>)}
              {!screenTrend.length && <p className="muted-line">Add a few screen-time snapshots to reveal a direction.</p>}
            </div>
          </article>

          <article className="attention-balance-panel">
            <div className="panel-heading"><span>Attention balance</span><h2>Useful time vs distraction</h2></div>
            <div className="attention-ratio">
              <div className="ratio-circle" style={{ '--helpful': `${productive / Math.max(productive + distracting, 1) * 360}deg` }}><div><strong>{productive.toFixed(1)}h</strong><span>helpful</span></div></div>
              <div className="ratio-copy"><p><span>Helpful use</span><strong>{productive.toFixed(1)}h</strong></p><p><span>Distracting use</span><strong>{distracting.toFixed(1)}h</strong></p><small>{topDistraction ? `${topDistraction.name} is currently the clearest distraction to manage.` : 'Add important apps to compare their effect.'}</small></div>
            </div>
          </article>
        </section>

        <section className="analytics-story-grid">
          <article className="recovery-story-panel">
            <div className="panel-heading"><span>Recovery pattern</span><h2>Sleep and breaks</h2></div>
            <div className="recovery-numbers"><div><strong>{averageSleep.toFixed(1)}h</strong><span>average sleep</span></div><div><strong>{averageBreaks.toFixed(1)}</strong><span>average breaks</span></div><div><strong>{latestMood?.mood || '—'}</strong><span>latest mood</span></div></div>
            <div className="sleep-sparkline">{sleepTrend.map((item) => <i key={item.id} style={{ height: `${Math.min(100, Number(item.sleepHours) / 10 * 100)}%` }} title={`${item.sleepHours} hours`} />)}</div>
          </article>

          <article className="habit-highlight-panel">
            <span className="habit-mark">✓</span><span className="eyebrow">Best habit to protect</span><h2>{bestHabit}</h2><p>Build the next change around this strength instead of starting from pressure.</p>
            <div className="habit-mini-stats"><span>{focusHistory.length} focus sessions</span><span>{activePlan ? `${activePlan.completedDays?.length || 0}/${activePlan.duration} reset days` : 'No active reset'}</span></div>
          </article>
        </section>

        <section className="global-awareness-panel">
          <div className="global-awareness-copy"><span className="eyebrow light">Public wellness context</span><h2>{globalInsight?.title || 'Movement and healthy routines support overall wellbeing.'}</h2><p>{globalInsight?.statistic || 'Country-level public health context can be used as a reminder to balance screen time with movement, rest, and connection.'}</p><strong>{globalInsight?.digitalHabit || 'Use screen transitions as cues to stand, stretch, or walk briefly.'}</strong>{insightMessage && <small>{insightMessage}</small>}<small>For awareness and healthy-habit reflection, not medical diagnosis.</small></div>
          <div className="global-awareness-orb"><span>◍</span><b>{profile.country}</b></div>
        </section>
      </div>
    </main>
  );
}
