import { FALLBACK_RECIPES } from './fallbackData';
import type { Recipe } from './types';

export const USER_DATA_BUCKETS = [
  'favorites',
  'savedRecipes',
  'mealPlans',
  'shoppingList',
  'pantry',
  'notes',
  'randomHistory',
  'cookedHistory',
] as const;

export type UserDataBucket = typeof USER_DATA_BUCKETS[number];

export function splitInstructionSteps(instructions: string): string[] {
  const cleaned = instructions
    .replace(/\r/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return ['No cooking instructions are available for this recipe yet.'];

  let steps = instructions
    .replace(/\r/g, '\n')
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean);

  if (steps.length <= 1) {
    steps = cleaned
      .split(/(?<=[.!?])\s+(?=(?:[A-Z0-9]|Add|Mix|Stir|Heat|Cook|Serve|Put|Place|Pour|Remove|Bake|Boil|Fry|Chop|Slice|Season|Preheat|Drain|Blend|Whisk|Cover|Simmer))/)
      .map((step) => step.trim())
      .filter(Boolean);
  }

  return steps
    .map((step) => step.replace(/^\s*(?:step\s*)?\d+[.)-]?\s*/i, '').trim())
    .filter((step) => step.length > 2);
}

export function mergeRecipesById(...recipeLists: Recipe[][]): Recipe[] {
  const map = new Map<string, Recipe>();
  recipeLists.flat().forEach((recipe) => {
    if (recipe?.id && !map.has(recipe.id)) map.set(recipe.id, recipe);
  });
  return Array.from(map.values());
}

export function findRecipeById(id: string | null | undefined, savedRecipes: Recipe[] = []): Recipe | null {
  if (!id) return null;
  return savedRecipes.find((recipe) => recipe.id === id) || FALLBACK_RECIPES.find((recipe) => recipe.id === id) || null;
}

export function upsertRecipe(recipes: Recipe[], recipe: Recipe): Recipe[] {
  const withoutCurrent = recipes.filter((item) => item.id !== recipe.id);
  return [recipe, ...withoutCurrent].slice(0, 80);
}
