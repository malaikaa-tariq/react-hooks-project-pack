// ===== SAVORIA CUSTOM HOOKS =====

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ToastMessage, UndoAction, Recipe, RecipeIngredient } from './types';
import { FALLBACK_RECIPES } from './fallbackData';

// --- useLocalStorage ---
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const initialRef = useRef(initialValue);

  const readValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialRef.current;
    } catch {
      return initialRef.current;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState<T>(() => readValue());

  useEffect(() => {
    setStoredValue(readValue());

    const handleStorageChange = (event: StorageEvent | Event) => {
      const storageEvent = event as StorageEvent;
      if (storageEvent.key && storageEvent.key !== key) return;
      const detail = event instanceof CustomEvent ? event.detail as { key?: string } | undefined : undefined;
      if (detail?.key && detail.key !== key) return;
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('savoria:storageChanged', handleStorageChange);
    window.addEventListener('savoria:storageReset', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('savoria:storageChanged', handleStorageChange);
      window.removeEventListener('savoria:storageReset', handleStorageChange);
    };
  }, [key, readValue]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new CustomEvent('savoria:storageChanged', { detail: { key } }));
      } catch { /* quota exceeded — silently ignore */ }
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue];
}

// --- useToast ---
export function useToast() {
  // useState
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string, duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const toast: ToastMessage = { id, type, title, message, duration };
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// --- useUndo ---
export function useUndo(addToast: (type: ToastMessage['type'], title: string, message: string, duration?: number) => string) {
  // useRef
  const undoStack = useRef<UndoAction[]>([]);

  const pushUndo = useCallback((action: UndoAction) => {
    undoStack.current.push(action);
    if (undoStack.current.length > 10) undoStack.current.shift();
  }, []);

  const popUndo = useCallback(<T,>(onRestore: (data: T) => void): boolean => {
    const action = undoStack.current.pop();
    if (!action) {
      addToast('guidance', 'Nothing to Undo', 'There is no recent action to undo.', 2500);
      return false;
    }
    onRestore(action.data as T);
    addToast('success', 'Undo Successful', 'Your last action has been undone.', 2500);
    return true;
  }, [addToast]);

  return { pushUndo, popUndo, undoStack };
}

// --- useTimer ---
export function useTimer() {
  // useState
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // useRef
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((durationSeconds: number) => {
    setSeconds(durationSeconds);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
  }, []);

  // useEffect — timer countdown
  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, seconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = useCallback((totalSeconds: number): string => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  return { seconds, isRunning, start, pause, resume, reset, formatTime };
}

// --- useRecipeApi ---
const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

const normalizeSearchText = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, ' ');

const getCuisineAliases = (area: string): string[] => {
  const key = normalizeSearchText(area);
  const aliasMap: Record<string, string[]> = {
    american: ['american', 'america', 'usa', 'united states', 'us'],
    america: ['american', 'america', 'usa', 'united states', 'us'],
    ammerica: ['american', 'america', 'usa', 'united states', 'us'],
    indian: ['indian', 'india'],
    india: ['indian', 'india'],
    french: ['french', 'france'],
    france: ['french', 'france'],
    italian: ['italian', 'italy'],
    chinese: ['chinese', 'china'],
    mexican: ['mexican', 'mexico'],
    greek: ['greek', 'greece'],
  };
  return aliasMap[key] || [key];
};

const getIngredientAliases = (ingredient: string): string[] => {
  const key = normalizeSearchText(ingredient);
  const aliasMap: Record<string, string[]> = {
    pasta: ['pasta', 'spaghetti', 'macaroni', 'penne', 'fettuccine', 'noodles'],
    tomato: ['tomato', 'tomatoes', 'crushed tomatoes', 'tomato paste'],
    tomatoes: ['tomato', 'tomatoes', 'crushed tomatoes', 'tomato paste'],
    egg: ['egg', 'eggs', 'egg yolks'],
    eggs: ['egg', 'eggs', 'egg yolks'],
    rice: ['rice', 'arborio rice', 'basmati rice'],
    chicken: ['chicken', 'chicken breast'],
    beef: ['beef', 'ground beef', 'beef sirloin'],
    garlic: ['garlic'],
    onion: ['onion', 'red onion'],
    butter: ['butter'],
  };
  return aliasMap[key] || [key];
};

const uniqueRecipes = (recipes: Recipe[]) => {
  const seen = new Set<string>();
  return recipes.filter((recipe) => {
    if (seen.has(recipe.id)) return false;
    seen.add(recipe.id);
    return true;
  });
};

const fallbackByCategory = (category: string) => {
  const key = normalizeSearchText(category);
  return FALLBACK_RECIPES.filter((r) =>
    normalizeSearchText(r.category) === key ||
    r.tags.some((tag) => normalizeSearchText(tag) === key)
  );
};

const fallbackByArea = (area: string) => {
  const aliases = getCuisineAliases(area);
  return FALLBACK_RECIPES.filter((r) => {
    const haystack = [
      r.area,
      r.category,
      r.name,
      ...r.tags,
    ].map(normalizeSearchText);
    return aliases.some((alias) => haystack.some((item) => item.includes(alias)));
  });
};

const fallbackByIngredient = (ingredient: string) => {
  const aliases = getIngredientAliases(ingredient);
  return FALLBACK_RECIPES.filter((r) => {
    const haystack = [
      r.name,
      r.category,
      r.area,
      ...r.tags,
      ...r.ingredients.map((i) => i.ingredient),
    ].map(normalizeSearchText);
    return aliases.some((alias) => haystack.some((item) => item.includes(alias)));
  });
};

export function useRecipeApi() {
  // useRef for cache
  const cache = useRef<Map<string, unknown>>(new Map());

  const fetchFromApi = useCallback(async <T>(url: string, cacheKey: string): Promise<T> => {
    const cached = cache.current.get(cacheKey);
    if (cached) return cached as unknown as T;

    const res = await fetch(url);
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    cache.current.set(cacheKey, data);
    return data as T;
  }, []);

  const makeYoutubeSearch = useCallback((recipeName: string) => {
    return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(`${recipeName} recipe tutorial`)}`;
  }, []);

  const rawToRecipe = useCallback((raw: { idMeal: string; strMeal: string; strCategory: string; strArea: string; strInstructions: string; strMealThumb: string; strTags: string | null; strYoutube: string; [key: string]: string | null }): Recipe => {
    const ingredients: RecipeIngredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const ing = raw[`strIngredient${i}`];
      const meas = raw[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push({ ingredient: ing.trim(), measure: (meas || '').trim() });
      }
    }
    return {
      id: raw.idMeal,
      name: raw.strMeal,
      category: raw.strCategory,
      area: raw.strArea,
      instructions: raw.strInstructions,
      thumbnail: raw.strMealThumb,
      tags: raw.strTags ? raw.strTags.split(',').map((t) => t.trim()) : [],
      youtube: raw.strYoutube || makeYoutubeSearch(raw.strMeal),
      ingredients,
    };
  }, [makeYoutubeSearch]);

  const lightweightToRecipe = useCallback((raw: { idMeal: string; strMeal: string; strMealThumb: string }, defaults: { category?: string; area?: string; tags?: string[] } = {}): Recipe => ({
    id: raw.idMeal,
    name: raw.strMeal,
    category: defaults.category || 'Recipe',
    area: defaults.area || 'Global',
    instructions: 'Open this recipe to load the full cooking method, ingredients and tutorial video.',
    thumbnail: raw.strMealThumb || '',
    tags: defaults.tags || [],
    youtube: makeYoutubeSearch(raw.strMeal),
    ingredients: [{ ingredient: 'Open recipe for full ingredient list', measure: '' }],
  }), [makeYoutubeSearch]);

  const searchByName = useCallback(async (query: string): Promise<Recipe[]> => {
    try {
      const data = await fetchFromApi<{ meals: Array<{ idMeal: string; strMeal: string; strCategory: string; strArea: string; strInstructions: string; strMealThumb: string; strTags: string | null; strYoutube: string; [key: string]: string | null }> | null }>(
        `${API_BASE}/search.php?s=${encodeURIComponent(query)}`, `search-${query}`
      );
      const apiResults = data.meals ? data.meals.map(rawToRecipe) : [];
      if (apiResults.length > 0) return apiResults;
      const q = normalizeSearchText(query);
      return FALLBACK_RECIPES.filter((r) =>
        normalizeSearchText(r.name).includes(q) ||
        normalizeSearchText(r.category).includes(q) ||
        normalizeSearchText(r.area).includes(q) ||
        r.tags.some((tag) => normalizeSearchText(tag).includes(q)) ||
        r.ingredients.some((i) => normalizeSearchText(i.ingredient).includes(q))
      );
    } catch {
      const q = normalizeSearchText(query);
      return FALLBACK_RECIPES.filter((r) =>
        normalizeSearchText(r.name).includes(q) ||
        normalizeSearchText(r.category).includes(q) ||
        normalizeSearchText(r.area).includes(q) ||
        r.tags.some((tag) => normalizeSearchText(tag).includes(q)) ||
        r.ingredients.some((i) => normalizeSearchText(i.ingredient).includes(q))
      );
    }
  }, [fetchFromApi, rawToRecipe]);

  const getById = useCallback(async (id: string): Promise<Recipe | null> => {
    if (id.startsWith('fb-')) return FALLBACK_RECIPES.find((r) => r.id === id) || null;
    try {
      const data = await fetchFromApi<{ meals: Array<{ idMeal: string; strMeal: string; strCategory: string; strArea: string; strInstructions: string; strMealThumb: string; strTags: string | null; strYoutube: string; [key: string]: string | null }> | null }>(
        `${API_BASE}/lookup.php?i=${id}`, `recipe-${id}`
      );
      return data.meals ? rawToRecipe(data.meals[0]) : null;
    } catch {
      return FALLBACK_RECIPES.find((r) => r.id === id) || null;
    }
  }, [fetchFromApi, rawToRecipe]);

  const filterByCategory = useCallback(async (category: string): Promise<Recipe[]> => {
    try {
      const data = await fetchFromApi<{ meals: Array<{ idMeal: string; strMeal: string; strMealThumb: string }> | null }>(
        `${API_BASE}/filter.php?c=${encodeURIComponent(category)}`, `cat-${category}`
      );
      const apiResults = data.meals ? data.meals.slice(0, 20).map((meal) => lightweightToRecipe(meal, { category, tags: [category] })) : [];
      return uniqueRecipes([...apiResults, ...fallbackByCategory(category)]);
    } catch {
      return fallbackByCategory(category);
    }
  }, [fetchFromApi, lightweightToRecipe]);

  const filterByArea = useCallback(async (area: string): Promise<Recipe[]> => {
    try {
      const data = await fetchFromApi<{ meals: Array<{ idMeal: string; strMeal: string; strMealThumb: string }> | null }>(
        `${API_BASE}/filter.php?a=${encodeURIComponent(area)}`, `area-${area}`
      );
      const apiResults = data.meals ? data.meals.slice(0, 20).map((meal) => lightweightToRecipe(meal, { area, tags: [area] })) : [];
      return uniqueRecipes([...apiResults, ...fallbackByArea(area)]);
    } catch {
      return fallbackByArea(area);
    }
  }, [fetchFromApi, lightweightToRecipe]);

  const filterByIngredient = useCallback(async (ingredient: string): Promise<Recipe[]> => {
    try {
      const data = await fetchFromApi<{ meals: Array<{ idMeal: string; strMeal: string; strMealThumb: string }> | null }>(
        `${API_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`, `ing-${ingredient}`
      );
      const apiResults = data.meals ? data.meals.slice(0, 20).map((meal) => lightweightToRecipe(meal, { tags: [ingredient] })) : [];
      return uniqueRecipes([...apiResults, ...fallbackByIngredient(ingredient)]);
    } catch {
      return fallbackByIngredient(ingredient);
    }
  }, [fetchFromApi, lightweightToRecipe]);

  const getRandom = useCallback(async (): Promise<Recipe | null> => {
    try {
      const data = await fetchFromApi<{ meals: Array<{ idMeal: string; strMeal: string; strCategory: string; strArea: string; strInstructions: string; strMealThumb: string; strTags: string | null; strYoutube: string; [key: string]: string | null }> | null }>(
        `${API_BASE}/random.php`, `random-${Date.now()}`
      );
      return data.meals ? rawToRecipe(data.meals[0]) : null;
    } catch {
      const idx = Math.floor(Math.random() * FALLBACK_RECIPES.length);
      return FALLBACK_RECIPES[idx];
    }
  }, [fetchFromApi, rawToRecipe]);

  return { searchByName, getById, filterByCategory, filterByArea, filterByIngredient, getRandom };
}