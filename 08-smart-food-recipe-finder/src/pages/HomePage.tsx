// ===== HOME PAGE =====

import { useMemo } from 'react';
import { ChefHat, Compass, Heart, Sparkles, Users, UtensilsCrossed, BookOpen, ArrowRight, Globe } from 'lucide-react';
import { useAuth, useTheme } from '../contexts';
import { Carousel, RecipeCard, StatCard } from '../components';
import { FALLBACK_RECIPES, FALLBACK_CATEGORIES, FALLBACK_AREAS } from '../fallbackData';
import type { Recipe, PageName } from '../types';

export function HomePage({ navigate }: { navigate: (p: PageName, params?: Record<string, string>) => void }) {
  const { isAuthenticated } = useAuth();
  const { dark } = useTheme();
  const featured = useMemo(() => FALLBACK_RECIPES.slice(0, 6), []);
  const featuredSlides = useMemo(() => {
    const slides: Recipe[][] = [];
    for (let i = 0; i < featured.length; i += 3) slides.push(featured.slice(i, i + 3));
    return slides;
  }, [featured]);

  return (
    <div className={`flavor-page-bg ${dark ? 'bg-[#1A1410]' : 'bg-[#FFF3E0]'}`}>
      {/* Hero */}
      <section className={`relative overflow-hidden bg-food-card min-h-[520px] flex items-center ${dark ? 'bg-[#2A2218]' : 'bg-white'}`}>
        <div className="content-container py-16 md:py-24 text-center">
          <div className={`hero-content-panel animate-slide-up ${dark ? 'hero-content-panel-dark' : ''}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-tomato/10 border border-tomato/20">
              <Sparkles className="w-4 h-4 text-tomato" />
              <span className="text-xs font-semibold text-tomato tracking-wide">YOUR SMART KITCHEN COMPANION</span>
            </div>
            <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>
              Discover, Cook & Savor<br />
              <span className="text-tomato">Every Recipe</span>
            </h1>
            <p className={`text-base md:text-lg max-w-2xl mx-auto mb-8 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>
              Search thousands of recipes, build weekly meal plans, create smart shopping lists, and cook with confidence — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('explore')} className="flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-btn bg-tomato text-white hover:bg-[#B83A20] transition-all cursor-pointer hover:scale-[0.97] active:scale-[0.97] shadow-lg shadow-tomato/25">
                <Compass className="w-5 h-5" /> Explore Recipes
              </button>
              {!isAuthenticated && (
                <button onClick={() => navigate('signup')} className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-btn border-2 transition-all cursor-pointer hover:scale-[0.97] active:scale-[0.97] shadow-lg ${dark ? 'border-[#FFF3E0] bg-[#FFF3E0]/10 text-[#FFF3E0] hover:bg-[#FFF3E0] hover:text-[#1A1410] shadow-black/10' : 'border-espresso/25 bg-white/90 text-espresso hover:bg-espresso hover:text-white shadow-espresso/10'}`}>
                  <ChefHat className="w-5 h-5" /> Get Started Free
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Decorative background shapes */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-tomato/5 dark:bg-tomato/10" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-honey/10" />
      </section>

      {/* Stats */}
      <section className="content-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} value={`${FALLBACK_CATEGORIES.length}+`} label="Recipe Categories" dark={dark} />
          <StatCard icon={Globe} value={`${FALLBACK_AREAS.length}+`} label="Cuisines" dark={dark} />
          <StatCard icon={Users} value="1K+" label="Happy Cooks" dark={dark} />
          <StatCard icon={UtensilsCrossed} value="Free" label="Forever" dark={dark} />
        </div>
      </section>

      {/* How It Works */}
      <section className="content-container py-12 md:py-16">
        <h2 className={`text-3xl font-bold text-center mb-10 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Compass, title: 'Explore & Discover', desc: 'Browse thousands of recipes by category, cuisine, or ingredient. Use random spin for surprise meals.' },
            { icon: Heart, title: 'Save & Plan', desc: 'Bookmark your favorites, build a weekly meal plan, and auto-generate your shopping list.' },
            { icon: ChefHat, title: 'Cook with Confidence', desc: 'Follow step-by-step instructions with a built-in timer. Check off ingredients as you go.' },
          ].map((step, i) => (
            <div key={i} className={`text-center p-6 rounded-card border transition-all ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-tomato/10 flex items-center justify-center">
                <step.icon className="w-7 h-7 text-tomato" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>{step.title}</h3>
              <p className={`text-sm ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Recipes Carousel */}
      <section className="content-container py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-3xl font-bold ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>Featured Recipes</h2>
          <button onClick={() => navigate('explore')} className={`flex items-center gap-1 text-sm font-medium cursor-pointer ${dark ? 'text-tomato-light hover:text-tomato' : 'text-tomato hover:text-[#B83A20]'}`}>View All <ArrowRight className="w-4 h-4" /></button>
        </div>
        <div className="featured-carousel">
          <Carousel
            autoSlideMs={5200}
            items={featuredSlides.map((slide, slideIndex) => (
              <div key={slideIndex} className="grid grid-cols-1 md:grid-cols-3 gap-5 px-1 pb-10">
                {slide.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    dark={dark}
                    onClick={() => navigate('recipeDetail', { id: recipe.id })}
                    actionLabel="View Recipe"
                    onAction={() => navigate('recipeDetail', { id: recipe.id })}
                    actionIcon={ArrowRight}
                  />
                ))}
              </div>
            ))}
          />
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="content-container py-12 md:py-16">
          <div className={`rounded-card p-8 md:p-12 text-center bg-espresso dark:bg-[#2A2218] border border-espresso-light`}>
            <h2 className="text-2xl md:text-3xl font-bold text-[#FFF3E0] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Ready to Start Cooking?</h2>
            <p className="text-[#C4A882] mb-6 max-w-md mx-auto">Join Savoria today and discover a smarter way to cook, plan meals, and manage your kitchen.</p>
            <button onClick={() => navigate('signup')} className="px-6 py-3 font-medium rounded-btn bg-tomato text-white hover:bg-[#B83A20] transition-all cursor-pointer hover:scale-[0.97] active:scale-[0.97] shadow-lg shadow-tomato/25">Create Free Account</button>
          </div>
        </section>
      )}
    </div>
  );
}