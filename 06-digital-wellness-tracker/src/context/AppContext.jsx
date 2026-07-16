import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUndo } from '../hooks/useUndo';
import { uid } from '../utils/helpers';

const AppContext = createContext(null);

const emptyData = (profile = {}) => ({
  profile,
  screenEntries: [],
  appUsage: [],
  focusHistory: [],
  detoxPlans: [],
  moodEntries: [],
  sleepEntries: [],
  recentActivity: [],
});

export function AppProvider({ children }) {
  const [users, setUsers] = useLocalStorage('digibalance.users', []);
  const [currentUserId, setCurrentUserId] = useLocalStorage('digibalance.currentUser', null);
  const [allData, setAllData] = useLocalStorage('digibalance.userData', {});
  const [toast, setToast] = useState(null);

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) || null,
    [currentUserId, users],
  );

  const userData = useMemo(() => {
    if (!currentUserId) return emptyData();
    const stored = allData[currentUserId] || {};
    return { ...emptyData(), ...stored, profile: { ...(stored.profile || {}) } };
  }, [allData, currentUserId]);

  const setUserData = useCallback((updater) => {
    if (!currentUserId) return;
    setAllData((previous) => {
      const current = { ...emptyData(), ...(previous[currentUserId] || {}) };
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...previous, [currentUserId]: next };
    });
  }, [currentUserId, setAllData]);

  const showToast = useCallback((type, message, actionLabel = '', action = null) => {
    setToast({ id: uid(), type, message, actionLabel, action });
  }, []);

  const restoreAction = useCallback((action) => {
    if (!currentUserId || !action || action.kind !== 'collection') return;
    setUserData((data) => ({ ...data, [action.key]: action.before }));
    showToast('success', 'The previous change was restored.');
  }, [currentUserId, setUserData, showToast]);

  const { remember, undo, canUndo } = useUndo(restoreAction);

  const addActivity = useCallback((data, text, type = 'general') => ({
    ...data,
    recentActivity: [{ id: uid(), text, type, at: new Date().toISOString() }, ...(data.recentActivity || [])].slice(0, 20),
  }), []);

  const signUp = useCallback((form) => {
    const email = form.email.trim().toLowerCase();
    if (users.some((user) => user.email === email)) return { ok: false, message: 'An account already exists with this email.' };
    const id = uid();
    const user = { id, fullName: form.fullName.trim(), email, password: form.password, createdAt: new Date().toISOString() };
    const profile = {
      fullName: form.fullName.trim(),
      email,
      ageRange: form.ageRange,
      gender: '',
      occupation: '',
      mainDevice: form.mainDevice,
      screenGoal: Number(form.screenGoal),
      sleepTarget: 8,
      focusGoal: '',
      wellnessGoal: '',
      country: 'Pakistan',
      bpLevel: 'Unsure',
      sugarLevel: 'Unsure',
      activityLevel: 'Moderate',
      conditions: '',
      completed: false,
    };
    setUsers((previous) => [...previous, user]);
    setAllData((previous) => ({ ...previous, [id]: emptyData(profile) }));
    setCurrentUserId(id);
    showToast('success', 'Your DigiBalance account is ready. Set your goals next.');
    return { ok: true };
  }, [setAllData, setCurrentUserId, setUsers, showToast, users]);

  const login = useCallback((emailValue, password) => {
    const email = emailValue.trim().toLowerCase();
    const user = users.find((item) => item.email === email);
    if (!user) return { ok: false, field: 'email', message: 'No account is registered with this email.' };
    if (user.password !== password) return { ok: false, field: 'password', message: 'The password is incorrect.' };
    setCurrentUserId(user.id);
    showToast('success', `Welcome back, ${user.fullName.split(' ')[0]}.`);
    return { ok: true, profileComplete: Boolean(allData[user.id]?.profile?.completed) };
  }, [allData, setCurrentUserId, showToast, users]);

  const logout = useCallback(() => {
    setCurrentUserId(null);
    showToast('guidance', 'You have been logged out safely.');
  }, [setCurrentUserId, showToast]);

  const updateProfile = useCallback((profile) => {
    const completedProfile = {
      ...profile,
      screenGoal: Number(profile.screenGoal),
      sleepTarget: Number(profile.sleepTarget),
      completed: true,
    };
    setUserData((data) => addActivity({ ...data, profile: completedProfile }, 'Updated wellness profile', 'profile'));
    setUsers((previous) => previous.map((user) => user.id === currentUserId ? { ...user, fullName: profile.fullName, email: profile.email.trim().toLowerCase() } : user));
    showToast('success', 'Your wellness profile has been saved.');
  }, [addActivity, currentUserId, setUserData, setUsers, showToast]);

  const addItem = useCallback((key, item, activityText, activityType = 'general') => {
    const prepared = { ...item, id: item.id || uid(), createdAt: item.createdAt || new Date().toISOString() };
    setUserData((data) => {
      const updated = { ...data, [key]: [prepared, ...(data[key] || [])] };
      return activityText ? addActivity(updated, activityText, activityType) : updated;
    });
    return prepared;
  }, [addActivity, setUserData]);

  const updateItem = useCallback((key, id, changes, activityText = 'Updated an item') => {
    const before = userData[key] || [];
    remember({ kind: 'collection', key, before });
    setUserData((data) => addActivity({
      ...data,
      [key]: (data[key] || []).map((item) => item.id === id ? { ...item, ...changes, updatedAt: new Date().toISOString() } : item),
    }, activityText, key));
    showToast('success', 'Changes saved.', 'Undo', undo);
  }, [addActivity, remember, setUserData, showToast, undo, userData]);

  const saveDailyCheckIn = useCallback((moodValues, sleepValues) => {
    setUserData((data) => {
      const existingMood = (data.moodEntries || []).find((item) => item.date === moodValues.date);
      const existingSleep = (data.sleepEntries || []).find((item) => item.date === sleepValues.date);
      const nextMood = existingMood
        ? data.moodEntries.map((item) => item.id === existingMood.id ? { ...item, ...moodValues, updatedAt: new Date().toISOString() } : item)
        : [{ ...moodValues, id: uid(), createdAt: new Date().toISOString() }, ...(data.moodEntries || [])];
      const nextSleep = existingSleep
        ? data.sleepEntries.map((item) => item.id === existingSleep.id ? { ...item, ...sleepValues, updatedAt: new Date().toISOString() } : item)
        : [{ ...sleepValues, id: uid(), createdAt: new Date().toISOString() }, ...(data.sleepEntries || [])];
      return addActivity({ ...data, moodEntries: nextMood, sleepEntries: nextSleep }, `Saved a daily check-in for ${moodValues.date}`, 'check-in');
    });
  }, [addActivity, setUserData]);

  const deleteItems = useCallback((key, ids, singular = 'Item') => {
    const idSet = new Set(ids);
    const before = userData[key] || [];
    if (!ids.length || !before.some((item) => idSet.has(item.id))) return;
    remember({ kind: 'collection', key, before });
    setUserData((data) => ({ ...data, [key]: (data[key] || []).filter((item) => !idSet.has(item.id)) }));
    showToast('warning', `${ids.length === 1 ? singular : `${ids.length} items`} deleted.`, 'Undo', undo);
  }, [remember, setUserData, showToast, undo, userData]);

  const clearWellnessData = useCallback(() => {
    if (!currentUserId) return;
    const profile = userData.profile || {};
    setAllData((previous) => ({ ...previous, [currentUserId]: emptyData(profile) }));
    showToast('success', 'Tracker records cleared. Your account and profile were kept.');
  }, [currentUserId, setAllData, showToast, userData.profile]);

  const value = useMemo(() => ({
    users,
    currentUser,
    currentUserId,
    ...userData,
    toast,
    setToast,
    showToast,
    signUp,
    login,
    logout,
    updateProfile,
    addItem,
    updateItem,
    deleteItems,
    saveDailyCheckIn,
    clearWellnessData,
    undo,
    canUndo,
  }), [addItem, canUndo, clearWellnessData, currentUser, currentUserId, deleteItems, login, logout, saveDailyCheckIn, showToast, signUp, toast, undo, updateItem, updateProfile, userData, users]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
