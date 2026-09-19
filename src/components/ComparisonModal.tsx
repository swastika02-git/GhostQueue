import React from 'react';
import { X, Sparkles, Zap, MapPin, Clock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ComparisonData, LocationWithTravel } from '../types';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ComparisonData | null;
  onSelectCandidate: (candidateLocation: LocationWithTravel) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  data,
  onSelectCandidate,
}) => {
  if (!isOpen || !data) return null;

  const { baseLocation, candidates, fastestCandidate, nearestCandidate, maxTimeSaved, recommendationExplanation } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-lavender-200/80 shadow-soft-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-lavender-100 flex items-center justify-between bg-cream-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-lavender-100 text-lavender-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-charcoal-900">Compare Nearby Options</h2>
              <p className="text-xs text-charcoal-500">
                Finding the fastest overall path for <span className="font-semibold text-charcoal-700">{baseLocation.subcategory}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* THE CENTRAL AHA! MOMENT: TIME SAVED HIGHLIGHT */}
          {maxTimeSaved > 0 ? (
            <div className="bg-gradient-to-br from-status-low-bg via-cream-50 to-peach-light/50 border border-status-low-border/70 rounded-3xl p-5 text-center shadow-soft">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 text-status-low-text border border-status-low-border/60 shadow-soft-sm mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Intelligent Total-Time Decision
              </span>

              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-status-low-text tracking-tight my-1">
                Save ~{maxTimeSaved} minutes
              </div>

              <p className="text-xs sm:text-sm text-charcoal-700 max-w-lg mx-auto leading-relaxed mt-2 font-medium">
                {recommendationExplanation}
              </p>
              
              <div className="mt-2 text-[11px] text-charcoal-400">
                *Estimated based on current queue signals and live road travel times across Kolkata.
              </div>
            </div>
          ) : (
            <div className="bg-cream-100 border border-lavender-100 rounded-2xl p-4 text-center">
              <CheckCircle2 className="w-7 h-7 text-status-low-dot mx-auto mb-1" />
              <div className="text-sm font-bold text-charcoal-900">Optimal Choice Selected</div>
              <p className="text-xs text-charcoal-600 mt-0.5">
                {baseLocation.name} is already your fastest available option right now!
              </p>
            </div>
          )}

          {/* Side-by-Side Comparison Table / Cards */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Location Alternatives & Total Time
              </span>
              <span className="text-[11px] text-charcoal-400 font-medium">
                Formula: Travel + Wait = Total
              </span>
            </div>

            <div className="space-y-2.5">
              {candidates.map((cand) => {
                const isFastest = cand.isFastestOverall;
                const isSelectedBase = cand.isBase;
                const isNearest = cand.isNearest;

                return (
                  <div
                    key={cand.location.id}
                    className={`rounded-2xl p-4 border transition-all ${
                      isFastest
                        ? 'bg-status-low-bg/40 border-status-low-border/80 shadow-soft'
                        : isSelectedBase
                        ? 'bg-white border-lavender-300 ring-2 ring-lavender-100'
                        : 'bg-white hover:bg-cream-50 border-lavender-100'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Location details & badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {isFastest && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-status-low-bg text-status-low-text border border-status-low-border">
                              ⚡ Fastest Overall
                            </span>
                          )}
                          {isNearest && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-cream-200 text-charcoal-700 border border-lavender-200">
                              📍 Nearest Distance
                            </span>
                          )}
                          {isSelectedBase && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-lavender-100 text-lavender-700">
                              Currently Selected
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-charcoal-900 truncate">
                          {cand.location.name}
                        </h3>
                        <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{cand.location.area}, Kolkata ({cand.distanceKm} km away)</span>
                        </p>
                      </div>

                      {/* Right: The Breakdown (Travel, Wait, Total) */}
                      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <div className="text-center px-2 py-1 rounded-xl bg-cream-50 sm:min-w-[64px]">
                          <span className="text-[10px] text-charcoal-400 block font-medium">Travel</span>
                          <span className="text-xs font-bold text-charcoal-700">{cand.travelTimeMinutes}m</span>
                        </div>

                        <span className="text-xs text-charcoal-300 font-bold">+</span>

                        <div className="text-center px-2 py-1 rounded-xl bg-cream-50 sm:min-w-[64px]">
                          <span className="text-[10px] text-charcoal-400 block font-medium">Wait</span>
                          <span className="text-xs font-bold text-charcoal-700">
                            {cand.location.data_source === 'learning' ? '?' : `${cand.waitTimeMinutes}m`}
                          </span>
                        </div>

                        <span className="text-xs text-charcoal-300 font-bold">=</span>

                        {/* Total Time Box */}
                        <div className={`text-center px-3 py-1.5 rounded-xl sm:min-w-[80px] ${
                          isFastest 
                            ? 'bg-status-low-bg text-status-low-text border border-status-low-border/70 font-black' 
                            : 'bg-lavender-50 text-charcoal-800 font-bold'
                        }`}>
                          <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Total</span>
                          <span className="text-base sm:text-lg">
                            {cand.totalTimeMinutes} <span className="text-xs font-semibold">min</span>
                          </span>
                        </div>

                        {!isSelectedBase && (
                          <button
                            onClick={() => {
                              onSelectCandidate(cand.location as LocationWithTravel);
                              onClose();
                            }}
                            className="text-xs font-semibold px-3 py-2 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white shadow-soft-sm transition-all"
                          >
                            Select
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Honest Transparent Framing Footer */}
          <div className="bg-cream-50 rounded-2xl p-3 border border-lavender-100 flex items-start gap-2.5 text-xs text-charcoal-500">
            <ShieldCheck className="w-4 h-4 text-lavender-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-charcoal-700">Integrity notice:</span> Total times are likely estimates calculated from active observation signals, day-of-week trends, and Kolkata traffic matrices. We never treat simulated data as absolute guarantees.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
