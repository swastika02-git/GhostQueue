import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Zap, 
  MapPin, 
  Clock, 
  HelpCircle, 
  MessageSquarePlus, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  GitCompare, 
  ShieldCheck, 
  Filter 
} from 'lucide-react';
import { LocationWithTravel, SortFilterOption, ComparisonData } from '../types';

interface RightPanelProps {
  selectedLocation: LocationWithTravel | null;
  onClearSelectedLocation: () => void;
  locations: LocationWithTravel[];
  onSelectLocation: (loc: LocationWithTravel) => void;
  onOpenReport: (loc: LocationWithTravel) => void;
  onOpenWhyEstimate: (loc: LocationWithTravel) => void;
  activeSort: SortFilterOption;
  onSortChange: (sort: SortFilterOption) => void;
  simulatedHour: number;
  comparisonData: ComparisonData | null;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedLocation,
  onClearSelectedLocation,
  locations,
  onSelectLocation,
  onOpenReport,
  onOpenWhyEstimate,
  activeSort,
  onSortChange,
  simulatedHour,
  comparisonData,
}) => {
  const [showCompareSection, setShowCompareSection] = useState(true);

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
  };

  // ========================================================
  // STATE A: A SPECIFIC LOCATION IS SELECTED
  // ========================================================
  if (selectedLocation) {
    const isLearning = selectedLocation.data_source === 'learning';
    const isCommunity = selectedLocation.data_source === 'community';
    const maxSaved = comparisonData?.maxTimeSaved || 0;

    return (
      <aside className="w-full h-full flex flex-col bg-white border-l border-lavender-100 overflow-y-auto">
        {/* Sticky Header with Back/Close */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3 border-b border-lavender-100 flex items-center justify-between">
          <button
            onClick={onClearSelectedLocation}
            className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-lavender-700 hover:bg-lavender-50 px-2.5 py-1 rounded-lg transition-colors"
          >
            <span>← All locations</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-lavender-100 text-lavender-700 border border-lavender-200/80">
              {selectedLocation.subcategory}
            </span>
            <button
              onClick={onClearSelectedLocation}
              className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded-full hover:bg-cream-100"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Location Title & Area */}
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-charcoal-900 tracking-tight leading-snug">
              {selectedLocation.name}
            </h2>
            <p className="text-xs text-charcoal-500 mt-1 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-charcoal-400 shrink-0 mt-0.5" />
              <span>{selectedLocation.address}</span>
            </p>
          </div>

          {/* LOW DATA STATE */}
          {isLearning ? (
            <div className="p-4 rounded-2xl bg-cream-100 border border-lavender-100 text-center space-y-2">
              <span className="text-xs font-bold text-charcoal-800 block">We're still learning this location</span>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                We don't have enough recent observations to provide a reliable wait estimate yet.
              </p>
              <button
                onClick={() => onOpenReport(selectedLocation)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-xs shadow-soft transition-all"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                Report current wait
              </button>
            </div>
          ) : (
            <>
              {/* SECTION 6: THE MOST IMPORTANT UI ELEMENT */}
              {/* TOTAL ESTIMATED TIME (TRAVEL + WAIT = TOTAL) */}
              <div className="bg-gradient-to-br from-[#7462A5] via-[#8573B7] to-[#9785C8] text-white rounded-2xl p-4 shadow-soft-lg border border-lavender-400/30">
                <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-lavender-100/90 mb-1">
                  <span>Total Estimated Time</span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                </div>

                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">{selectedLocation.totalTimeMinutes}</span>
                  <span className="text-lg font-bold text-lavender-200">MIN TOTAL</span>
                </div>

                {/* Clear Mathematical Equation */}
                <div className="mt-2 pt-2 border-t border-white/20 text-xs font-medium text-lavender-100 flex items-center justify-between">
                  <span>{selectedLocation.travelInfo.travelTimeMinutes} min travel</span>
                  <span className="text-white/60 font-bold">+</span>
                  <span>{selectedLocation.current_wait} min queue</span>
                  <span className="text-white/60 font-bold">=</span>
                  <span className="font-extrabold text-white">{selectedLocation.totalTimeMinutes} min</span>
                </div>

                {maxSaved > 0 && (
                  <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-white/20 backdrop-blur-sm text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                    <span>Potential time saved: ~{maxSaved} min vs slower options</span>
                  </div>
                )}
              </div>

              {/* Fast Three Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-cream-50 p-2.5 rounded-xl border border-lavender-100">
                  <span className="text-[10px] uppercase font-bold text-charcoal-400 block">Est. Wait</span>
                  <div className="text-lg font-black text-charcoal-900 mt-0.5">
                    {selectedLocation.current_wait} <span className="text-[10px] font-medium text-charcoal-500">min</span>
                  </div>
                </div>

                <div className="bg-cream-50 p-2.5 rounded-xl border border-lavender-100">
                  <span className="text-[10px] uppercase font-bold text-charcoal-400 block">Confidence</span>
                  <div className="text-lg font-black text-charcoal-900 mt-0.5">
                    {selectedLocation.confidence}<span className="text-[10px] font-medium text-charcoal-500">%</span>
                  </div>
                </div>

                <div className="bg-cream-50 p-2.5 rounded-xl border border-lavender-100">
                  <span className="text-[10px] uppercase font-bold text-charcoal-400 block">Travel</span>
                  <div className="text-lg font-black text-charcoal-900 mt-0.5">
                    {selectedLocation.travelInfo.travelTimeMinutes} <span className="text-[10px] font-medium text-charcoal-500">min</span>
                  </div>
                </div>
              </div>

              {/* Status Breakdown & Details */}
              <div className="space-y-2 text-xs border-t border-lavender-100 pt-3">
                <div className="bg-cream-50 p-2.5 rounded-xl border border-lavender-100/60 text-charcoal-700">
                  <span className="font-bold text-charcoal-800 block text-[11px] mb-0.5">Current Situation</span>
                  <p className="italic text-charcoal-600">"{selectedLocation.current_situation}"</p>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-lavender-100/60">
                  <span className="text-charcoal-500">Typical at this time:</span>
                  <span className="font-semibold text-charcoal-800">{selectedLocation.typical_wait} min</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-lavender-100/60">
                  <span className="text-charcoal-500">Today's pattern:</span>
                  <span className="flex items-center gap-1 font-semibold text-charcoal-800">
                    {selectedLocation.trend > 0 ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5 text-status-high-dot" />
                        <span>+{selectedLocation.trend}% over last hour</span>
                      </>
                    ) : selectedLocation.trend < 0 ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5 text-status-low-dot" />
                        <span>{selectedLocation.trend}% over last hour</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-3.5 h-3.5 text-charcoal-400" />
                        <span>Stable</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-charcoal-500">Last updated:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isCommunity
                      ? 'bg-status-low-bg text-status-low-text border border-status-low-border/60'
                      : 'bg-cream-200 text-charcoal-600'
                  }`}>
                    {isCommunity ? `Community · ${selectedLocation.last_updated}` : 'Simulated estimate'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Compare & Report */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowCompareSection(!showCompareSection)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-bold text-xs shadow-soft transition-all"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Compare nearby</span>
                </button>

                <button
                  onClick={() => onOpenReport(selectedLocation)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-lavender-50 border border-lavender-200 text-charcoal-700 font-semibold text-xs shadow-soft-sm transition-all"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 text-lavender-600" />
                  <span>Report wait</span>
                </button>
              </div>

              <button
                onClick={() => onOpenWhyEstimate(selectedLocation)}
                className="w-full text-center text-[11px] text-charcoal-500 hover:text-lavender-700 font-medium py-1 flex items-center justify-center gap-1 transition-colors"
              >
                <HelpCircle className="w-3 h-3" />
                <span>How this estimate was calculated</span>
              </button>

              {/* SECTION 7: COMPARISON SHOULD BE EASY & VISIBLE */}
              {showCompareSection && comparisonData && comparisonData.candidates.length > 1 && (
                <div className="mt-3 pt-3 border-t border-lavender-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                      Nearby Options Comparison
                    </span>
                    <span className="text-[10px] text-charcoal-400">Ranked by Total Time</span>
                  </div>

                  {comparisonData.maxTimeSaved > 0 && (
                    <div className="bg-status-low-bg/70 border border-status-low-border rounded-xl p-2.5 text-xs text-status-low-text font-medium flex items-start gap-2">
                      <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Save ~{comparisonData.maxTimeSaved} minutes!</strong>
                        <div className="text-[11px] text-charcoal-700 mt-0.5">
                          {comparisonData.recommendationExplanation}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {comparisonData.candidates.map((cand) => {
                      const isThisSelected = cand.location.id === selectedLocation.id;
                      const isFastest = cand.isFastestOverall;

                      return (
                        <div
                          key={cand.location.id}
                          onClick={() => onSelectLocation(cand.location as LocationWithTravel)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isThisSelected
                              ? 'bg-lavender-50 border-lavender-300 ring-1 ring-lavender-200'
                              : isFastest
                              ? 'bg-status-low-bg/40 border-status-low-border hover:bg-status-low-bg/60'
                              : 'bg-white hover:bg-cream-50 border-lavender-100'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                {isFastest && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-status-low-bg text-status-low-text border border-status-low-border">
                                    Fastest
                                  </span>
                                )}
                                <span className="font-bold text-charcoal-900 truncate block">
                                  {cand.location.name}
                                </span>
                              </div>
                              <span className="text-[11px] text-charcoal-500">
                                {cand.travelTimeMinutes}m travel + {cand.waitTimeMinutes}m wait
                              </span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-charcoal-900 block">
                                {cand.totalTimeMinutes} min
                              </span>
                              <span className="text-[10px] text-charcoal-400">total</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    );
  }

  // ========================================================
  // STATE B: NO LOCATION SELECTED — BROWSING ALL LOCATIONS
  // ========================================================
  const sortOptions: Array<{ id: SortFilterOption; label: string }> = [
    { id: 'fastest_total', label: 'Fastest overall' },
    { id: 'lowest_wait', label: 'Lowest wait' },
    { id: 'nearest', label: 'Nearest' },
    { id: 'high_confidence', label: 'Confidence' },
  ];

  return (
    <aside className="w-full h-full flex flex-col bg-white border-l border-lavender-100">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-lavender-100 bg-cream-50/70">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-extrabold text-charcoal-900">
              Nearby Kolkata Locations
            </h2>
            <p className="text-[11px] text-charcoal-500">
              {locations.length} options · Ranked by <span className="font-semibold text-lavender-700">Total Time</span>
            </p>
          </div>
          <span className="w-2 h-2 rounded-full bg-status-low-dot animate-pulse" />
        </div>

        {/* Quick Sort Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {sortOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSortChange(opt.id)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                activeSort === opt.id
                  ? 'bg-lavender-600 text-white shadow-soft-sm'
                  : 'bg-white text-charcoal-600 hover:bg-lavender-50 border border-lavender-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Locations Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {locations.map((loc) => {
          return (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              className="p-3 rounded-2xl bg-white hover:bg-cream-50/80 border border-lavender-100 hover:border-lavender-300 shadow-soft-sm hover:shadow-soft cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-cream-200 text-charcoal-600">
                      {loc.subcategory}
                    </span>
                    <span className="text-[11px] text-charcoal-400 truncate">
                      {loc.area}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-charcoal-900 truncate group-hover:text-lavender-800 transition-colors">
                    {loc.name}
                  </h3>

                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-charcoal-500">
                    <span>🚗 {loc.travelInfo.travelTimeMinutes}m travel</span>
                    <span>•</span>
                    <span>⏱ {loc.data_source === 'learning' ? '?' : `${loc.current_wait}m`} wait</span>
                  </div>
                </div>

                {/* Right: Prominent Total Time */}
                <div className="text-right shrink-0 bg-lavender-50/80 px-2.5 py-1.5 rounded-xl border border-lavender-100 group-hover:border-lavender-300 transition-colors">
                  <span className="text-[9px] uppercase font-bold text-charcoal-400 block tracking-wider">
                    Total
                  </span>
                  <div className="text-sm font-black text-charcoal-900">
                    {loc.totalTimeMinutes} <span className="text-[10px] font-semibold text-charcoal-500">min</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {locations.length === 0 && (
          <div className="p-8 text-center text-charcoal-400 text-xs">
            No locations found matching your search. Try adjusting the filter or search query.
          </div>
        )}
      </div>
    </aside>
  );
};
