import { useEffect, useMemo, useState } from 'react';
import {
  Apple,
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  Lightbulb,
  LogIn,
  NotebookPen,
  Plus,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingCart,
  Shuffle,
  Star,
  Timer,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { ThemeProvider, AuthProvider, useAuth, useTheme } from './contexts';
import { useLocalStorage, useRecipeApi, useToast, useTimer } from './hooks';
import { EmptyState, Footer, Navbar, RecipeCard, StatCard, ToastContainer, ViewAllModal } from './components';
import { ExplorePage } from './pages/ExplorePage';
import { HomePage } from './pages/HomePage';
import { MealPlanPreviewPage } from './pages/MealPlanPreviewPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { FALLBACK_RECIPES, NUTRITION_TIPS } from './fallbackData';
import { findRecipeById, mergeRecipesById, splitInstructionSteps, upsertRecipe } from './recipeUtils';
import type {
  CookedHistoryItem,
  KitchenNote,
  MealSlot,
  PageName,
  PantryItem,
  Recipe,
  ShoppingItem,
  ToastMessage,
  UserProfile,
  SocialProvider,
} from './types';

type Navigate = (page: PageName, params?: Record<string, string>) => void;

const PRIVATE_PAGES = new Set<PageName>([
  'dashboard',
  'profileSetup',
  'favorites',
  'mealPlanner',
  'shoppingList',
  'pantryMatch',
  'randomRecipe',
  'cookingMode',
  'nutrition',
  'kitchenNotes',
  'settings',
]);

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS: MealSlot['mealType'][] = ['breakfast', 'lunch', 'dinner'];

function createEmptyMealSlots(): MealSlot[] {
  return DAYS.flatMap((day) =>
    MEALS.map((mealType) => ({ day, mealType, recipeId: null, recipeName: '' }))
  );
}

function hashToRoute(): { page: PageName; params: Record<string, string> } {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw) return { page: 'home', params: {} };
  const [pagePart, queryPart] = raw.split('?');
  const allowedPages: PageName[] = [
    'home', 'explore', 'recipeDetail', 'mealPlanPreview', 'login', 'signup',
    'dashboard', 'profileSetup', 'favorites', 'mealPlanner', 'shoppingList',
    'pantryMatch', 'randomRecipe', 'cookingMode', 'nutrition', 'kitchenNotes', 'settings',
  ];
  const page = allowedPages.includes(pagePart as PageName) ? (pagePart as PageName) : 'home';
  const searchParams = new URLSearchParams(queryPart || '');
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => { params[key] = value; });
  return { page, params };
}

function routeToHash(page: PageName, params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return `#/${page}${query ? `?${query}` : ''}`;
}


function PageShell({ children }: { children: React.ReactNode }) {
  const { dark } = useTheme();
  return <main className={`flavor-page-bg min-h-screen ${dark ? 'bg-[#1A1410]' : 'bg-[#FFF3E0]'}`}>{children}</main>;
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  const { dark } = useTheme();
  return (
    <div className="mb-8">
      {eyebrow && <p className="text-xs font-bold tracking-[0.2em] uppercase text-tomato mb-2">{eyebrow}</p>}
      <h1 className={`text-3xl md:text-4xl font-bold ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>{title}</h1>
      {subtitle && <p className={`mt-2 max-w-2xl ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{subtitle}</p>}
    </div>
  );
}

function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (event: MouseEvent) => setPosition({ x: event.clientX, y: event.clientY });
    const hoverIn = (event: Event) => {
      const target = event.target as HTMLElement | null;
      setHovering(!!target?.closest('button, a, input, select, textarea, [role="button"]'));
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', hoverIn);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', hoverIn);
    };
  }, []);

  return <div className={`custom-cursor ${hovering ? 'hovering' : ''}`} style={{ left: position.x, top: position.y }} />;
}

function SocialAuthButtons({ mode, navigate, onError }: { mode: 'login' | 'signup'; navigate: Navigate; onError: (message: string) => void }) {
  const { socialLogin } = useAuth();
  const { dark } = useTheme();
  const providers: { provider: SocialProvider; label: string; badge: string }[] = [
    { provider: 'google', label: 'Google', badge: 'G' },
    { provider: 'facebook', label: 'Facebook', badge: 'f' },
    { provider: 'github', label: 'GitHub', badge: 'GH' },
  ];

  const handleSocial = (provider: SocialProvider) => {
    const result = socialLogin(provider);
    if (!result.success) return onError(result.message);
    navigate(result.isNew ? 'profileSetup' : 'dashboard');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className={`h-px flex-1 ${dark ? 'bg-[#4A3828]' : 'bg-[#E8D5C0]'}`} />
        <span className={`text-xs uppercase tracking-[0.18em] ${dark ? 'text-[#8B7355]' : 'text-[#C4A882]'}`}>or continue with</span>
        <span className={`h-px flex-1 ${dark ? 'bg-[#4A3828]' : 'bg-[#E8D5C0]'}`} />
      </div>
      <div className="grid sm:grid-cols-3 gap-2">
        {providers.map((item) => (
          <button
            key={item.provider}
            type="button"
            onClick={() => handleSocial(item.provider)}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-btn border font-semibold text-sm transition-all hover:scale-[0.97] ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0] hover:bg-[#2A2218]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso hover:bg-[#FFF3E0]'}`}
          >
            <span className="w-6 h-6 rounded-full bg-white text-espresso border border-[#E8D5C0] flex items-center justify-center text-xs font-black">{item.badge}</span>
            {item.label}
          </button>
        ))}
      </div>
      <p className={`text-[11px] text-center ${dark ? 'text-[#8B7355]' : 'text-[#A48A6B]'}`}>
        Demo social {mode} uses localStorage only. Real OAuth can be connected later with Firebase, Supabase, or a backend.
      </p>
    </div>
  );
}

function LoginPage({ navigate }: { navigate: Navigate }) {
  const { login } = useAuth();
  const { dark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    const result = login(email.trim(), password);
    if (!result.success) return setError(result.message);
    navigate('dashboard');
  };

  return (
    <PageShell>
      <div className="content-container py-12 md:py-16">
        <div className={`max-w-4xl mx-auto grid md:grid-cols-2 rounded-card overflow-hidden border shadow-card ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
          <div className="p-8 md:p-10 bg-espresso text-[#FFF3E0] flex flex-col justify-center gap-6">
            <div className="relative overflow-hidden rounded-card border border-white/10 shadow-card bg-[#3A281F] min-h-[240px] md:min-h-[300px]">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1100&q=80"
                alt="Colorful food table for Savoria login"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C1C16]/85 via-[#2C1C16]/25 to-transparent" />
              <div className="absolute left-5 right-5 bottom-5">
                <p className="text-xs uppercase tracking-[0.18em] text-honey font-bold mb-1">Fresh recipes await</p>
                <h2 className="text-2xl font-bold text-[#FFF8F0]" style={{ fontFamily: 'var(--font-heading)' }}>Your saved kitchen, one login away.</h2>
              </div>
            </div>
            <div>
              <LogIn className="w-12 h-12 text-honey mb-4" />
              <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Welcome back, chef!</h1>
              <p className="text-[#C4A882]">Log in to open your favorites, weekly meal planner, pantry matcher, notes, and shopping list.</p>
            </div>
          </div>
          <form onSubmit={submit} className="p-8 md:p-10 space-y-5">
            <SectionTitle title="Login" subtitle="Use the same email you signed up with." />
            {error && <div className="rounded-btn border border-tomato/40 bg-tomato/10 px-4 py-3 text-sm text-tomato">{error}</div>}
            <label className="block">
              <span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="malaika@example.com" className={`mt-1 w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0] placeholder-[#8B7355]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso placeholder-[#C4A882]'}`} />
            </label>
            <label className="block">
              <span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Minimum 6 characters" className={`mt-1 w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0] placeholder-[#8B7355]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso placeholder-[#C4A882]'}`} />
            </label>
            <button className="w-full px-5 py-3 rounded-btn bg-tomato text-white font-semibold hover:bg-[#B83A20] transition-all hover:scale-[0.98]" type="submit">Login</button>
            <SocialAuthButtons mode="login" navigate={navigate} onError={setError} />
            <p className={`text-sm text-center ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>New here? <button type="button" onClick={() => navigate('signup')} className="font-semibold text-tomato hover:underline">Create an account</button></p>
          </form>
        </div>
      </div>
    </PageShell>
  );
}

function SignupPage({ navigate }: { navigate: Navigate }) {
  const { signup } = useAuth();
  const { dark } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (fullName.trim().length < 3) return setError('Full name must be at least 3 characters.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    const result = signup(fullName.trim(), email.trim(), password);
    if (!result.success) return setError(result.message);
    navigate('profileSetup');
  };

  return (
    <PageShell>
      <div className="content-container py-12 md:py-16">
        <div className={`max-w-5xl mx-auto grid md:grid-cols-2 rounded-card overflow-hidden border shadow-card ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
          <form onSubmit={submit} className="p-8 md:p-10 space-y-5">
            <SectionTitle title="Create your Savoria" subtitle="Save recipes, plan meals, and keep your kitchen organized." />
            {error && <div className="rounded-btn border border-tomato/40 bg-tomato/10 px-4 py-3 text-sm text-tomato">{error}</div>}
            <label className="block">
              <span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Full name</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Malaika Tariq" className={`mt-1 w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0] placeholder-[#8B7355]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso placeholder-[#C4A882]'}`} />
            </label>
            <label className="block">
              <span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="malaika@example.com" className={`mt-1 w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0] placeholder-[#8B7355]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso placeholder-[#C4A882]'}`} />
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Password</span>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Minimum 6 characters" className={`mt-1 w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0] placeholder-[#8B7355]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso placeholder-[#C4A882]'}`} />
              </label>
              <label className="block">
                <span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Confirm</span>
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Repeat password" className={`mt-1 w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0] placeholder-[#8B7355]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso placeholder-[#C4A882]'}`} />
              </label>
            </div>
            <button className="w-full px-5 py-3 rounded-btn bg-tomato text-white font-semibold hover:bg-[#B83A20] transition-all hover:scale-[0.98]" type="submit">Sign Up</button>
            <SocialAuthButtons mode="signup" navigate={navigate} onError={setError} />
            <p className={`text-sm text-center ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>Already have an account? <button type="button" onClick={() => navigate('login')} className="font-semibold text-tomato hover:underline">Login</button></p>
          </form>
          <div className="p-8 md:p-10 bg-espresso text-[#FFF3E0] flex flex-col justify-center gap-6">
            <div className="relative overflow-hidden rounded-card border border-white/10 shadow-card bg-[#3A281F] min-h-[240px] md:min-h-[300px]">
              <img
                src="https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=1100&q=80"
                alt="Healthy bowls and ingredients for Savoria sign up"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C1C16]/85 via-[#2C1C16]/25 to-transparent" />
              <div className="absolute left-5 right-5 bottom-5">
                <p className="text-xs uppercase tracking-[0.18em] text-honey font-bold mb-1">Start your meal journey</p>
                <h2 className="text-2xl font-bold text-[#FFF8F0]" style={{ fontFamily: 'var(--font-heading)' }}>Create plans, favorites, and lists beautifully.</h2>
              </div>
            </div>
            <div>
              <UserPlus className="w-12 h-12 text-honey mb-4" />
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>A kitchen dashboard made for real life.</h2>
              <ul className="space-y-3 text-[#C4A882]">
                <li className="flex gap-2"><Check className="w-5 h-5 text-honey shrink-0" /> Private local account demo</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-honey shrink-0" /> Free recipe API with offline fallback</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-honey shrink-0" /> Favorites, planner, notes and shopping list</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ProfileSetupPage({ navigate }: { navigate: Navigate }) {
  const { profile, updateProfile } = useAuth();
  const { dark } = useTheme();
  const [form, setForm] = useState<UserProfile>(profile || {
    cookingLevel: 'Beginner',
    dietPreference: 'No preference',
    favoriteCuisine: 'Pakistani',
    allergies: [],
    dislikedIngredients: [],
    weeklyCookingGoal: 5,
    preferredMealType: 'Dinner',
    cookingTimePreference: '30 minutes',
    kitchenTools: ['Pan', 'Pot'],
    budgetLevel: 'Balanced',
  });
  const [allergyText, setAllergyText] = useState((profile?.allergies || []).join(', '));
  const [dislikedText, setDislikedText] = useState((profile?.dislikedIngredients || []).join(', '));
  const [toolsText, setToolsText] = useState((profile?.kitchenTools || []).join(', '));

  const inputClass = `w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0] placeholder-[#8B7355]' : 'bg-white border-[#E8D5C0] text-espresso placeholder-[#C4A882]'}`;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    updateProfile({
      ...form,
      allergies: allergyText.split(',').map((item) => item.trim()).filter(Boolean),
      dislikedIngredients: dislikedText.split(',').map((item) => item.trim()).filter(Boolean),
      kitchenTools: toolsText.split(',').map((item) => item.trim()).filter(Boolean),
    });
    navigate('dashboard');
  };

  return (
    <PageShell>
      <div className="content-container py-10">
        <SectionTitle eyebrow="Personal kitchen" title="Set your cooking preferences" subtitle="This helps the app guide your pantry, planner and nutrition sections." />
        <form onSubmit={submit} className={`rounded-card border shadow-card p-6 grid md:grid-cols-2 gap-5 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
          <label className="block"><span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Cooking level</span><select className={`${inputClass} mt-1`} value={form.cookingLevel} onChange={(e) => setForm({ ...form, cookingLevel: e.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
          <label className="block"><span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Diet preference</span><select className={`${inputClass} mt-1`} value={form.dietPreference} onChange={(e) => setForm({ ...form, dietPreference: e.target.value })}><option>No preference</option><option>Vegetarian</option><option>High protein</option><option>Low carb</option><option>Budget-friendly</option></select></label>
          <label className="block"><span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Favorite cuisine</span><input className={`${inputClass} mt-1`} value={form.favoriteCuisine} onChange={(e) => setForm({ ...form, favoriteCuisine: e.target.value })} /></label>
          <label className="block"><span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Weekly cooking goal</span><input className={`${inputClass} mt-1`} type="number" min="1" max="21" value={form.weeklyCookingGoal} onChange={(e) => setForm({ ...form, weeklyCookingGoal: Number(e.target.value) })} /></label>
          <label className="block"><span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Preferred meal type</span><select className={`${inputClass} mt-1`} value={form.preferredMealType} onChange={(e) => setForm({ ...form, preferredMealType: e.target.value })}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snacks</option></select></label>
          <label className="block"><span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Cooking time</span><select className={`${inputClass} mt-1`} value={form.cookingTimePreference} onChange={(e) => setForm({ ...form, cookingTimePreference: e.target.value })}><option>15 minutes</option><option>30 minutes</option><option>45 minutes</option><option>1 hour+</option></select></label>
          <label className="block"><span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Budget level</span><select className={`${inputClass} mt-1`} value={form.budgetLevel} onChange={(e) => setForm({ ...form, budgetLevel: e.target.value })}><option>Low</option><option>Balanced</option><option>Premium</option></select></label>
          <label className="block"><span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Kitchen tools</span><input className={`${inputClass} mt-1`} value={toolsText} onChange={(e) => setToolsText(e.target.value)} placeholder="Pan, oven, blender" /></label>
          <label className="block md:col-span-2"><span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Allergies</span><input className={`${inputClass} mt-1`} value={allergyText} onChange={(e) => setAllergyText(e.target.value)} placeholder="Peanuts, seafood" /></label>
          <label className="block md:col-span-2"><span className={`text-sm font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Disliked ingredients</span><input className={`${inputClass} mt-1`} value={dislikedText} onChange={(e) => setDislikedText(e.target.value)} placeholder="Mushroom, olives" /></label>
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 justify-end">
            <button type="button" onClick={() => navigate('dashboard')} className={`px-5 py-3 rounded-btn border font-medium ${dark ? 'border-[#4A3828] text-[#FFF3E0]' : 'border-[#E8D5C0] text-espresso'}`}>Skip for now</button>
            <button type="submit" className="px-5 py-3 rounded-btn bg-tomato text-white font-semibold hover:bg-[#B83A20] transition-all">Save preferences</button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function DashboardPage({ navigate }: { navigate: Navigate }) {
  const { user, profileCompletion, userStorageKey } = useAuth();
  const { dark } = useTheme();
  const [favorites] = useLocalStorage<string[]>(userStorageKey('favorites'), []);
  const [mealSlots] = useLocalStorage<MealSlot[]>(userStorageKey('mealPlans'), createEmptyMealSlots());
  const [shoppingList] = useLocalStorage<ShoppingItem[]>(userStorageKey('shoppingList'), []);
  const [notes] = useLocalStorage<KitchenNote[]>(userStorageKey('notes'), []);
  const plannedMeals = mealSlots.filter((slot) => slot.recipeId).length;

  return (
    <PageShell>
      <div className="content-container py-10">
        <div className={`rounded-card p-6 md:p-8 border mb-8 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-tomato text-sm font-bold tracking-[0.18em] uppercase">Savoria Dashboard</p>
              <h1 className={`text-3xl md:text-4xl font-bold mt-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>Hi {user?.fullName?.split(' ')[0] || 'Chef'} 👋</h1>
              <p className={`mt-2 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>Your kitchen planner is ready. Pick a quick action and keep cooking.</p>
            </div>
            <button onClick={() => navigate('profileSetup')} className="px-5 py-3 rounded-btn bg-tomato text-white font-semibold hover:bg-[#B83A20] transition-all">Complete profile: {profileCompletion}%</button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Heart} value={favorites.length} label="Favorites" dark={dark} />
          <StatCard icon={CalendarDays} value={plannedMeals} label="Planned Meals" dark={dark} />
          <StatCard icon={ShoppingCart} value={shoppingList.filter((item) => !item.checked).length} label="Shopping Items" dark={dark} />
          <StatCard icon={NotebookPen} value={notes.length} label="Kitchen Notes" dark={dark} />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Search, title: 'Explore recipes', desc: 'Search by meal name, ingredient, category or cuisine.', page: 'explore' as PageName },
            { icon: CalendarDays, title: 'Build meal plan', desc: 'Assign recipes to breakfast, lunch and dinner slots.', page: 'mealPlanner' as PageName },
            { icon: Lightbulb, title: 'Match pantry', desc: 'Add what you have and discover meals you can cook.', page: 'pantryMatch' as PageName },
            { icon: Shuffle, title: 'Random recipe', desc: 'Spin for a new idea and save the result.', page: 'randomRecipe' as PageName },
            { icon: Timer, title: 'Cooking mode', desc: 'Follow clean steps with an optional kitchen timer.', page: 'cookingMode' as PageName },
            { icon: Apple, title: 'Nutrition tips', desc: 'Simple guidance for balanced daily meals.', page: 'nutrition' as PageName },
          ].map((item) => (
            <button key={item.title} onClick={() => navigate(item.page)} className={`text-left rounded-card border p-5 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
              <item.icon className="w-7 h-7 text-tomato mb-4" />
              <h3 className={`font-bold mb-1 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{item.title}</h3>
              <p className={`text-sm ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function FavoritesPage({ navigate, addToast }: { navigate: Navigate; addToast: ToastFn }) {
  const { dark } = useTheme();
  const { userStorageKey } = useAuth();
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>(userStorageKey('favorites'), []);
  const [savedRecipes] = useLocalStorage<Recipe[]>(userStorageKey('savedRecipes'), []);
  const allRecipes = mergeRecipesById(savedRecipes, FALLBACK_RECIPES);
  const recipes = favoriteIds.map((id) => findRecipeById(id, allRecipes)).filter((recipe): recipe is Recipe => recipe !== null);

  const remove = (id: string) => {
    setFavoriteIds((prev) => prev.filter((fav) => fav !== id));
    addToast('success', 'Removed from favorites', 'The recipe was removed from your favorites.');
  };

  return (
    <PageShell>
      <div className="content-container py-10">
        <SectionTitle eyebrow="Favorite recipes" title="Favorites" subtitle="Your favorite recipe cards are private to this account and stay here after refresh." />
        {favoriteIds.length === 0 ? (
          <EmptyState icon={Heart} title="No favorites yet" description="Explore recipes and tap save on meals you want to keep." action={{ label: 'Explore Recipes', onClick: () => navigate('explore') }} />
        ) : recipes.length === 0 ? (
          <EmptyState icon={Heart} title="Favorites need a quick refresh" description="Search those live recipes again and open their detail pages to restore full cards." action={{ label: 'Explore Again', onClick: () => navigate('explore') }} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} dark={dark} onClick={() => navigate('recipeDetail', { id: recipe.id })} actionLabel="Remove" actionIcon={X} onAction={() => remove(recipe.id)} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

type ToastFn = (type: ToastMessage['type'], title: string, message: string, duration?: number) => string;

function MealPlannerPage({ navigate, addToast }: { navigate: Navigate; addToast: ToastFn }) {
  const { dark } = useTheme();
  const { userStorageKey } = useAuth();
  const [slots, setSlots] = useLocalStorage<MealSlot[]>(userStorageKey('mealPlans'), createEmptyMealSlots());
  const [favorites] = useLocalStorage<string[]>(userStorageKey('favorites'), []);
  const [savedRecipes] = useLocalStorage<Recipe[]>(userStorageKey('savedRecipes'), []);
  const [, setShoppingList] = useLocalStorage<ShoppingItem[]>(userStorageKey('shoppingList'), []);

  const recipeOptions = useMemo(() => {
    const savedFavorites = savedRecipes.filter((recipe) => favorites.includes(recipe.id));
    const fallbackFavorites = FALLBACK_RECIPES.filter((recipe) => favorites.includes(recipe.id));
    const favoriteRecipes = mergeRecipesById(savedFavorites, fallbackFavorites);
    return favoriteRecipes.length ? favoriteRecipes : mergeRecipesById(savedRecipes, FALLBACK_RECIPES);
  }, [favorites, savedRecipes]);

  useEffect(() => {
    if (!slots.length) setSlots(createEmptyMealSlots());
  }, [slots.length, setSlots]);

  const updateSlot = (day: string, mealType: MealSlot['mealType'], recipeId: string) => {
    const recipe = recipeOptions.find((item) => item.id === recipeId) || findRecipeById(recipeId, savedRecipes);
    setSlots((prev) => {
      const base = prev.length ? prev : createEmptyMealSlots();
      return base.map((slot) => slot.day === day && slot.mealType === mealType ? { ...slot, recipeId: recipe?.id || null, recipeName: recipe?.name || '' } : slot);
    });
  };

  const clearPlan = () => {
    setSlots(createEmptyMealSlots());
    addToast('guidance', 'Meal plan cleared', 'All weekly slots are empty now.');
  };

  const generateShoppingList = () => {
    const plannedRecipeIds = slots.map((slot) => slot.recipeId).filter(Boolean) as string[];
    const recipes = plannedRecipeIds.map((id) => findRecipeById(id, mergeRecipesById(savedRecipes, recipeOptions))).filter((recipe): recipe is Recipe => recipe !== null);
    const items: ShoppingItem[] = [];
    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        if (!items.some((item) => item.name.toLowerCase() === ingredient.ingredient.toLowerCase())) {
          items.push({ id: `${Date.now()}-${Math.random()}`, name: ingredient.ingredient, quantity: ingredient.measure || '1', category: recipe.category, checked: false });
        }
      });
    });
    setShoppingList(items);
    addToast('success', 'Shopping list generated', `${items.length} ingredients were added from your weekly plan.`);
    navigate('shoppingList');
  };

  return (
    <PageShell>
      <div className="content-container py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <SectionTitle eyebrow="Weekly planner" title="Meal Planner" subtitle="Assign breakfast, lunch and dinner for each day. Favorites and recent live recipes appear first." />
          <div className="flex gap-2">
            <button onClick={clearPlan} className={`px-4 py-2.5 rounded-btn border font-medium ${dark ? 'border-[#4A3828] text-[#FFF3E0]' : 'border-[#E8D5C0] text-espresso'}`}>Clear</button>
            <button onClick={generateShoppingList} className="px-4 py-2.5 rounded-btn bg-tomato text-white font-medium hover:bg-[#B83A20]">Generate shopping list</button>
          </div>
        </div>
        <div className={`rounded-card border p-4 mb-5 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className={`text-sm ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>Available recipes: {recipeOptions.length}. Save live recipes from detail pages to use them in your plan.</p>
            <button onClick={() => navigate('explore')} className="px-4 py-2 rounded-btn bg-olive text-white text-sm font-semibold">Find more recipes</button>
          </div>
        </div>
        <div className="grid gap-4">
          {DAYS.map((day) => (
            <div key={day} className={`rounded-card border p-4 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
              <h3 className={`font-bold mb-3 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{day}</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {MEALS.map((meal) => {
                  const slot = slots.find((item) => item.day === day && item.mealType === meal);
                  return (
                    <label key={meal} className="block">
                      <span className="text-xs uppercase tracking-wide text-tomato font-bold">{meal}</span>
                      <select value={slot?.recipeId || ''} onChange={(e) => updateSlot(day, meal, e.target.value)} className={`mt-1 w-full px-3 py-2.5 rounded-btn border text-sm ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso'}`}>
                        <option value="">Choose recipe...</option>
                        {recipeOptions.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}
                      </select>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function ShoppingListPage({ addToast }: { addToast: ToastFn }) {
  const { dark } = useTheme();
  const { userStorageKey } = useAuth();
  const [items, setItems] = useLocalStorage<ShoppingItem[]>(userStorageKey('shoppingList'), []);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('General');
  const [showAll, setShowAll] = useState(false);

  const addItem = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return addToast('error', 'Missing item', 'Please write an ingredient or grocery name.');
    setItems((prev) => [...prev, { id: Date.now().toString(36), name: name.trim(), quantity: quantity.trim() || '1', category: category.trim() || 'General', checked: false }]);
    setName('');
    setQuantity('');
    setCategory('General');
  };

  const toggle = (id: string) => setItems((prev) => prev.map((item) => item.id === id ? { ...item, checked: !item.checked } : item));
  const remove = (ids: string[]) => setItems((prev) => prev.filter((item) => !ids.includes(item.id)));

  return (
    <PageShell>
      <div className="content-container py-10">
        <SectionTitle eyebrow="Groceries" title="Shopping List" subtitle="Add ingredients manually or generate them from your meal planner." />
        <form onSubmit={addItem} className={`rounded-card border p-4 mb-6 grid md:grid-cols-[1fr_160px_160px_auto] gap-3 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingredient name" className={`px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso'}`} />
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty" className={`px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso'}`} />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className={`px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso'}`} />
          <button type="submit" className="px-5 py-3 rounded-btn bg-tomato text-white font-semibold hover:bg-[#B83A20]"><Plus className="w-4 h-4 inline mr-1" /> Add</button>
        </form>
        {items.length === 0 ? <EmptyState icon={ShoppingCart} title="List is empty" description="Add items or generate a list from your meal plan." /> : (
          <div className={`rounded-card border divide-y ${dark ? 'bg-[#2A2218] border-[#4A3828] divide-[#4A3828]' : 'bg-white border-[#E8D5C0] divide-[#E8D5C0]'}`}>
            {items.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-4">
                <button onClick={() => toggle(item.id)} className={`w-6 h-6 rounded border flex items-center justify-center ${item.checked ? 'bg-olive border-olive text-white' : dark ? 'border-[#4A3828]' : 'border-[#E8D5C0]'}`}>{item.checked && <Check className="w-4 h-4" />}</button>
                <div className="flex-1">
                  <p className={`font-medium ${item.checked ? 'line-through opacity-60' : ''} ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{item.name}</p>
                  <p className={`text-xs ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{item.quantity} • {item.category}</p>
                </div>
                <button onClick={() => remove([item.id])} className="p-2 rounded-btn text-tomato hover:bg-tomato/10"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
        {items.length > 8 && <button onClick={() => setShowAll(true)} className="mt-4 px-5 py-2.5 rounded-btn bg-olive text-white font-medium">View all items</button>}
        {showAll && <ViewAllModal title="All shopping items" items={items} getId={(item) => item.id} onClose={() => setShowAll(false)} onDelete={remove} searchFn={(item, q) => item.name.toLowerCase().includes(q.toLowerCase()) || item.category.toLowerCase().includes(q.toLowerCase())} renderItem={(item) => <div><p className={`font-medium ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{item.name}</p><p className={`text-xs ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{item.quantity} • {item.category}</p></div>} />}
      </div>
    </PageShell>
  );
}

function PantryMatchPage({ navigate, addToast }: { navigate: Navigate; addToast: ToastFn }) {
  const { dark } = useTheme();
  const { userStorageKey } = useAuth();
  const [pantry, setPantry] = useLocalStorage<PantryItem[]>(userStorageKey('pantry'), []);
  const [savedRecipes] = useLocalStorage<Recipe[]>(userStorageKey('savedRecipes'), []);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const recipePool = useMemo(() => mergeRecipesById(savedRecipes, FALLBACK_RECIPES), [savedRecipes]);
  const starterItems = ['chicken', 'rice', 'tomato', 'eggs', 'pasta'];

  const matches = useMemo(() => {
    const pantryNames = pantry.map((item) => item.name.toLowerCase());
    return recipePool.map((recipe) => {
      const matched = recipe.ingredients.filter((ingredient) => pantryNames.some((itemName) => ingredient.ingredient.toLowerCase().includes(itemName) || itemName.includes(ingredient.ingredient.toLowerCase())));
      return { recipe, matchedCount: matched.length };
    }).filter((item) => item.matchedCount > 0).sort((a, b) => b.matchedCount - a.matchedCount);
  }, [pantry, recipePool]);

  const addPantry = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return addToast('error', 'Missing ingredient', 'Add at least one pantry item.');
    setPantry((prev) => [...prev, { id: Date.now().toString(36), name: name.trim(), quantity: quantity.trim() || 'Available' }]);
    setName('');
    setQuantity('');
  };

  const addStarter = (itemName: string) => {
    if (pantry.some((item) => item.name.toLowerCase() === itemName.toLowerCase())) return;
    setPantry((prev) => [...prev, { id: Date.now().toString(36) + itemName, name: itemName, quantity: 'Available' }]);
  };

  return (
    <PageShell>
      <div className="content-container py-10">
        <SectionTitle eyebrow="Smart pantry" title="Pantry Match" subtitle="Tell Savoria what you already have and discover recipes you can start now." />
        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <div className={`pantry-sticky-panel rounded-card border p-5 h-fit ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
            <form onSubmit={addPantry} className="space-y-3 mb-5">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. chicken" className={`w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso'}`} />
              <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="quantity optional" className={`w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso'}`} />
              <button className="w-full px-4 py-3 rounded-btn bg-tomato text-white font-semibold"><Plus className="w-4 h-4 inline mr-1" /> Add to pantry</button>
            </form>
            <p className={`text-xs font-semibold mb-2 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>Quick add</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {starterItems.map((item) => <button key={item} onClick={() => addStarter(item)} className={`px-3 py-1.5 rounded-full text-xs border ${dark ? 'border-[#4A3828] text-[#C4A882]' : 'border-[#E8D5C0] text-[#8B7355]'}`}>+ {item}</button>)}
            </div>
            <div className="flex flex-wrap gap-2">
              {pantry.map((item) => <span key={item.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${dark ? 'bg-[#1A1410] text-[#FFF3E0]' : 'bg-[#FFF3E0] text-espresso'}`}>{item.name}<button onClick={() => setPantry((prev) => prev.filter((p) => p.id !== item.id))}><X className="w-3 h-3" /></button></span>)}
            </div>
          </div>
          <div>
            {matches.length === 0 ? <EmptyState icon={Lightbulb} title="No matches yet" description="Add pantry ingredients like chicken, tomato, pasta, rice, butter or eggs. Favorite and recent live recipes are included too." /> : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {matches.map(({ recipe, matchedCount }) => <RecipeCard key={recipe.id} recipe={{ ...recipe, tags: [`${matchedCount} pantry matches`, ...recipe.tags] }} dark={dark} onClick={() => navigate('recipeDetail', { id: recipe.id })} actionLabel="Cook this" actionIcon={ArrowRight} onAction={() => navigate('recipeDetail', { id: recipe.id })} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function RandomRecipePage({ navigate, addToast }: { navigate: Navigate; addToast: ToastFn }) {
  const { dark } = useTheme();
  const { userStorageKey } = useAuth();
  const { getRandom } = useRecipeApi();
  const [recipe, setRecipe] = useState<Recipe | null>(FALLBACK_RECIPES[0]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useLocalStorage<CookedHistoryItem[]>(userStorageKey('randomHistory'), []);
  const [, setSavedRecipes] = useLocalStorage<Recipe[]>(userStorageKey('savedRecipes'), []);

  const spin = async () => {
    setLoading(true);
    const result = await getRandom();
    const fallback = FALLBACK_RECIPES[Math.floor(Math.random() * FALLBACK_RECIPES.length)];
    const next = result || fallback;
    setRecipe(next);
    setSavedRecipes((prev) => upsertRecipe(prev, next));
    setHistory((prev) => [{ id: Date.now().toString(36), recipeId: next.id, recipeName: next.name, cookedAt: new Date().toISOString() }, ...prev].slice(0, 12));
    setLoading(false);
    addToast('success', 'Recipe picked', `${next.name} is ready to explore.`);
  };

  return (
    <PageShell>
      <div className="content-container py-10">
        <SectionTitle eyebrow="Surprise me" title="Random Recipe Spinner" subtitle="Spin when you do not know what to cook. Live spins are ready for planning and cooking mode." />
        <div className="grid lg:grid-cols-[minmax(0,420px)_320px] gap-6 justify-center">
          <div className={`rounded-card border p-4 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
            {recipe && <RecipeCard recipe={recipe} dark={dark} onClick={() => navigate('recipeDetail', { id: recipe.id })} actionLabel="View Recipe" actionIcon={ArrowRight} onAction={() => navigate('recipeDetail', { id: recipe.id })} />}
            <button onClick={spin} disabled={loading} className="mt-5 w-full px-5 py-3 rounded-btn bg-tomato text-white font-semibold hover:bg-[#B83A20] disabled:opacity-60"><Shuffle className="w-4 h-4 inline mr-2" />{loading ? 'Spinning...' : 'Spin new recipe'}</button>
          </div>
          <div className={`rounded-card border p-5 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
            <h3 className={`font-bold mb-3 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Recent spins</h3>
            {history.length === 0 ? <p className={`text-sm ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>No spins yet.</p> : history.map((item) => <button key={item.id} onClick={() => navigate('recipeDetail', { id: item.recipeId })} className={`w-full text-left py-2 border-b last:border-b-0 text-sm ${dark ? 'border-[#4A3828] text-[#C4A882]' : 'border-[#E8D5C0] text-[#8B7355]'}`}>{item.recipeName}</button>)}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function CookingModePage({ navigate, addToast }: { navigate: Navigate; addToast: ToastFn }) {
  const { dark } = useTheme();
  const { userStorageKey } = useAuth();
  const [savedRecipes] = useLocalStorage<Recipe[]>(userStorageKey('savedRecipes'), []);
  const [favoriteIds] = useLocalStorage<string[]>(userStorageKey('favorites'), []);
  const [slots] = useLocalStorage<MealSlot[]>(userStorageKey('mealPlans'), createEmptyMealSlots());
  const [cookedHistory, setCookedHistory] = useLocalStorage<CookedHistoryItem[]>(userStorageKey('cookedHistory'), []);
  const favoriteRecipes = mergeRecipesById(savedRecipes.filter((recipe) => favoriteIds.includes(recipe.id)), FALLBACK_RECIPES.filter((recipe) => favoriteIds.includes(recipe.id)));
  const plannedRecipes = slots.map((slot) => findRecipeById(slot.recipeId, savedRecipes)).filter((recipe): recipe is Recipe => recipe !== null);
  const recipeOptions = mergeRecipesById(favoriteRecipes, plannedRecipes, savedRecipes, FALLBACK_RECIPES);
  const [selectedId, setSelectedId] = useState(recipeOptions[0]?.id || FALLBACK_RECIPES[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const { seconds, isRunning, start, pause, resume, reset, formatTime } = useTimer();
  const recipe = findRecipeById(selectedId, recipeOptions) || recipeOptions[0] || FALLBACK_RECIPES[0];
  const steps = splitInstructionSteps(recipe.instructions);

  useEffect(() => {
    if (!recipeOptions.some((item) => item.id === selectedId)) {
      setSelectedId(recipeOptions[0]?.id || FALLBACK_RECIPES[0].id);
      setStepIndex(0);
    }
  }, [recipeOptions, selectedId]);

  const finish = () => {
    const cooked: CookedHistoryItem = { id: Date.now().toString(36), recipeId: recipe.id, recipeName: recipe.name, cookedAt: new Date().toISOString() };
    setCookedHistory((prev) => [cooked, ...prev].slice(0, 20));
    addToast('success', 'Dish completed', `${recipe.name} added to cooked history.`);
  };

  return (
    <PageShell>
      <div className="content-container py-10">
        <SectionTitle eyebrow="Focus cooking" title="Cooking Mode" subtitle="Follow clean recipe steps with timer controls. Favorites, planned meals, recent live recipes and fallback recipes are supported." />
        <div className={`rounded-card border p-5 mb-6 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
          <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setStepIndex(0); }} className={`w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso'}`}>
            {recipeOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          {cookedHistory.length > 0 && <p className={`text-xs mt-3 ${dark ? 'text-[#8B7355]' : 'text-[#A48A6B]'}`}>Cooked history: {cookedHistory.length} recent dish{cookedHistory.length === 1 ? '' : 'es'}.</p>}
        </div>
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className={`rounded-card border p-6 min-h-[320px] ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
            <div className="flex items-center justify-between mb-5">
              <span className="text-tomato font-bold">Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}</span>
              <button onClick={() => navigate('recipeDetail', { id: recipe.id })} className="text-sm text-tomato font-semibold">Full recipe</button>
            </div>
            <p className={`text-xl leading-relaxed ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{steps[stepIndex] || steps[0]}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button disabled={stepIndex === 0} onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))} className={`px-5 py-2.5 rounded-btn border disabled:opacity-40 ${dark ? 'border-[#4A3828] text-[#FFF3E0]' : 'border-[#E8D5C0] text-espresso'}`}>Previous</button>
              <button disabled={stepIndex === steps.length - 1} onClick={() => setStepIndex((prev) => Math.min(steps.length - 1, prev + 1))} className="px-5 py-2.5 rounded-btn bg-tomato text-white disabled:opacity-40">Next</button>
              <button onClick={finish} className="px-5 py-2.5 rounded-btn bg-olive text-white">Mark cooked</button>
            </div>
          </div>
          <div className={`rounded-card border p-6 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
            <Timer className="w-8 h-8 text-tomato mb-3" />
            <h3 className={`font-bold mb-4 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Kitchen Timer</h3>
            <div className={`text-4xl font-bold mb-5 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{formatTime(seconds)}</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[5, 10, 15, 30].map((minute) => <button key={minute} onClick={() => start(minute * 60)} className={`px-3 py-2 rounded-btn border ${dark ? 'border-[#4A3828] text-[#C4A882]' : 'border-[#E8D5C0] text-[#8B7355]'}`}>{minute} min</button>)}
            </div>
            <div className="flex gap-2">
              <button onClick={isRunning ? pause : resume} className="flex-1 px-3 py-2 rounded-btn bg-honey text-espresso font-semibold">{isRunning ? 'Pause' : 'Resume'}</button>
              <button onClick={reset} className="flex-1 px-3 py-2 rounded-btn bg-tomato text-white font-semibold">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function NutritionPage() {
  const { dark } = useTheme();
  return (
    <PageShell>
      <div className="content-container py-10">
        <SectionTitle eyebrow="Better choices" title="Nutrition Guide" subtitle="Practical, simple guidance to make daily meals more balanced." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {NUTRITION_TIPS.map((tip) => <div key={tip.id} className={`rounded-card border p-5 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}><Apple className="w-7 h-7 text-tomato mb-3" /><h3 className={`font-bold mb-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{tip.title}</h3><p className={`text-sm ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{tip.content}</p></div>)}
        </div>
      </div>
    </PageShell>
  );
}

function KitchenNotesPage({ addToast }: { addToast: ToastFn }) {
  const { dark } = useTheme();
  const { userStorageKey } = useAuth();
  const [notes, setNotes] = useLocalStorage<KitchenNote[]>(userStorageKey('notes'), []);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  const addNote = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return addToast('error', 'Incomplete note', 'Please add a title and details.');
    setNotes((prev) => [{ id: Date.now().toString(36), title: title.trim(), content: content.trim(), rating, createdAt: new Date().toISOString() }, ...prev]);
    setTitle('');
    setContent('');
    setRating(5);
    addToast('success', 'Note saved', 'Your kitchen note has been saved.');
  };

  return (
    <PageShell>
      <div className="content-container py-10">
        <SectionTitle eyebrow="Cooking memory" title="Kitchen Notes" subtitle="Save recipe tweaks, family feedback, and ideas for next time." />
        <form onSubmit={addNote} className={`rounded-card border p-5 mb-6 grid md:grid-cols-[1fr_120px_auto] gap-3 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
          <div className="space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" className={`w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso'}`} />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What changed? What worked?" rows={3} className={`w-full px-4 py-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso'}`} />
          </div>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className={`h-12 px-3 rounded-btn border ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0]' : 'bg-[#FFF8F0] border-[#E8D5C0] text-espresso'}`}>{[1, 2, 3, 4, 5].map((num) => <option key={num} value={num}>{num} stars</option>)}</select>
          <button className="h-12 px-5 rounded-btn bg-tomato text-white font-semibold">Save note</button>
        </form>
        {notes.length === 0 ? <EmptyState icon={NotebookPen} title="No notes yet" description="Write a note after cooking to remember what to improve." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => <div key={note.id} className={`rounded-card border p-5 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}><div className="flex justify-between gap-3"><h3 className={`font-bold ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{note.title}</h3><button onClick={() => setNotes((prev) => prev.filter((item) => item.id !== note.id))} className="text-tomato"><Trash2 className="w-4 h-4" /></button></div><div className="flex gap-1 my-3">{Array.from({ length: note.rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-honey fill-current" />)}</div><p className={`text-sm ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{note.content}</p></div>)}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function SettingsPage({ navigate, addToast }: { navigate: Navigate; addToast: ToastFn }) {
  const { dark, toggle } = useTheme();
  const { user, logout, resetUserAppData } = useAuth();
  const [confirmReset, setConfirmReset] = useState(false);

  const clearAppData = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      addToast('warning', 'Confirm reset', 'Click Confirm reset to clear this account\'s kitchen data.');
      return;
    }
    resetUserAppData();
    setConfirmReset(false);
  };

  return (
    <PageShell>
      <div className="content-container py-10">
        <SectionTitle eyebrow="Control center" title="Settings" subtitle="Manage theme, profile and local demo data." />
        <div className="grid md:grid-cols-2 gap-5">
          <div className={`rounded-card border p-6 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
            <SettingsIcon className="w-8 h-8 text-tomato mb-3" />
            <h3 className={`font-bold mb-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Appearance</h3>
            <p className={`text-sm mb-4 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>Switch between cozy light mode and deep kitchen mode.</p>
            <button onClick={toggle} className="px-5 py-3 rounded-btn bg-tomato text-white font-semibold">Switch theme</button>
          </div>
          <div className={`rounded-card border p-6 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
            <ShieldCheck className="w-8 h-8 text-olive mb-3" />
            <h3 className={`font-bold mb-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Account</h3>
            <p className={`text-sm mb-4 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>Logged in as {user?.email}. This account has its own favorites, planner, pantry, notes and shopping list.</p>
            <div className="flex flex-wrap gap-2"><button onClick={() => navigate('profileSetup')} className="px-5 py-3 rounded-btn bg-olive text-white font-semibold">Edit profile</button><button onClick={() => { logout(); navigate('home'); }} className="px-5 py-3 rounded-btn bg-tomato text-white font-semibold">Logout</button></div>
          </div>
          <div className={`rounded-card border p-6 md:col-span-2 ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
            <Trash2 className="w-8 h-8 text-tomato mb-3" />
            <h3 className={`font-bold mb-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>Reset kitchen data</h3>
            <p className={`text-sm mb-4 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>This clears favorites, recent live recipes, meal plans, pantry items, notes, cooked history and shopping list for the current account only. Your login and profile stay available.</p>
            {confirmReset && <div className="mb-4 rounded-btn border border-tomato/40 bg-tomato/10 px-4 py-3 text-sm text-tomato">Are you sure? This cannot be undone.</div>}
            <div className="flex flex-wrap gap-2">
              <button onClick={clearAppData} className={`px-5 py-3 rounded-btn font-semibold transition-all ${confirmReset ? 'bg-tomato text-white' : 'border border-tomato text-tomato hover:bg-tomato hover:text-white'}`}>{confirmReset ? 'Confirm reset' : 'Clear app data'}</button>
              {confirmReset && <button onClick={() => setConfirmReset(false)} className={`px-5 py-3 rounded-btn border font-semibold ${dark ? 'border-[#4A3828] text-[#FFF3E0]' : 'border-[#E8D5C0] text-espresso'}`}>Cancel</button>}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function LockedPage({ navigate }: { navigate: Navigate }) {
  return (
    <PageShell>
      <div className="content-container py-16">
        <EmptyState icon={ShieldCheck} title="Login required" description="Please log in or sign up to use this Savoria feature." action={{ label: 'Login', onClick: () => navigate('login') }} />
      </div>
    </PageShell>
  );
}


function AppRouter({ toasts, addToast, removeToast }: { toasts: ToastMessage[]; addToast: ToastFn; removeToast: (id: string) => void }) {
  const [route, setRoute] = useState(hashToRoute);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onHashChange = () => setRoute(hashToRoute());
    window.addEventListener('hashchange', onHashChange);
    if (!window.location.hash) window.history.replaceState(null, '', routeToHash('home'));
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate: Navigate = (page, params = {}) => {
    window.location.hash = routeToHash(page, params);
    setRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const page = PRIVATE_PAGES.has(route.page) && !isAuthenticated ? 'login' : route.page;

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage navigate={navigate} />;
      case 'explore': return <ExplorePage navigate={navigate} />;
      case 'recipeDetail': return <RecipeDetailPage recipeId={route.params.id || 'fb-1'} navigate={navigate} addToast={addToast} />;
      case 'mealPlanPreview': return <MealPlanPreviewPage navigate={navigate} />;
      case 'login': return <LoginPage navigate={navigate} />;
      case 'signup': return <SignupPage navigate={navigate} />;
      case 'dashboard': return <DashboardPage navigate={navigate} />;
      case 'profileSetup': return <ProfileSetupPage navigate={navigate} />;
      case 'favorites': return <FavoritesPage navigate={navigate} addToast={addToast} />;
      case 'mealPlanner': return <MealPlannerPage navigate={navigate} addToast={addToast} />;
      case 'shoppingList': return <ShoppingListPage addToast={addToast} />;
      case 'pantryMatch': return <PantryMatchPage navigate={navigate} addToast={addToast} />;
      case 'randomRecipe': return <RandomRecipePage navigate={navigate} addToast={addToast} />;
      case 'cookingMode': return <CookingModePage navigate={navigate} addToast={addToast} />;
      case 'nutrition': return <NutritionPage />;
      case 'kitchenNotes': return <KitchenNotesPage addToast={addToast} />;
      case 'settings': return <SettingsPage navigate={navigate} addToast={addToast} />;
      default: return <LockedPage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CustomCursor />
      <Navbar currentPage={page} navigate={navigate} />
      <div className="flex-1">{renderPage()}</div>
      <Footer />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function AppProviders() {
  const { toasts, addToast, removeToast } = useToast();
  return (
    <ThemeProvider>
      <AuthProvider addToast={addToast}>
        <AppRouter toasts={toasts} addToast={addToast} removeToast={removeToast} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return <AppProviders />;
}
