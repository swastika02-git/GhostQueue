import React from 'react';
import { 
  X, 
  Clock, 
  Navigation, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  GitCompare, 
  MessageSquarePlus, 
  Building2, 
  MapPin, 
  Info 
} from 'lucide-react';
import { LocationWithTravel } from '../types';

interface LocationCardProps {
  location: LocationWithTravel;
  onClose: () => void;
  onOpenCompare: (loc: LocationWithTravel) => void;
  onOpenReport: (loc: LocationWithTravel) => void;
  onOpenWhyEstimate: (loc: LocationWithTravel) => void;
  simulatedHour: number;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onClose,
  onOpenCompare,
  onOpenReport,
  onOpenWhyEstimate,
  simulatedHour,
}) => {
  const isLearning = location.data_source === 'learning';
  const isCommunity = location.data_source === 'community';

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-lavender-100 shadow-soft-xl max-w-md w-full relative transition-all animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Top Bar: Subcategory Badge & Close */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-lavender-100/80 text-lavender-700 border border-lavender-200/60">
            {location.subcategory}
          </span>
          <span className="text-xs text-charcoal-400 font-medium">
            {location.area}, Kolkata
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 rounded-full transition-colors"
          aria-label="Close location card"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Location Name & Address */}
      <h2 className="text-xl font-bold text-charcoal-900 tracking-tight leading-snug">
        {location.name}
      </h2>
      <p className="text-xs text-charcoal-500 mt-1 flex items-start gap-1">
        <MapPin className="w-3.5 h-3.5 text-charcoal-400 shrink-0 mt-0.5" />
        <span>{location.address}</span>
      </p>

      {/* LOW DATA / LEARNING STATE */}
      {isLearning ? (
        <div className="my-5 p-4 rounded-2xl bg-cream-100 border border-lavender-100/80 text-center">
          <div className="w-9 h-9 rounded-2xl bg-lavender-100 text-lavender-600 flex items-center justify-center mx-auto mb-2.5">
            <Info className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-charcoal-800">We're still learning this location</h3>
          <p className="text-xs text-charcoal-500 mt-1 max-w-xs mx-auto leading-relaxed">
            We don't have enough recent observations to provide a reliable wait estimate yet. Be the first to report!
          </p>
          <button
            onClick={() => onOpenReport(location)}
            className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-xs shadow-soft transition-all"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            Report current wait
          </button>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid: Wait, Confidence, Travel */}
          <div className="grid grid-cols-3 gap-2.5 my-4">
            {/* Wait */}
            <div className="bg-cream-50 p-2.5 rounded-2xl border border-lavender-100/60 text-center">
              <span className="text-[11px] font-medium text-charcoal-500 block">Estimated wait</span>
              <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                <span className="text-xl font-extrabold text-charcoal-900">{location.current_wait}</span>
                <span className="text-xs font-semibold text-charcoal-500">min</span>
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-cream-50 p-2.5 rounded-2xl border border-lavender-100/60 text-center">
              <span className="text-[11px] font-medium text-charcoal-500 block">Confidence</span>
              <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                <span className="text-xl font-extrabold text-charcoal-900">{location.confidence}</span>
                <span className="text-xs font-semibold text-charcoal-500">%</span>
              </div>
            </div>

            {/* Travel Time */}
            <div className="bg-cream-50 p-2.5 rounded-2xl border border-lavender-100/60 text-center">
              <span className="text-[11px] font-medium text-charcoal-500 block">Travel time</span>
              <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                <span className="text-xl font-extrabold text-charcoal-900">{location.travelInfo.travelTimeMinutes}</span>
                <span className="text-xs font-semibold text-charcoal-500">min</span>
              </div>
            </div>
          </div>

          {/* Central Highlight: TOTAL ESTIMATED TIME */}
          <div className="bg-gradient-to-r from-lavender-500 via-lavender-600 to-lavender-700 text-white rounded-2xl p-4 shadow-soft-lg mb-4 text-center">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-lavender-200 block">
              Total Estimated Time (Travel + Wait)
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight mt-0.5">
              {location.totalTimeMinutes} <span className="text-lg font-bold text-lavender-200">min</span>
            </div>
            <p className="text-[11px] text-lavender-100/90 mt-1">
              {location.travelInfo.travelTimeMinutes} min travel ({location.travelInfo.distanceKm} km) + {location.current_wait} min estimated queue
            </p>
          </div>

          {/* Qualitative Details & Patterns */}
          <div className="space-y-2.5 text-xs text-charcoal-700 border-t border-lavender-100 pt-3">
            {/* Current situation */}
            <div>
              <span className="font-bold text-charcoal-800 block mb-0.5">Current situation</span>
              <p className="italic text-charcoal-600 bg-cream-100/70 p-2 rounded-xl border border-lavender-100/50">
                "{location.current_situation}"
              </p>
            </div>

            {/* Typical pattern */}
            <div className="flex items-center justify-between py-1 border-b border-lavender-100/60">
              <span className="text-charcoal-500 font-medium">Typical Tuesday at {formatHour(simulatedHour)}:</span>
              <span className="font-semibold text-charcoal-800">{location.typical_wait} min</span>
            </div>

            {/* Today's pattern trend */}
            <div className="flex items-center justify-between py-1 border-b border-lavender-100/60">
              <span className="text-charcoal-500 font-medium">Today's pattern:</span>
              <span className="flex items-center gap-1 font-semibold text-charcoal-800">
                {location.trend > 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-status-high-dot" />
                    <span>+{location.trend}% over last hour</span>
                  </>
                ) : location.trend < 0 ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-status-low-dot" />
                    <span>{location.trend}% over last hour</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-3.5 h-3.5 text-charcoal-400" />
                    <span>Stable</span>
                  </>
                )}
              </span>
            </div>

            {/* Last updated & data badge */}
            <div className="flex items-center justify-between py-1">
              <span className="text-charcoal-500 font-medium">Data integrity:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isCommunity 
                  ? 'bg-status-low-bg text-status-low-text border border-status-low-border/60' 
                  : 'bg-cream-200 text-charcoal-600 border border-lavender-100'
              }`}>
                {isCommunity ? `Community reported · ${location.last_updated}` : 'Simulated historical estimate'}
              </span>
            </div>
          </div>

          {/* Hourly Curve Sparkline */}
          {location.hourly_curve && (
            <div className="mt-3 pt-3 border-t border-lavender-100">
              <div className="flex items-center justify-between text-[11px] text-charcoal-500 mb-1.5">
                <span>Diurnal Pattern (8 AM – 8 PM)</span>
                <span className="text-[10px] text-charcoal-400">Peak wait highlighted</span>
              </div>
              <div className="flex items-end gap-1 h-10 w-full px-1">
                {location.hourly_curve.slice(8, 21).map((val, idx) => {
                  const hour = idx + 8;
                  const isCurrentHour = hour === simulatedHour;
                  const heightPercent = Math.min(100, Math.max(15, (val / 90) * 100));
                  return (
                    <div
                      key={hour}
                      className="flex-1 flex flex-col items-center gap-1 group relative"
                      title={`${formatHour(hour)}: ~${val} min wait`}
                    >
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-sm transition-all ${
                          isCurrentHour
                            ? 'bg-lavender-600 ring-2 ring-lavender-300'
                            : val > 45
                            ? 'bg-blush-border hover:bg-blush-accent'
                            : 'bg-lavender-200 hover:bg-lavender-300'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-charcoal-400 mt-1">
                <span>8 AM</span>
                <span>2 PM</span>
                <span>8 PM</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Action Buttons: Compare (Killer Feature) & Report */}
      <div className="mt-4 pt-3 border-t border-lavender-100 flex flex-col gap-2">
        <button
          onClick={() => onOpenCompare(location)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-bold text-xs sm:text-sm shadow-soft transition-all group"
        >
          <GitCompare className="w-4 h-4 transition-transform group-hover:rotate-12" />
          <span>Compare nearby options</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReport(location)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-lavender-50 border border-lavender-200 text-charcoal-700 font-semibold text-xs shadow-soft-sm transition-all"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-lavender-600" />
            <span>Report current wait</span>
          </button>

          <button
            onClick={() => onOpenWhyEstimate(location)}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-white hover:bg-lavender-50 border border-lavender-200 text-charcoal-600 font-medium text-xs shadow-soft-sm transition-all"
            title="How this estimate works"
          >
            <HelpCircle className="w-3.5 h-3.5 text-charcoal-400" />
            <span className="hidden sm:inline">Why?</span>
          </button>
        </div>
      </div>
    </div>
  );
};
