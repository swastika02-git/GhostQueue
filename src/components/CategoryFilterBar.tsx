import React from 'react';
import { Search, X, SlidersHorizontal, Check, Zap, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { CategoryType, SortFilterOption } from '../types';

interface CategoryFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  activeSort: SortFilterOption;
  onSortChange: (sort: SortFilterOption) => void;
  totalFilteredCount: number;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  activeSort,
  onSortChange,
  totalFilteredCount,
}) => {
  const categories: Array<{ id: CategoryType; label: string; icon?: string }> = [
    { id: 'all', label: 'All' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'government', label: 'Government & Civic' },
    { id: 'transport', label: 'Transport' },
    { id: 'finance', label: 'Banks' },
    { id: 'education', label: 'Education' },
    { id: 'services', label: 'Services' },
  ];

  const sortOptions: Array<{ id: SortFilterOption; label: string; icon: React.ReactNode }> = [
    { id: 'fastest_total', label: 'Fastest overall', icon: <Zap className="w-3 h-3 text-amber-500" /> },
    { id: 'lowest_wait', label: 'Lowest wait', icon: <Clock className="w-3 h-3 text-emerald-600" /> },
    { id: 'nearest', label: 'Nearest', icon: <MapPin className="w-3 h-3 text-lavender-600" /> },
    { id: 'high_confidence', label: 'High confidence', icon: <ShieldCheck className="w-3 h-3 text-powder-accent" /> },
    { id: 'open_now', label: 'Open now', icon: <Check className="w-3 h-3 text-charcoal-700" /> },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-lavender-100 py-3 px-4 sm:px-6 lg:px-8 shadow-soft-sm">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top Line: Floating Search Bar & Result Count */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Where do you need to go? (e.g. RTO, SSKM, Suraksha, Tatkal, Bank...)"
              className="w-full bg-cream-50 hover:bg-cream-100/70 focus:bg-white text-xs sm:text-sm text-charcoal-800 placeholder-charcoal-400 pl-10 pr-9 py-2.5 rounded-full border border-lavender-200/80 focus:border-lavender-500 focus:outline-none focus:ring-2 focus:ring-lavender-200 transition-all"
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

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-charcoal-500">
            <span className="font-medium">
              <strong className="text-charcoal-800">{totalFilteredCount}</strong> locations matched
            </span>
          </div>
        </div>

        {/* Bottom Line: Category Filter Chips & Sort Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-hidden">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
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

          {/* Quick Sort Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none border-t md:border-t-0 border-lavender-100 pt-2 md:pt-0">
            <span className="text-[11px] font-medium text-charcoal-400 shrink-0 hidden lg:inline">Sort:</span>
            {sortOptions.map((opt) => {
              const isSelected = activeSort === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onSortChange(opt.id)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-white border-2 border-lavender-500 text-charcoal-900 font-semibold shadow-soft-sm'
                      : 'bg-white hover:bg-cream-100 text-charcoal-600 border border-lavender-200/80'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
