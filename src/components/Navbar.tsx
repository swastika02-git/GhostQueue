import React from 'react';
import { 
  Clock, 
  MapPin, 
  Search, 
  X, 
  Sparkles, 
  Globe2, 
  Zap, 
  ShieldCheck, 
  Sun, 
  Sunset 
} from 'lucide-react';
import { UserOrigin, CategoryType, SortFilterOption } from '../types';
import { POPULAR_ORIGINS } from '../services/travelTimeService';

interface NavbarProps {
  currentOrigin: UserOrigin;
  onSelectOrigin: (origin: UserOrigin) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryType;
  onCategoryChange: (cat: CategoryType) => void;
  activeSort: SortFilterOption;
  onSortChange: (sort: SortFilterOption) => void;
  totalCount: number;
  simulatedHour: number;
  onHourChange: (hour: number) => void;
  onOpenHowItWorks: () => void;
  onOpenFutureVision: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentOrigin,
  onSelectOrigin,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  activeSort,
  onSortChange,
  totalCount,
  simulatedHour,
  onHourChange,
  onOpenHowItWorks,
  onOpenFutureVision,
}) => {
  const categories: Array<{ id: CategoryType; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'government', label: 'Government & Civic' },
    { id: 'transport', label: 'Transport' },
    { id: 'finance', label: 'Banks' },
    { id: 'education', label: 'Education' },
    { id: 'services', label: 'Services' },
  ];

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12} ${ampm}`;
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-lavender-100 px-4 sm:px-6 py-2.5 shadow-soft-sm z-30 shrink-0">
      <div className="flex flex-col gap-2.5">
        {/* Top Row: Brand, Origin Selector, Large Search Bar, Time & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Brand + Origin */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-lavender-600 to-lavender-500 flex items-center justify-center text-white shadow-soft">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-black text-lg tracking-tight text-charcoal-900">GhostQueue</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded-full bg-lavender-100 text-lavender-700 border border-lavender-200">
                Kolkata
              </span>
            </div>

            {/* Origin dropdown */}
            <div className="flex items-center bg-cream-50 border border-lavender-200 rounded-full px-2.5 py-1 text-xs text-charcoal-700 hover:border-lavender-400 transition-colors">
              <MapPin className="w-3 h-3 text-lavender-600 mr-1 shrink-0" />
              <span className="text-[11px] text-charcoal-400 mr-1 hidden sm:inline">From:</span>
              <select
                value={currentOrigin.name}
                onChange={(e) => {
                  const found = POPULAR_ORIGINS.find((o) => o.name === e.target.value);
                  if (found) onSelectOrigin(found);
                }}
                className="bg-transparent text-xs font-semibold text-charcoal-800 focus:outline-none cursor-pointer pr-1"
                aria-label="Starting point in Kolkata"
              >
                {POPULAR_ORIGINS.map((origin) => (
                  <option key={origin.name} value={origin.name}>
                    {origin.shortName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center: Large Prominent Search Input (Section 3) */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Where do you need to go? (e.g. RTO, Hospital, Bank, Diagnostic Centre...)"
              className="w-full bg-cream-50 hover:bg-cream-100/70 focus:bg-white text-xs sm:text-sm text-charcoal-800 placeholder-charcoal-400 pl-10 pr-9 py-2 rounded-full border border-lavender-200 focus:border-lavender-500 focus:outline-none focus:ring-2 focus:ring-lavender-200 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-charcoal-400 hover:text-charcoal-700"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Time Travel Toggle + How it works */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick time simulator */}
            <div className="hidden lg:flex items-center bg-cream-50 border border-lavender-200 rounded-full px-2.5 py-1 text-xs gap-1.5 text-charcoal-700">
              <Sun className="w-3 h-3 text-amber-500" />
              <span className="text-[11px] font-bold">{formatHour(simulatedHour)}</span>
              <button
                onClick={() => onHourChange(simulatedHour === 10 ? 15 : simulatedHour === 15 ? 18 : 10)}
                className="text-[10px] text-lavender-700 hover:underline font-semibold ml-1"
                title="Toggle peak vs lull hours"
              >
                Toggle
              </button>
            </div>

            <button
              onClick={onOpenHowItWorks}
              className="flex items-center gap-1 text-xs font-semibold text-charcoal-600 hover:text-lavender-700 bg-cream-50 hover:bg-lavender-50 border border-lavender-200 rounded-full px-3 py-1 transition-all"
            >
              <Sparkles className="w-3 h-3 text-lavender-500" />
              <span className="hidden sm:inline">How it works</span>
            </button>

            <button
              onClick={onOpenFutureVision}
              className="flex items-center gap-1 text-xs font-semibold text-charcoal-600 hover:text-lavender-700 bg-cream-50 hover:bg-lavender-50 border border-lavender-200 rounded-full px-3 py-1 transition-all"
              title="Multi-city waiting layer"
            >
              <Globe2 className="w-3 h-3 text-powder-accent" />
              <span className="hidden md:inline">Vision</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Category Filter Chips & Results Count */}
        <div className="flex items-center justify-between gap-3 overflow-hidden pt-0.5">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-lavender-600 text-white shadow-soft-sm'
                      : 'bg-cream-100 hover:bg-lavender-50 text-charcoal-700 border border-lavender-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-charcoal-500 font-medium shrink-0 hidden sm:block">
            <strong className="text-charcoal-800">{totalCount}</strong> active Kolkata hubs
          </div>
        </div>
      </div>
    </header>
  );
};
