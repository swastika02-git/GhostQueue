import React from 'react';
import { Clock, Navigation, Sparkles, MapPin, Globe2, Layers } from 'lucide-react';
import { UserOrigin } from '../types';
import { POPULAR_ORIGINS } from '../services/travelTimeService';

interface NavbarProps {
  currentOrigin: UserOrigin;
  onSelectOrigin: (origin: UserOrigin) => void;
  onOpenHowItWorks: () => void;
  onOpenFutureVision: () => void;
  totalLocationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentOrigin,
  onSelectOrigin,
  onOpenHowItWorks,
  onOpenFutureVision,
  totalLocationsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-cream-100/90 backdrop-blur-md border-b border-lavender-100 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & City Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lavender-600 via-lavender-500 to-lilac-dark flex items-center justify-center text-white shadow-soft">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-charcoal-900">GhostQueue</span>
              <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-full bg-lavender-100 text-lavender-700 border border-lavender-200">
                Kolkata
              </span>
            </div>
            <p className="text-xs text-charcoal-500 hidden sm:block">
              City-wide waiting-time intelligence · {totalLocationsCount} active hubs
            </p>
          </div>
        </div>

        {/* Origin Selector (Starting Point) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex items-center bg-white border border-lavender-200 rounded-full px-3 py-1.5 shadow-soft-sm hover:border-lavender-400 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-lavender-600 shrink-0 mr-1.5" />
            <span className="text-xs text-charcoal-400 font-medium hidden md:inline mr-1">From:</span>
            <select
              value={currentOrigin.name}
              onChange={(e) => {
                const found = POPULAR_ORIGINS.find((o) => o.name === e.target.value);
                if (found) onSelectOrigin(found);
              }}
              className="text-xs font-semibold text-charcoal-800 bg-transparent border-none focus:outline-none cursor-pointer pr-2"
              aria-label="Select starting location in Kolkata"
            >
              {POPULAR_ORIGINS.map((origin) => (
                <option key={origin.name} value={origin.name}>
                  {origin.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* How It Works Button */}
          <button
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-lavender-700 bg-white hover:bg-lavender-50 border border-lavender-100 rounded-full px-3 py-1.5 shadow-soft-sm transition-all"
            title="Learn how predictions work"
          >
            <Sparkles className="w-3.5 h-3.5 text-lavender-500" />
            <span className="hidden sm:inline">How it works</span>
          </button>

          {/* Future Multi-City Expansion */}
          <button
            onClick={onOpenFutureVision}
            className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-lavender-700 bg-white hover:bg-lavender-50 border border-lavender-100 rounded-full px-3 py-1.5 shadow-soft-sm transition-all"
            title="City Waiting-Time Layer Vision"
          >
            <Globe2 className="w-3.5 h-3.5 text-powder-accent" />
            <span className="hidden md:inline">Beyond Kolkata</span>
          </button>
        </div>
      </div>
    </header>
  );
};
