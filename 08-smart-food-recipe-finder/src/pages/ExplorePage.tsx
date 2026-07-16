// ===== EXPLORE RECIPES PAGE =====

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts';
import { useRecipeApi } from '../hooks';
import { SkeletonCard, RecipeCard, EmptyState } from '../components';
import { FALLBACK_CATEGORIES, FALLBACK_AREAS, FALLBACK_INGREDIENTS } from '../fallbackData';
import type { Recipe, PageName } from '../types';

export function ExplorePage({ navigate }: { navigate: (p: PageName, params?: Record<string, string>) => void }) {
  const { dark } = useTheme();
  const { searchByName, filterByCategory, filterByArea, filterByIngredient } = useRecipeApi();
  // useState
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'category' | 'area' | 'ingredient'>('all');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notice, setNotice] = useState('');

  const handleSearch = async () => {
    setNotice('');
    const filterLabel = activeFilter === 'area' ? 'cuisine' : activeFilter;
    if (!query.trim() && activeFilter === 'all') {
      setNotice('Type a recipe name or choose a filter first.');
      setSearched(false);
      return;
    }
    if (!query.trim() && activeFilter !== 'all' && !selectedFilter) {
      setNotice(`Please select a ${filterLabel} first.`);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      let results: Recipe[] = [];
      if (query.trim()) {
        results = await searchByName(query.trim());
      } else if (activeFilter === 'category') {
        results = await filterByCategory(selectedFilter);
      } else if (activeFilter === 'area') {
        results = await filterByArea(selectedFilter);
      } else if (activeFilter === 'ingredient') {
        results = await filterByIngredient(selectedFilter);
      }
      setRecipes(results);
      if (results.length === 0) setNotice('No matching recipes found. Try a broader search term or another filter.');
    } catch {
      setRecipes([]);
      setNotice('Recipe search is unavailable right now. Please check your internet connection and try again.');
    }
    setLoading(false);
  };

  // useEffect — search on filter change
  useEffect(() => {
    if (activeFilter !== 'all' && selectedFilter) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, selectedFilter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const filterOptions = useMemo(() => {
    if (activeFilter === 'category') return FALLBACK_CATEGORIES.map((c) => c.strCategory);
    if (activeFilter === 'area') return FALLBACK_AREAS;
    if (activeFilter === 'ingredient') return FALLBACK_INGREDIENTS.map((i) => i.strIngredient);
    return [];
  }, [activeFilter]);

  return (
    <div className={`flavor-page-bg min-h-screen ${dark ? 'bg-[#1A1410]' : 'bg-[#FFF3E0]'}`}>
      <div className="content-container py-8">
        <h1 className={`text-3xl font-bold mb-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>Explore Recipes</h1>
        <p className={`mb-8 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>Search by name or filter by category, cuisine, or main ingredient. If the live recipe API has no match, Savoria shows curated recipes from its built-in collection.</p>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${dark ? 'text-[#8B7355]' : 'text-[#C4A882]'}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search recipes by name..."
              className={`w-full pl-10 pr-4 py-3 rounded-btn border text-sm transition-colors ${dark ? 'bg-[#2A2218] border-[#4A3828] text-[#FFF3E0] placeholder-[#8B7355]' : 'bg-white border-[#E8D5C0] text-espresso placeholder-[#C4A882]'}`}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value as typeof activeFilter); setSelectedFilter(''); setQuery(''); }}
              className={`px-3 py-3 rounded-btn border text-sm cursor-pointer ${dark ? 'bg-[#2A2218] border-[#4A3828] text-[#FFF3E0]' : 'bg-white border-[#E8D5C0] text-espresso'}`}
            >
              <option value="all">All Recipes</option>
              <option value="category">By Category</option>
              <option value="area">By Cuisine</option>
              <option value="ingredient">By Ingredient</option>
            </select>
            {activeFilter !== 'all' && (
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`px-3 py-3 rounded-btn border text-sm cursor-pointer ${dark ? 'bg-[#2A2218] border-[#4A3828] text-[#FFF3E0]' : 'bg-white border-[#E8D5C0] text-espresso'}`}
              >
                <option value="">Select {activeFilter}...</option>
                {filterOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            <button onClick={handleSearch} className="flex items-center gap-2 px-5 py-3 font-medium rounded-btn bg-tomato text-white hover:bg-[#B83A20] transition-all cursor-pointer hover:scale-[0.97] active:scale-[0.97]">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>

        {notice && (
          <div className={`mb-6 rounded-btn border px-4 py-3 text-sm ${dark ? 'border-[#4A3828] bg-[#2A2218] text-[#C4A882]' : 'border-[#E8D5C0] bg-white text-[#8B7355]'}`}>
            {notice}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : searched && recipes.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="No Recipes Found"
            description="Try another ingredient, cuisine, category, or search term."
            action={{ label: 'Clear Filters', onClick: () => { setQuery(''); setActiveFilter('all'); setSelectedFilter(''); setSearched(false); setNotice(''); } }}
          />
        ) : searched && recipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  dark={dark}
                  onClick={() => navigate('recipeDetail', { id: recipe.id })}
                  actionLabel="View Recipe"
                  actionIcon={ArrowRight}
                  onAction={() => navigate('recipeDetail', { id: recipe.id })}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Filter className={`w-16 h-16 mx-auto mb-4 ${dark ? 'text-[#4A3828]' : 'text-[#E8D5C0]'}`} />
            <p className={`text-lg ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>Search for recipes or choose a filter to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}