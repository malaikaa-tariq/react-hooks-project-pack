// ===== SAVORIA TYPE DEFINITIONS =====

// --- Auth ---
export type SocialProvider = 'google' | 'facebook' | 'github';

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  authProvider?: 'email' | SocialProvider;
}

export interface LoggedInUser {
  id: string;
  fullName: string;
  email: string;
}

export interface UserProfile {
  cookingLevel: string;
  dietPreference: string;
  favoriteCuisine: string;
  allergies: string[];
  dislikedIngredients: string[];
  weeklyCookingGoal: number;
  preferredMealType: string;
  cookingTimePreference: string;
  kitchenTools: string[];
  budgetLevel: string;
}

// --- Recipe ---
export interface MealDBRecipeRaw {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string;
  [key: `strIngredient${number}`]: string | null;
  [key: `strMeasure${number}`]: string | null;
}

export interface RecipeIngredient {
  ingredient: string;
  measure: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string;
  thumbnail: string;
  tags: string[];
  youtube: string;
  ingredients: RecipeIngredient[];
}

export interface CategoryItem {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface AreaItem {
  strArea: string;
}

export interface IngredientItem {
  idIngredient: string;
  strIngredient: string;
  strDescription: string;
  strType: string | null;
}

// --- Meal Planner ---
export interface MealSlot {
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipeId: string | null;
  recipeName: string;
}

export interface MealPlan {
  weekStart: string;
  slots: MealSlot[];
}

// --- Shopping List ---
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
}

// --- Pantry ---
export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
}

// --- Kitchen Notes ---
export interface KitchenNote {
  id: string;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
}

// --- Activity ---
export interface Activity {
  id: string;
  action: string;
  timestamp: string;
}

// --- Toast ---
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'guidance';
  title: string;
  message: string;
  duration?: number;
}

// --- Undo ---
export interface UndoAction {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  timestamp: number;
}

// --- Random History ---
export interface RandomHistoryItem {
  id: string;
  recipeId: string;
  recipeName: string;
  recipeThumb: string;
  createdAt: string;
}

// --- Cooked History ---
export interface CookedHistoryItem {
  id: string;
  recipeId: string;
  recipeName: string;
  cookedAt: string;
}

// --- Page types ---
export type PageName =
  | 'home' | 'explore' | 'recipeDetail' | 'mealPlanPreview'
  | 'login' | 'signup'
  | 'dashboard' | 'profileSetup'
  | 'favorites' | 'mealPlanner' | 'shoppingList'
  | 'pantryMatch' | 'randomRecipe' | 'cookingMode'
  | 'nutrition' | 'kitchenNotes' | 'settings';