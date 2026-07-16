// ===== RECIPE DETAIL PAGE =====

import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, CalendarDays, ShoppingCart, PlayCircle, Clock, ChefHat } from 'lucide-react';
import { useAuth, useTheme } from '../contexts';
import { useRecipeApi, useLocalStorage } from '../hooks';
import { ImgWithFallback, LoadingSpinner } from '../components';
import { splitInstructionSteps, upsertRecipe } from '../recipeUtils';
import type { Recipe, PageName, MealSlot, ToastMessage, ShoppingItem } from '../types';

const defaultMealSlots = (): MealSlot[] => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  .flatMap((slotDay) => (['breakfast', 'lunch', 'dinner'] as MealSlot['mealType'][])
    .map((mealType) => ({ day: slotDay, mealType, recipeId: null, recipeName: '' })));

export function RecipeDetailPage({ recipeId, navigate, addToast }: { recipeId: string; navigate: (p: PageName, params?: Record<string, string>) => void; addToast: (type: ToastMessage['type'], title: string, message: string) => string }) {
  const { isAuthenticated, userStorageKey } = useAuth();
  const { dark } = useTheme();
  const { getById } = useRecipeApi();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useLocalStorage<string[]>(userStorageKey('favorites'), []);
  const [savedRecipes, setSavedRecipes] = useLocalStorage<Recipe[]>(userStorageKey('savedRecipes'), []);
  const [mealSlots, setMealSlots] = useLocalStorage<MealSlot[]>(userStorageKey('mealPlans'), []);
  const [shoppingItems, setShoppingItems] = useLocalStorage<ShoppingItem[]>(userStorageKey('shoppingList'), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const saved = savedRecipes.find((item) => item.id === recipeId);
      if (saved) {
        if (!cancelled) { setRecipe(saved); setLoading(false); }
        return;
      }
      const r = await getById(recipeId);
      if (!cancelled) { setRecipe(r); setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [recipeId, getById, savedRecipes]);

  const isFavorite = recipe ? favorites.includes(recipe.id) : false;
  const saveRecipeCard = (item: Recipe) => setSavedRecipes((prev) => upsertRecipe(prev, item));

  const toggleFavorite = () => {
    if (!recipe) return;
    if (!isAuthenticated) {
      addToast('warning', 'Login required', 'Please log in or sign up to save favorites.');
      navigate('login');
      return;
    }
    saveRecipeCard(recipe);
    if (isFavorite) {
      setFavorites((prev) => prev.filter((id) => id !== recipe.id));
      addToast('success', 'Removed', `${recipe.name} removed from favorites.`);
    } else {
      setFavorites((prev) => prev.includes(recipe.id) ? prev : [...prev, recipe.id]);
      addToast('success', 'Added to Favorites', `${recipe.name} added to favorites.`);
    }
  };

  const addToMealPlan = () => {
    if (!recipe) return;
    saveRecipeCard(recipe);
    const baseSlots = mealSlots.length ? mealSlots : defaultMealSlots();
    const emptySlot = baseSlots.find((s) => !s.recipeId);
    if (emptySlot) {
      setMealSlots(baseSlots.map((s) => s === emptySlot ? { ...s, recipeId: recipe.id, recipeName: recipe.name } : s));
      addToast('success', 'Added to Meal Plan', `${recipe.name} added to ${emptySlot.day} ${emptySlot.mealType}.`);
    } else {
      addToast('warning', 'Meal Plan Full', 'Your meal plan has no empty slots. Clear some space first.');
    }
  };

  const addToShoppingList = () => {
    if (!recipe) return;
    saveRecipeCard(recipe);
    const newItems = recipe.ingredients
      .filter((ing) => !shoppingItems.some((existing) => existing.name.toLowerCase() === ing.ingredient.toLowerCase()))
      .map((ing) => ({ id: Date.now().toString(36) + Math.random().toString(36).slice(2), name: ing.ingredient, quantity: ing.measure || '1', category: recipe.category || 'General', checked: false }));
    setShoppingItems((prev) => [...prev, ...newItems]);
    addToast('success', 'Added to Shopping List', `${newItems.length} ingredients added to your shopping list.`);
  };

  if (loading) return <LoadingSpinner text="Loading recipe..." />;
  if (!recipe) return (
    <div className={`flavor-page-bg min-h-screen ${dark ? 'bg-[#1A1410]' : 'bg-[#FFF3E0]'}`}>
      <div className="content-container py-16 text-center">
        <ChefHat className={`w-16 h-16 mx-auto mb-4 ${dark ? 'text-[#4A3828]' : 'text-[#E8D5C0]'}`} />
        <h2 className={`text-xl font-bold mb-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Recipe Not Found</h2>
        <p className={`mb-6 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>We couldn't find this recipe. It may have been removed or the link is broken.</p>
        <button onClick={() => navigate('explore')} className="px-5 py-2.5 rounded-btn bg-tomato text-white font-medium cursor-pointer hover:bg-[#B83A20] transition-all">Browse Recipes</button>
      </div>
    </div>
  );

  const steps = splitInstructionSteps(recipe.instructions);
  const normalizeVideoUrl = (url?: string) => {
    if (!url || url.includes('/results?search_query=')) {
      const query = url?.split('search_query=')[1] ? decodeURIComponent(url.split('search_query=')[1]) : `${recipe.name} recipe tutorial`;
      return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}`;
    }
    return url;
  };
  const youtubeUrl = normalizeVideoUrl(recipe.youtube);

  return (
    <div className={`flavor-page-bg min-h-screen ${dark ? 'bg-[#1A1410]' : 'bg-[#FFF3E0]'}`}>
      <div className="content-container py-8">
        <button onClick={() => navigate('explore')} className={`flex items-center gap-1.5 text-sm mb-6 cursor-pointer transition-colors ${dark ? 'text-[#C4A882] hover:text-[#FFF3E0]' : 'text-[#8B7355] hover:text-espresso'}`}>
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-card overflow-hidden shadow-card">
              <ImgWithFallback src={recipe.thumbnail} alt={recipe.name} recipeName={recipe.name} recipeCategory={recipe.category} className="w-full aspect-[4/3] object-cover" />
            </div>
            <div className="grid sm:grid-cols-2 gap-2 mt-4">
              <button onClick={toggleFavorite} className={`recipe-action-btn px-4 py-2 text-sm font-medium rounded-btn transition-all cursor-pointer hover:scale-[0.97] active:scale-[0.97] ${isFavorite ? 'bg-tomato text-white' : dark ? 'border border-[#C4A882] text-[#FFF3E0]' : 'border border-espresso text-espresso'}`}>
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} /> {isFavorite ? 'Favorite' : 'Add Favorite'}
              </button>
              {isAuthenticated && (
                <>
                  <button onClick={addToMealPlan} className="recipe-action-btn px-4 py-2 text-sm font-medium rounded-btn bg-olive text-white hover:bg-[#5F6E3A] transition-all cursor-pointer hover:scale-[0.97] active:scale-[0.97]">
                    <CalendarDays className="w-4 h-4" /> Add to Meal Plan
                  </button>
                  <button onClick={addToShoppingList} className="recipe-action-btn px-4 py-2 text-sm font-medium rounded-btn bg-honey text-espresso hover:bg-[#D9A030] transition-all cursor-pointer hover:scale-[0.97] active:scale-[0.97] sm:col-span-2">
                    <ShoppingCart className="w-4 h-4" /> Add to Shopping List
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${dark ? 'bg-[#2A2218] text-honey' : 'bg-[#FFF3E0] text-clay'}`}>{recipe.category}</span>
              <span className={`text-xs uppercase tracking-wider ${dark ? 'text-[#8B7355]' : 'text-[#C4A882]'}`}>{recipe.area}</span>
              {recipe.tags.map((tag) => (
                <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full ${dark ? 'bg-[#2A2218] text-[#C4A882]' : 'bg-[#FFF8F0] text-[#8B7355]'}`}>{tag}</span>
              ))}
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>{recipe.name}</h1>

            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-btn bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer mb-6">
              <PlayCircle className="w-4 h-4" /> Watch Tutorial Video
            </a>

            <div className={`rounded-card border p-6 mb-6 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
              <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                <ShoppingCart className="w-5 h-5 text-tomato" /> Ingredients
              </h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className={`flex items-center gap-3 text-sm py-2 border-b last:border-b-0 ${dark ? 'border-[#4A3828] text-[#C4A882]' : 'border-[#E8D5C0] text-[#5C4033]'}`}>
                    <span className="w-2 h-2 rounded-full bg-tomato shrink-0" />
                    <span className={`font-semibold ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{ing.ingredient}</span>
                    <span className={`ml-auto text-right ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{ing.measure}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`rounded-card border p-6 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
              <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                <Clock className="w-5 h-5 text-tomato" /> Instructions
              </h2>
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={i} className={`flex gap-3 p-3 rounded-btn ${dark ? 'bg-[#1A1410]' : 'bg-[#FFF8F0]'}`}>
                    <span className="shrink-0 w-7 h-7 rounded-full bg-tomato text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                    <p className={`text-sm pt-0.5 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
