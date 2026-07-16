// ===== MEAL PLAN PREVIEW PAGE =====

import { CalendarDays, Heart, ShoppingCart, ArrowRight, ChefHat } from 'lucide-react';
import { useAuth, useTheme } from '../contexts';
import type { PageName } from '../types';

export function MealPlanPreviewPage({ navigate }: { navigate: (p: PageName, params?: Record<string, string>) => void }) {
  const { isAuthenticated } = useAuth();
  const { dark } = useTheme();

  return (
    <div className={`flavor-page-bg min-h-screen ${dark ? 'bg-[#1A1410]' : 'bg-[#FFF3E0]'}`}>
      <div className="content-container py-16">
        <div className="max-w-3xl mx-auto text-center animate-slide-up">
          <CalendarDays className={`w-16 h-16 mx-auto mb-6 ${dark ? 'text-honey' : 'text-tomato'}`} />
          <h1 className={`text-4xl font-bold mb-4 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>Plan Your Meals, Save Time</h1>
          <p className={`text-lg mb-8 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>
            Build a weekly meal plan in minutes. Assign recipes to each day and let Savoria auto-generate your shopping list.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: CalendarDays, title: 'Weekly Planner', desc: 'Fill in breakfast, lunch, and dinner for every day of the week.' },
              { icon: Heart, title: 'Use Favorites', desc: 'Quickly add recipes you\'ve saved to your favorites.' },
              { icon: ShoppingCart, title: 'Auto Shopping List', desc: 'Generate a complete shopping list from your weekly plan with one click.' },
            ].map((step, i) => (
              <div key={i} className={`p-6 rounded-card border ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
                <step.icon className={`w-10 h-10 mx-auto mb-3 ${dark ? 'text-honey' : 'text-tomato'}`} />
                <h3 className={`font-bold mb-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{step.title}</h3>
                <p className={`text-sm ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{step.desc}</p>
              </div>
            ))}
          </div>

          {isAuthenticated ? (
            <button onClick={() => navigate('mealPlanner')} className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-btn bg-tomato text-white hover:bg-[#B83A20] transition-all cursor-pointer hover:scale-[0.97] active:scale-[0.97] shadow-lg shadow-tomato/25">
              Go to Meal Planner <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className={`p-6 rounded-card border ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
              <ChefHat className="w-10 h-10 mx-auto mb-3 text-tomato" />
              <h3 className={`font-bold mb-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Sign up to unlock Meal Planning</h3>
              <button onClick={() => navigate('signup')} className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-btn bg-tomato text-white hover:bg-[#B83A20] transition-all cursor-pointer hover:scale-[0.97] active:scale-[0.97]">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}