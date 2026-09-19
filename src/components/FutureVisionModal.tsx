import React from 'react';
import { X, Globe2, Sparkles, MapPin, Building2, TrendingUp, Layers } from 'lucide-react';

interface FutureVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FutureVisionModal: React.FC<FutureVisionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const targetCities = [
    { name: 'Kolkata', status: 'Live MVP', isLive: true, hubs: '100+ Seeded Hubs' },
    { name: 'Mumbai', status: 'Next Phase', isLive: false, hubs: 'Suburban & BMC Network' },
    { name: 'Delhi NCR', status: 'Planned', isLive: false, hubs: 'DTC, AIIMS & RTO Hubs' },
    { name: 'Bengaluru', status: 'Planned', isLive: false, hubs: 'BMRCL & Tech Corridors' },
    { name: 'Hyderabad', status: 'Planned', isLive: false, hubs: 'TSRTC & Civic Portals' },
    { name: 'Chennai', status: 'Planned', isLive: false, hubs: 'Southern Railway & Taluk Offices' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-lavender-200 shadow-soft-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-lavender-100 flex items-center justify-between bg-cream-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-powder text-powder-accent flex items-center justify-center">
              <Globe2 className="w-4 h-4 text-powder-accent" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-charcoal-900">
                A Waiting-Time Layer for Cities
              </h2>
              <p className="text-xs text-charcoal-500">The GhostQueue long-term roadmap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Core Vision Statement */}
          <div className="bg-lavender-50/70 rounded-2xl p-4 border border-lavender-100 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-lavender-700 block">
              The Urban Mobility Gap
            </span>
            <p className="text-xs text-charcoal-700 leading-relaxed font-normal">
              Mapping apps have perfected estimating road transit times, but completely ignore the <strong>interior latency</strong> of destinations. A hospital or municipal office 10 minutes away can swallow 90 minutes in queues, while another location 25 minutes away clears in 15 minutes.
            </p>
            <p className="text-xs text-charcoal-800 font-semibold">
              GhostQueue exists to make waiting time transparent, predictable, and actionable.
            </p>
          </div>

          {/* Multi-City Expansion Matrix */}
          <div>
            <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider block mb-2.5">
              City Expansion Roadmap
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {targetCities.map((city) => (
                <div
                  key={city.name}
                  className={`p-3 rounded-2xl border text-left ${
                    city.isLive
                      ? 'bg-status-low-bg/60 border-status-low-border shadow-soft-sm'
                      : 'bg-cream-50 border-lavender-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-charcoal-900">{city.name}</span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        city.isLive
                          ? 'bg-status-low-bg text-status-low-text border border-status-low-border'
                          : 'bg-cream-200 text-charcoal-500'
                      }`}
                    >
                      {city.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-charcoal-500 block">{city.hubs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Long-term capabilities */}
          <div className="space-y-2 pt-2 border-t border-lavender-100 text-xs text-charcoal-600">
            <span className="font-bold text-charcoal-800 block text-xs">
              Future Capabilities (Post-Hackathon)
            </span>
            <ul className="space-y-1.5 list-disc pl-4 text-[11.5px]">
              <li><strong>Transit API integration</strong>: Ingest live Kolkata Metro and bus telemetry to calculate real multimodal door-to-door transit times.</li>
              <li><strong>Automated civic scrapers</strong>: Integrate token display systems from PSKs, KMC, and hospitals where public displays exist.</li>
              <li><strong>Predictive appointment scheduling</strong>: Recommend the optimal hour of the week to visit any Kolkata government office.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
