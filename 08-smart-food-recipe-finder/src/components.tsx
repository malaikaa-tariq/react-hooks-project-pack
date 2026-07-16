// ===== SAVORIA SHARED COMPONENTS =====

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import {
  Search, Menu, X, ChefHat, Heart, CalendarDays, ShoppingCart, Lightbulb,
  Shuffle, CookingPot, Apple, StickyNote, Settings, LogOut, LogIn, UserPlus,
  Home, Compass, Sun, Moon, ChevronLeft, ChevronRight, Clock, Trash2, Check,
  Square, CheckSquare, MoreHorizontal, type LucideIcon,
} from 'lucide-react';
import {
  useAuth, useTheme,
} from './contexts';
import type { PageName, Recipe, ToastMessage } from './types';

// ===== NAVBAR =====
export function Navbar({ currentPage, navigate }: { currentPage: PageName; navigate: (p: PageName, params?: Record<string, string>) => void }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const publicLinks: { label: string; page: PageName; icon: LucideIcon }[] = [
    { label: 'Home', page: 'home', icon: Home },
    { label: 'Explore', page: 'explore', icon: Compass },
    { label: 'Meal Plan', page: 'mealPlanPreview', icon: CalendarDays },
  ];

  const privatePrimaryLinks: { label: string; page: PageName; icon: LucideIcon }[] = [
    { label: 'Dashboard', page: 'dashboard', icon: ChefHat },
    { label: 'Explore', page: 'explore', icon: Compass },
    { label: 'Favorites', page: 'favorites', icon: Heart },
    { label: 'Planner', page: 'mealPlanner', icon: CalendarDays },
    { label: 'List', page: 'shoppingList', icon: ShoppingCart },
  ];

  const privateMoreLinks: { label: string; page: PageName; icon: LucideIcon }[] = [
    { label: 'Pantry Match', page: 'pantryMatch', icon: Lightbulb },
    { label: 'Random Recipe', page: 'randomRecipe', icon: Shuffle },
    { label: 'Cooking Mode', page: 'cookingMode', icon: CookingPot },
    { label: 'Nutrition', page: 'nutrition', icon: Apple },
    { label: 'Kitchen Notes', page: 'kitchenNotes', icon: StickyNote },
    { label: 'Settings', page: 'settings', icon: Settings },
  ];

  const mobileLinks = isAuthenticated ? [...privatePrimaryLinks, ...privateMoreLinks] : publicLinks;
  const isActive = (p: PageName) => currentPage === p || (p === 'mealPlanner' && currentPage === 'mealPlanner') || (p === 'mealPlanPreview' && currentPage === 'mealPlanPreview');
  const moreActive = privateMoreLinks.some((link) => isActive(link.page));

  const handleNav = (page: PageName) => {
    navigate(page);
    setMobileOpen(false);
    setProfileOpen(false);
    setMoreOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-40 border-b ${dark ? 'bg-[#1A1410] border-[#4A3828]' : 'bg-[#FFF3E0] border-[#E8D5C0]'} transition-colors`}>
      <div className="content-container flex items-center justify-between h-16 gap-3">
        <button onClick={() => handleNav('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer shrink-0">
          <ChefHat className="w-7 h-7 text-tomato" />
          <span className={`text-xl font-bold ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>
            Savoria
          </span>
        </button>

        <div className="hidden xl:flex items-center justify-center gap-1 flex-1 min-w-0">
          {(isAuthenticated ? privatePrimaryLinks : publicLinks).map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-btn text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap
                ${isActive(link.page) ? 'bg-tomato text-white shadow-sm' : `${dark ? 'text-[#C4A882] hover:text-[#FFF3E0] hover:bg-[#2A2218]' : 'text-[#8B7355] hover:text-espresso hover:bg-[#F5E0C8]'}`}`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </button>
          ))}

          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => { setMoreOpen((prev) => !prev); setProfileOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-btn text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${moreActive ? 'bg-tomato text-white shadow-sm' : `${dark ? 'text-[#C4A882] hover:text-[#FFF3E0] hover:bg-[#2A2218]' : 'text-[#8B7355] hover:text-espresso hover:bg-[#F5E0C8]'}`}`}
              >
                <MoreHorizontal className="w-4 h-4" /> More
              </button>
              {moreOpen && (
                <div className={`absolute left-0 top-full mt-2 w-56 rounded-card shadow-lg py-2 z-50 border animate-scale-in ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
                  {privateMoreLinks.map((link) => (
                    <button key={link.page} onClick={() => handleNav(link.page)} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 cursor-pointer ${isActive(link.page) ? 'text-tomato font-semibold' : dark ? 'text-[#C4A882] hover:bg-[#1A1410]' : 'text-[#8B7355] hover:bg-[#FFF3E0]'}`}>
                      <link.icon className="w-4 h-4" /> {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={toggle} className={`p-2 rounded-btn transition-colors cursor-pointer ${dark ? 'text-honey hover:bg-[#2A2218]' : 'text-espresso hover:bg-[#F5E0C8]'}`} aria-label="Toggle theme">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {!isAuthenticated ? (
            <div className="hidden xl:flex items-center gap-2">
              <button onClick={() => handleNav('login')} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-btn border transition-all duration-200 cursor-pointer hover:scale-[0.97] active:scale-[0.97] border-espresso text-espresso dark:border-[#C4A882] dark:text-[#C4A882] hover:bg-espresso hover:text-white dark:hover:bg-[#C4A882] dark:hover:text-[#1A1410]">
                <LogIn className="w-4 h-4" /> Login
              </button>
              <button onClick={() => handleNav('signup')} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-btn bg-tomato text-white transition-all duration-200 cursor-pointer hover:bg-[#B83A20] hover:scale-[0.97] active:scale-[0.97]">
                <UserPlus className="w-4 h-4" /> Sign Up
              </button>
            </div>
          ) : (
            <div className="hidden xl:block relative">
              <button onClick={() => { setProfileOpen(!profileOpen); setMoreOpen(false); }} className="flex items-center gap-2 px-3 py-2 rounded-btn transition-colors cursor-pointer hover:bg-[#F5E0C8] dark:hover:bg-[#2A2218]">
                <div className="w-8 h-8 rounded-full bg-olive flex items-center justify-center text-white text-sm font-bold">{user?.fullName?.[0]?.toUpperCase() || '?'}</div>
                <span className={`text-sm font-medium max-w-[120px] truncate ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{user?.fullName}</span>
              </button>
              {profileOpen && (
                <div className={`absolute right-0 top-full mt-2 w-56 rounded-card shadow-lg py-2 z-50 border animate-scale-in ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
                  <div className={`px-4 py-2 border-b mb-1 ${dark ? 'border-[#4A3828]' : 'border-[#E8D5C0]'}`}>
                    <p className={`text-sm font-semibold truncate ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{user?.fullName}</p>
                    <p className={`text-xs truncate ${dark ? 'text-[#8B7355]' : 'text-[#C4A882]'}`}>{user?.email}</p>
                  </div>
                  <button onClick={() => handleNav('settings')} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer ${dark ? 'text-[#C4A882] hover:bg-[#1A1410]' : 'text-[#8B7355] hover:bg-[#FFF3E0]'}`}><Settings className="w-4 h-4" /> Settings</button>
                  <button onClick={() => { logout(); handleNav('home'); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer ${dark ? 'text-tomato-light hover:bg-[#1A1410]' : 'text-tomato hover:bg-[#FFF3E0]'}`}><LogOut className="w-4 h-4" /> Logout</button>
                </div>
              )}
            </div>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className={`xl:hidden p-2 rounded-btn cursor-pointer ${dark ? 'text-[#C4A882]' : 'text-espresso'}`} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`xl:hidden border-t animate-slide-down ${dark ? 'bg-[#1A1410] border-[#4A3828]' : 'bg-[#FFF3E0] border-[#E8D5C0]'}`}>
          <div className="content-container py-3 flex flex-col gap-1">
            {isAuthenticated && (
              <div className={`px-3 py-3 rounded-card mb-1 ${dark ? 'bg-[#2A2218]' : 'bg-white'}`}>
                <p className={`text-sm font-semibold ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>{user?.fullName}</p>
                <p className={`text-xs ${dark ? 'text-[#8B7355]' : 'text-[#C4A882]'}`}>{user?.email}</p>
              </div>
            )}
            {mobileLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-btn text-sm font-medium transition-all duration-200 cursor-pointer
                  ${isActive(link.page) ? 'bg-tomato text-white' : `${dark ? 'text-[#C4A882] hover:bg-[#2A2218]' : 'text-[#8B7355] hover:bg-[#F5E0C8]'}`}`}
              >
                <link.icon className="w-4 h-4" /> {link.label}
              </button>
            ))}
            {!isAuthenticated ? (
              <div className="flex gap-2 pt-2 border-t mt-1 border-[#E8D5C0] dark:border-[#4A3828]">
                <button onClick={() => handleNav('login')} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-btn border border-espresso text-espresso dark:border-[#C4A882] dark:text-[#C4A882] transition-all duration-200 cursor-pointer">Login</button>
                <button onClick={() => handleNav('signup')} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-btn bg-tomato text-white transition-all duration-200 cursor-pointer">Sign Up</button>
              </div>
            ) : (
              <button onClick={() => { logout(); handleNav('home'); setMobileOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 rounded-btn text-sm font-medium text-tomato cursor-pointer hover:bg-[#F5E0C8] dark:hover:bg-[#2A2218]">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// ===== TOAST CONTAINER =====
export function ToastContainer({ toasts, removeToast }: { toasts: ToastMessage[]; removeToast: (id: string) => void }) {
  const { dark } = useTheme();
  if (toasts.length === 0) return null;

  const typeStyles: Record<ToastMessage['type'], { bg: string; border: string; icon: LucideIcon }> = {
    success: { bg: dark ? 'bg-[#2A3A28]' : 'bg-[#E8F5E9]', border: 'border-olive', icon: Check },
    error: { bg: dark ? 'bg-[#3A1A1A]' : 'bg-[#FFEBEE]', border: 'border-tomato', icon: X },
    warning: { bg: dark ? 'bg-[#3A2A18]' : 'bg-[#FFF8E1]', border: 'border-honey', icon: Clock },
    guidance: { bg: dark ? 'bg-[#1A2A3A]' : 'bg-[#E3F2FD]', border: 'border-[#5C4033]', icon: Lightbulb },
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-3 max-w-md w-[calc(100%-2rem)] pointer-events-none">
      {toasts.map((toast) => {
        const style = typeStyles[toast.type];
        const Icon = style.icon;
        return (
          <div key={toast.id} className={`toast-popup pointer-events-auto animate-slide-down border p-4 shadow-toast ${style.bg} ${style.border} ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`}>
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{toast.title}</p>
                <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 p-0.5 rounded hover:opacity-70 cursor-pointer" aria-label="Close notification">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== VIEW ALL MODAL =====
interface ViewAllModalProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onDelete: (ids: string[]) => void;
  getId: (item: T) => string;
  onClose: () => void;
  searchPlaceholder?: string;
  searchFn?: (item: T, query: string) => boolean;
  emptyMessage?: string;
}

export function ViewAllModal<T>({ title, items, renderItem, onDelete, getId, onClose, searchPlaceholder = 'Search...', searchFn, emptyMessage = 'Nothing here yet.' }: ViewAllModalProps<T>) {
  const { dark } = useTheme();
  // useState
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const filtered = search && searchFn ? items.filter((item) => searchFn(item, search)) : items;
  const allSelected = filtered.length > 0 && filtered.every((item) => selected.has(getId(item)));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(getId)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = () => {
    if (selected.size === 0) return;
    onDelete(Array.from(selected));
    setSelected(new Set());
  };

  // Close on Escape
  useEffect(() => { // useEffect
    const handler = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={onClose}>
      <div className={`w-full max-w-2xl max-h-[80vh] rounded-modal shadow-2xl flex flex-col animate-scale-in ${dark ? 'bg-[#2A2218]' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${dark ? 'border-[#4A3828]' : 'border-[#E8D5C0]'}`}>
          <h2 className={`text-lg font-bold ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>{title}</h2>
          <button onClick={onClose} className={`p-1 rounded-btn hover:bg-[#F5E0C8] dark:hover:bg-[#1A1410] transition-colors cursor-pointer`} aria-label="Close modal"><X className="w-5 h-5" /></button>
        </div>

        {/* Search */}
        {searchFn && (
          <div className="px-4 pt-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchPlaceholder} className={`w-full pl-9 pr-4 py-2 rounded-btn border text-sm transition-colors ${dark ? 'bg-[#1A1410] border-[#4A3828] text-[#FFF3E0] placeholder-[#8B7355]' : 'bg-[#FFF3E0] border-[#E8D5C0] text-espresso placeholder-[#C4A882]'}`} />
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className={`flex items-center justify-between px-4 py-2 border-b ${dark ? 'border-[#4A3828]' : 'border-[#E8D5C0]'}`}>
          <button onClick={toggleAll} className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer ${dark ? 'text-[#C4A882] hover:text-[#FFF3E0]' : 'text-[#8B7355] hover:text-espresso'}`}>
            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          {selected.size > 0 && (
            <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-btn bg-tomato text-white hover:bg-[#B83A20] transition-all cursor-pointer hover:scale-[0.97] active:scale-[0.97]">
              <Trash2 className="w-3.5 h-3.5" /> Delete ({selected.size})
            </button>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-sm ${dark ? 'text-[#8B7355]' : 'text-[#C4A882]'}`}>{emptyMessage}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((item, idx) => (
                <div key={getId(item)} className={`flex items-start gap-3 p-3 rounded-card border transition-colors ${dark ? 'border-[#4A3828] hover:bg-[#1A1410]' : 'border-[#E8D5C0] hover:bg-[#FFF8F0]'}`}>
                  <button onClick={() => toggleOne(getId(item))} className="shrink-0 mt-0.5 cursor-pointer" aria-label={selected.has(getId(item)) ? 'Deselect' : 'Select'}>
                    {selected.has(getId(item)) ? <CheckSquare className="w-4 h-4 text-tomato" /> : <Square className={`w-4 h-4 ${dark ? 'text-[#8B7355]' : 'text-[#C4A882]'}`} />}
                  </button>
                  <div className="flex-1 min-w-0">{renderItem(item, idx)}</div>
                  <button onClick={() => onDelete([getId(item)])} className={`shrink-0 p-1 rounded hover:bg-tomato/10 transition-colors cursor-pointer ${dark ? 'text-[#8B7355] hover:text-tomato-light' : 'text-[#C4A882] hover:text-tomato'}`} aria-label="Delete item">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== CAROUSEL =====
interface CarouselProps {
  items: ReactNode[];
  autoSlideMs?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export function Carousel({ items, autoSlideMs = 4000, showDots = true, showArrows = true }: CarouselProps) {
  // useState
  const [current, setCurrent] = useState(0);
  // useRef
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = items.length;

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % total) + total) % total);
  }, [total]);

  // useEffect — auto-slide
  useEffect(() => {
    if (total <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, autoSlideMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [total, autoSlideMs]);

  if (total === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-card">
      <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((item, idx) => (
          <div key={idx} className="w-full shrink-0">{item}</div>
        ))}
      </div>
      {showArrows && total > 1 && (
        <>
          <button onClick={() => goTo(current - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-[#2A2218]/80 shadow-md hover:scale-110 transition-all cursor-pointer z-10" aria-label="Previous slide"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => goTo(current + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-[#2A2218]/80 shadow-md hover:scale-110 transition-all cursor-pointer z-10" aria-label="Next slide"><ChevronRight className="w-5 h-5" /></button>
        </>
      )}
      {showDots && total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {items.map((_, idx) => (
            <button key={idx} onClick={() => goTo(idx)} className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === current ? 'bg-tomato scale-110' : 'bg-white/60 dark:bg-[#C4A882]/60'}`} aria-label={`Go to slide ${idx + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ===== SKELETON CARD =====
export function SkeletonCard() {
  return (
    <div className="rounded-card border border-[#E8D5C0] dark:border-[#4A3828] overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-8 w-full rounded-btn mt-2" />
      </div>
    </div>
  );
}

// ===== FOOD FALLBACK CARD =====
export function FoodFallback({ name, category }: { name: string; category: string }) {
  const { dark } = useTheme();
  return (
    <div className={`food-fallback ${dark ? 'dark' : ''}`} role="img" aria-label={`${name} illustration`}>
      <div className="fallback-food-plate">
        <span className="fallback-steam fallback-steam-one" />
        <span className="fallback-steam fallback-steam-two" />
        <span className="fallback-garnish fallback-garnish-one" />
        <span className="fallback-garnish fallback-garnish-two" />
      </div>
      <div className="fallback-food-caption">
        <span>{category}</span>
        <strong>{name}</strong>
      </div>
    </div>
  );
}

// ===== IMG WITH FALLBACK =====
export function ImgWithFallback({ src, alt, className = '', recipeName, recipeCategory }: { src: string; alt: string; className?: string; recipeName: string; recipeCategory: string }) {
  // useState
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <FoodFallback name={recipeName} category={recipeCategory} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

// ===== LOADING SPINNER =====
export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  const { dark } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-tomato border-t-transparent rounded-full animate-spin-slow" />
      <p className={`text-sm ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{text}</p>
    </div>
  );
}

// ===== FOOTER =====
export function Footer() {
  const { dark } = useTheme();
  return (
    <footer className={`border-t py-8 mt-auto ${dark ? 'bg-[#1A1410] border-[#4A3828]' : 'bg-[#FFF8F0] border-[#E8D5C0]'}`}>
      <div className="content-container text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ChefHat className="w-5 h-5 text-tomato" />
          <span className={`font-bold ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>Savoria</span>
        </div>
        <p className={`text-xs ${dark ? 'text-[#8B7355]' : 'text-[#C4A882]'}`}>
          Made with fresh ingredients and good taste. © {new Date().getFullYear()} Savoria.
        </p>
      </div>
    </footer>
  );
}

// ===== RECIPE CARD (shared) =====
export function RecipeCard({ recipe, onClick, actionLabel, onAction, actionIcon: ActionIcon, showFav, isFavorite, onToggleFav, dark }: {
  recipe: Recipe;
  onClick: () => void;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  showFav?: boolean;
  isFavorite?: boolean;
  onToggleFav?: (e: React.MouseEvent) => void;
  dark: boolean;
}) {
  return (
    <div className={`compact-recipe-card rounded-card border shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col overflow-hidden h-full ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
      <button onClick={onClick} className="cursor-pointer w-full text-left">
        <div className="relative aspect-[16/10] overflow-hidden">
          <ImgWithFallback
            src={recipe.thumbnail}
            alt={recipe.name}
            recipeName={recipe.name}
            recipeCategory={recipe.category}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {showFav && (
            <button onClick={(e) => { e.stopPropagation(); onToggleFav?.(e); }} className={`absolute top-2 right-2 p-2 rounded-full cursor-pointer transition-all hover:scale-110 ${
              isFavorite ? 'bg-tomato text-white shadow-md' : 'bg-white/80 dark:bg-[#2A2218]/80 text-[#8B7355] dark:text-[#C4A882]'
            }`} aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </button>
      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${dark ? 'bg-[#1A1410] text-honey' : 'bg-[#FFF3E0] text-clay'}`}>{recipe.category}</span>
          <span className={`text-[10px] uppercase tracking-wider ${dark ? 'text-[#8B7355]' : 'text-[#C4A882]'}`}>{recipe.area}</span>
        </div>
        <h3 className={`font-bold text-base mb-1 line-clamp-2 min-h-[2.8rem] ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>{recipe.name}</h3>
        <p className={`text-xs line-clamp-2 min-h-[2rem] ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{recipe.ingredients.slice(0, 3).map((i) => i.ingredient).join(', ')}</p>
        {actionLabel && onAction && (
          <button onClick={(e) => { e.stopPropagation(); onAction(); }} className="recipe-action-btn mt-auto w-full px-4 py-2 text-sm font-medium rounded-btn bg-olive text-white hover:bg-[#5F6E3A] transition-all duration-200 cursor-pointer hover:scale-[0.97] active:scale-[0.97]">
            {ActionIcon && <ActionIcon className="w-4 h-4" />}
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ===== EMPTY STATE =====
export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: { label: string; onClick: () => void } }) {
  const { dark } = useTheme();
  return (
    <div className="text-center py-16 px-4">
      <Icon className={`w-16 h-16 mx-auto mb-4 ${dark ? 'text-[#4A3828]' : 'text-[#E8D5C0]'}`} />
      <h3 className={`text-lg font-bold mb-2 ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>{title}</h3>
      <p className={`text-sm max-w-md mx-auto mb-6 ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{description}</p>
      {action && (
        <button onClick={action.onClick} className="px-5 py-2.5 text-sm font-medium rounded-btn bg-tomato text-white hover:bg-[#B83A20] transition-all cursor-pointer hover:scale-[0.97] active:scale-[0.97]">{action.label}</button>
      )}
    </div>
  );
}

// ===== STAT CARD =====
export function StatCard({ icon: Icon, value, label, dark }: { icon: LucideIcon; value: string | number; label: string; dark: boolean }) {
  return (
    <div className={`rounded-card border p-4 text-center ${dark ? 'bg-[#2A2218] border-[#4A3828]' : 'bg-white border-[#E8D5C0]'}`}>
      <Icon className={`w-6 h-6 mx-auto mb-2 ${dark ? 'text-tomato-light' : 'text-tomato'}`} />
      <p className={`text-2xl font-bold ${dark ? 'text-[#FFF3E0]' : 'text-espresso'}`} style={{ fontFamily: 'var(--font-heading)' }}>{value}</p>
      <p className={`text-xs ${dark ? 'text-[#C4A882]' : 'text-[#8B7355]'}`}>{label}</p>
    </div>
  );
}