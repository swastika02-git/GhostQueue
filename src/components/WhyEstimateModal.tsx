import React from 'react';
import { X, HelpCircle, Activity, Calendar, Clock, MonitorCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LocationWithTravel, PredictionBreakdown } from '../types';

interface WhyEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationWithTravel | null;
  breakdown: PredictionBreakdown | null;
}

export const WhyEstimateModal: React.FC<WhyEstimateModalProps> = ({
  isOpen,
  onClose,
  location,
  breakdown,
}) => {
  if (!isOpen || !location) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-lavender-200 shadow-soft-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-lavender-100 flex items-center justify-between bg-cream-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-lavender-100 text-lavender-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-charcoal-900">
                Why {location.current_wait} minutes?
              </h2>
              <p className="text-xs text-charcoal-500">
                Transparent prediction explanation for {location.name}
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

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Summary Box */}
          <div className="bg-lavender-50/70 rounded-2xl p-4 border border-lavender-100 text-xs text-charcoal-700 space-y-2">
            <div className="flex items-center justify-between font-bold text-charcoal-900">
              <span>Confidence Score</span>
              <span className="text-lavender-700">{location.confidence}% (Reliable)</span>
            </div>
            <div className="w-full bg-cream-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-lavender-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${location.confidence}%` }}
              />
            </div>
            <p className="text-[11px] text-charcoal-500 leading-relaxed">
              Calculated using fresh crowd observations (decay-weighted), the day's historical curve, and current counter staffing ratio.
            </p>
          </div>

          {/* Breakdown Factor Cards */}
          <div className="space-y-2.5">
            {/* 1. Observations */}
            <div className="p-3 rounded-2xl bg-white border border-lavender-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-status-low-bg text-status-low-text flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-charcoal-900">Crowdsourced Signals</div>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  {location.observations_count} recent reports recorded. Reports under 45 minutes old receive high exponential decay weighting.
                </p>
              </div>
            </div>

            {/* 2. Diurnal Temporal Pattern */}
            <div className="p-3 rounded-2xl bg-white border border-lavender-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-peach-light text-peach-accent flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-charcoal-900">Day & Time Baseline</div>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  Typical wait for this slot is {location.typical_wait} min. Historical traffic and queue surges are factored into the base prediction.
                </p>
              </div>
            </div>

            {/* 3. Counter Throughput */}
            <div className="p-3 rounded-2xl bg-white border border-lavender-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-powder-light text-powder-accent flex items-center justify-center shrink-0 mt-0.5">
                <MonitorCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-charcoal-900">Counter Throughput</div>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  {location.active_counters} of {location.number_of_counters} counters currently active. Average service velocity is ~{location.average_service_time} min per client.
                </p>
              </div>
            </div>
          </div>

          {/* Honest Transparency Note */}
          <div className="bg-cream-50 p-3 rounded-2xl border border-lavender-100 flex items-start gap-2 text-xs text-charcoal-500">
            <ShieldCheck className="w-4 h-4 text-charcoal-400 shrink-0 mt-0.5" />
            <p>
              GhostQueue never invents fake certainty. When confidence drops below 30%, locations enter our <em>"We're still learning this location"</em> state until new verified community reports arrive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
