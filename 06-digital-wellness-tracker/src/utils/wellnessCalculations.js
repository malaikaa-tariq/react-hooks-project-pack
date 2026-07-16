import { average, clamp } from './helpers';

export const calculateWellnessScore = ({ profile, screenEntries = [], appUsage = [], focusHistory = [], moodEntries = [], sleepEntries = [], detoxPlans = [] }) => {
  const screenGoal = Number(profile?.screenGoal || 6);
  const latestScreen = [...screenEntries].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  const latestSleep = [...sleepEntries].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  const latestMood = [...moodEntries].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  const distracting = appUsage.filter((item) => item.usageType === 'Distracting');
  const distractionRatio = distracting.length
    ? average(distracting.map((item) => Number(item.timeSpent) / Math.max(Number(item.limit), 0.25)))
    : 0.55;

  const screenScore = latestScreen ? clamp(100 - Math.max(0, (Number(latestScreen.total) - screenGoal) * 13), 30, 100) : 64;
  const focusScore = clamp(48 + focusHistory.filter((item) => item.date === new Date().toISOString().slice(0, 10)).length * 18, 38, 100);
  const breakScore = latestSleep ? clamp(42 + Number(latestSleep.breaks || 0) * 10, 32, 100) : 58;
  const sleepTarget = Number(profile?.sleepTarget || 8);
  const sleepScore = latestSleep ? clamp(100 - Math.abs(Number(latestSleep.sleepHours) - sleepTarget) * 14 - (latestSleep.screenBeforeSleep === 'Yes' ? 8 : 0), 28, 100) : 60;
  const moodScore = latestMood ? clamp(100 - Number(latestMood.stress) * 5 + Number(latestMood.energy) * 4, 30, 100) : 62;
  const activeDetox = detoxPlans.find((plan) => plan.status === 'active');
  const detoxScore = activeDetox ? clamp(55 + (activeDetox.completedDays?.length || 0) * 8, 45, 100) : 60;
  const distractionScore = clamp(105 - distractionRatio * 35, 28, 100);

  const score = Math.round(
    screenScore * 0.26 +
    focusScore * 0.18 +
    breakScore * 0.12 +
    sleepScore * 0.18 +
    moodScore * 0.14 +
    detoxScore * 0.06 +
    distractionScore * 0.06,
  );

  const status = score >= 75 ? 'Balanced' : score >= 52 ? 'Needs Attention' : 'Overloaded';
  const guidance = score >= 75
    ? 'Your recent patterns show healthy balance. Protect the routines that are working.'
    : score >= 52
      ? 'Choose one small adjustment today: reduce one distraction, protect one focus block, or improve your wind-down.'
      : 'Your recent digital load looks heavy. Begin gently with a short break, fewer notifications, and an earlier screen stopping time.';

  return { score, status, guidance, components: { screenScore, focusScore, breakScore, sleepScore, moodScore, detoxScore, distractionScore } };
};

export const profileCompletion = (profile = {}) => {
  const keys = ['fullName', 'email', 'occupation', 'mainDevice', 'screenGoal', 'sleepTarget', 'focusGoal', 'wellnessGoal', 'country'];
  const complete = keys.filter((key) => String(profile[key] ?? '').trim()).length;
  return Math.round((complete / keys.length) * 100);
};
