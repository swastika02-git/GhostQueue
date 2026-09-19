import React, { useState } from 'react';
import { ArrowRight, Sparkles, ChevronUp, ChevronDown, Compass, ShieldCheck, Zap } from 'lucide-react';

interface HeroSectionProps {
  onExploreMap: () => void;
  onOpenHowItWorks: () => void;
  onSelectQuickSearch: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreMap,
  onOpenHowItWorks,
  onSelectQuickSearch,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const quickScenarios = [
    { label: 'Kasba RTO', query: 'Kasba RTO' },
    { label: 'SSKM OPD Ticket', query: 'SSKM' },
    { label: 'Howrah Tatkal Booking', query: 'Howrah PRS' },
    { label: 'Passport Seva Kendra', query: 'Passport Seva' },
    { label: 'Suraksha Diagnostics', query: 'Suraksha' },
    { label: 'Apple Service Centre', query: 'Apple' },
  ];

  if (isCollapsed) {
    return (
      <div className="bg-gradient-to-r from-lavender-50 via-cream-50 to-peach-light/40 border-b border-lavender-100 py-2 px-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-charcoal-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-low-dot animate-ping" />
            <span className="font-semibold text-charcoal-800">Know the wait before you go.</span>
            <span className="hidden sm:inline text-charcoal-500">Compare travel time + wait time across Kolkata.</span>
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-1 text-lavender-700 hover:text-lavender-800 font-semibold px-2 py-0.5 rounded-full hover:bg-lavender-100/60"
          >
            Show Guide <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-b from-cream-100 via-lavender-50/50 to-cream-50 border-b border-lavender-100/80 px-4 sm:px-6 lg:px-8 pt-6 pb-5 transition-all">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-3xl">
            {/* Value Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-lavender-200/80 text-xs font-semibold text-lavender-700 shadow-soft-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-lavender-500" />
              <span>The nearest place is not always the fastest place.</span>
            </div>

            {/* Main Headings */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-charcoal-900 leading-[1.18]">
              Know the wait <span className="text-lavender-600 underline decoration-lilac decoration-wavy decoration-2">before you go.</span>
            </h1>

            <p className="mt-2.5 text-sm sm:text-base text-charcoal-600 leading-relaxed max-w-2xl font-normal">
              GhostQueue estimates real-world waiting times across Kolkata so you can choose where to go based on <strong className="text-charcoal-800 font-semibold">total time</strong> — travel time plus queue time — not just physical distance.
            </p>

            {/* Quick Action Scenario Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-charcoal-400 mr-1">Popular right now:</span>
              {quickScenarios.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onSelectQuickSearch(item.query)}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-white hover:bg-lavender-100/70 border border-lavender-200/70 text-charcoal-700 hover:text-lavender-800 shadow-soft-sm hover:shadow transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Box: Key Insight Demonstration */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="bg-white rounded-2xl p-4 border border-lavender-100 shadow-soft max-w-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                <span>The GhostQueue Insight</span>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="space-y-1.5 text-xs text-charcoal-700">
                <div className="flex justify-between items-center bg-cream-100/80 px-2 py-1 rounded-lg">
                  <span className="text-charcoal-500">Option A (Nearest):</span>
                  <span className="font-semibold text-charcoal-800">15m travel + 72m wait = <span className="text-status-high-text font-bold">87m</span></span>
                </div>
                <div className="flex justify-between items-center bg-status-low-bg px-2 py-1 rounded-lg border border-status-low-border/60">
                  <span className="text-status-low-text font-medium">Option B (Faster):</span>
                  <span className="font-bold text-status-low-text">28m travel + 18m wait = <span className="underline">46m</span></span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-lavender-100 flex items-center justify-between">
                <span className="text-xs font-bold text-status-low-text">Save ~41 minutes</span>
                <span className="text-[10px] text-charcoal-400">Based on live signals</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onExploreMap}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-xs shadow-soft transition-all"
              >
                <Compass className="w-3.5 h-3.5" />
                Explore Kolkata
              </button>
              <button
                onClick={onOpenHowItWorks}
                className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-white hover:bg-lavender-50 border border-lavender-200 text-charcoal-700 font-medium text-xs shadow-soft-sm transition-all"
              >
                How it works
              </button>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-white rounded-xl transition-all"
                title="Collapse hero"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
