// ===== SAVORIA CONTEXTS =====

import React, { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import type { LoggedInUser, StoredUser, UserProfile, ToastMessage, SocialProvider } from './types';
import { useLocalStorage } from './hooks';
import { USER_DATA_BUCKETS, type UserDataBucket } from './recipeUtils';

// ===== AUTH CONTEXT =====
interface AuthContextType {
  user: LoggedInUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  signup: (fullName: string, email: string, password: string) => { success: boolean; message: string };
  socialLogin: (provider: SocialProvider) => { success: boolean; message: string; isNew: boolean };
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
  resetUserAppData: () => void;
  userStorageKey: (bucket: UserDataBucket) => string;
  profileCompletion: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function userDataKey(userId: string, bucket: UserDataBucket | 'profile') {
  return `savoria_user_${userId}_${bucket}`;
}

function migrateLegacyUserData(userId: string) {
  USER_DATA_BUCKETS.forEach((bucket) => {
    const legacyKey = `savoria_${bucket}`;
    const scopedKey = userDataKey(userId, bucket);
    const legacyValue = window.localStorage.getItem(legacyKey);
    if (legacyValue !== null && window.localStorage.getItem(scopedKey) === null) {
      window.localStorage.setItem(scopedKey, legacyValue);
    }
  });

  const legacyProfile = window.localStorage.getItem('savoria_profile');
  const scopedProfile = userDataKey(userId, 'profile');
  if (legacyProfile !== null && window.localStorage.getItem(scopedProfile) === null) {
    window.localStorage.setItem(scopedProfile, legacyProfile);
  }
}

const SOCIAL_DEMO_USERS: Record<SocialProvider, { fullName: string; email: string }> = {
  google: { fullName: 'Google Chef', email: 'google.chef@savoria.demo' },
  facebook: { fullName: 'Facebook Chef', email: 'facebook.chef@savoria.demo' },
  github: { fullName: 'GitHub Chef', email: 'github.chef@savoria.demo' },
};

export function AuthProvider({ children, addToast }: { children: ReactNode; addToast: (type: ToastMessage['type'], title: string, message: string) => string }) {
  const [users, setUsers] = useLocalStorage<StoredUser[]>('savoria_users', []);
  const [user, setUser] = useLocalStorage<LoggedInUser | null>('savoria_loggedInUser', null);
  const [profile, setProfileState] = React.useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) {
      setProfileState(null);
      return;
    }
    setProfileState(readJson<UserProfile | null>(userDataKey(user.id, 'profile'), null));
  }, [user?.id]);

  const profileCompletion = React.useMemo(() => {
    if (!profile) return 0;
    const fields = ['cookingLevel', 'dietPreference', 'favoriteCuisine', 'weeklyCookingGoal', 'preferredMealType', 'cookingTimePreference', 'budgetLevel'];
    const filled = fields.filter((field) => {
      const value = profile[field as keyof UserProfile];
      return value !== '' && value !== 0 && value !== null && value !== undefined;
    }).length;
    const bonusFields = [profile.allergies, profile.dislikedIngredients, profile.kitchenTools].filter((items) => items.length > 0).length;
    return Math.min(100, Math.round(((filled + bonusFields) / (fields.length + 3)) * 100));
  }, [profile]);

  const userStorageKey = useCallback((bucket: UserDataBucket) => {
    return user ? userDataKey(user.id, bucket) : `savoria_guest_${bucket}`;
  }, [user?.id]);

  const login = useCallback((email: string, password: string): { success: boolean; message: string } => {
    const found = users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());
    if (!found) return { success: false, message: 'No account found with this email. Please sign up first.' };
    if (found.authProvider && found.authProvider !== 'email') {
      return { success: false, message: `This account uses ${found.authProvider}. Please use Continue with ${found.authProvider}.` };
    }
    if (found.password !== password) return { success: false, message: 'Incorrect password. Please try again.' };
    migrateLegacyUserData(found.id);
    const loggedIn: LoggedInUser = { id: found.id, fullName: found.fullName, email: found.email };
    setUser(loggedIn);
    addToast('success', 'Welcome Back!', `Good to see you, ${found.fullName}!`);
    return { success: true, message: '' };
  }, [users, setUser, addToast]);

  const signup = useCallback((fullName: string, email: string, password: string): { success: boolean; message: string } => {
    const exists = users.some((candidate) => candidate.email.toLowerCase() === email.toLowerCase());
    if (exists) return { success: false, message: 'An account with this email already exists. Please log in instead.' };
    const newUser: StoredUser = { id: Date.now().toString(36), fullName, email, password, authProvider: 'email' };
    setUsers((prev) => [...prev, newUser]);
    migrateLegacyUserData(newUser.id);
    const loggedIn: LoggedInUser = { id: newUser.id, fullName, email };
    setUser(loggedIn);
    addToast('success', 'Welcome to Savoria!', `Your account is ready, ${fullName}! Let's set up your profile.`);
    return { success: true, message: '' };
  }, [users, setUsers, setUser, addToast]);

  const socialLogin = useCallback((provider: SocialProvider): { success: boolean; message: string; isNew: boolean } => {
    const socialUser = SOCIAL_DEMO_USERS[provider];
    const existing = users.find((candidate) => candidate.email.toLowerCase() === socialUser.email.toLowerCase());

    if (existing) {
      migrateLegacyUserData(existing.id);
      setUser({ id: existing.id, fullName: existing.fullName, email: existing.email });
      addToast('success', 'Signed in', `Demo ${provider} login connected successfully.`);
      return { success: true, message: '', isNew: false };
    }

    const newUser: StoredUser = {
      id: `${provider}-${Date.now().toString(36)}`,
      fullName: socialUser.fullName,
      email: socialUser.email,
      authProvider: provider,
    };
    setUsers((prev) => [...prev, newUser]);
    setUser({ id: newUser.id, fullName: newUser.fullName, email: newUser.email });
    addToast('success', 'Social account ready', `Demo ${provider} account created for Savoria.`);
    return { success: true, message: '', isNew: true };
  }, [users, setUsers, setUser, addToast]);

  const logout = useCallback(() => {
    setUser(null);
    addToast('guidance', 'Logged Out', 'You have been logged out. Come back soon!');
  }, [setUser, addToast]);

  const updateProfile = useCallback((newProfile: UserProfile) => {
    if (!user) return;
    const key = userDataKey(user.id, 'profile');
    window.localStorage.setItem(key, JSON.stringify(newProfile));
    window.dispatchEvent(new CustomEvent('savoria:storageChanged', { detail: { key } }));
    setProfileState(newProfile);
    addToast('success', 'Profile Updated', 'Your preferences have been saved.');
  }, [user, addToast]);

  const resetUserAppData = useCallback(() => {
    if (!user) return;
    USER_DATA_BUCKETS.forEach((bucket) => window.localStorage.removeItem(userDataKey(user.id, bucket)));
    window.dispatchEvent(new CustomEvent('savoria:storageReset'));
    addToast('guidance', 'Kitchen data cleared', 'Favorites, planner, pantry, notes, shopping list, and history were reset for this account.');
  }, [user, addToast]);

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, login, signup, socialLogin, logout, updateProfile, resetUserAppData, userStorageKey, profileCompletion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ===== THEME CONTEXT =====
interface ThemeContextType {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useLocalStorage<boolean>('savoria_theme', false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [dark]);

  const toggle = useCallback(() => setDark((prev) => !prev), [setDark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
