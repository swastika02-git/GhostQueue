import React, { useState } from 'react';
import { X, Check, Users, Monitor, Sparkles, MessageSquare, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LocationWithTravel } from '../types';

interface ReportWaitModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationWithTravel | null;
  onSubmitReport: (
    locationId: string,
    waitTimeMinutes: number,
    peopleVisible?: number,
    activeCounters?: number,
    serviceType?: string,
    note?: string
  ) => void;
}

export const ReportWaitModal: React.FC<ReportWaitModalProps> = ({
  isOpen,
  onClose,
  location,
  onSubmitReport,
}) => {
  const [selectedRange, setSelectedRange] = useState<number | null>(null);
  const [peopleCount, setPeopleCount] = useState<string>('');
  const [countersCount, setCountersCount] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !location) return null;

  const waitTiers = [
    { label: 'No queue (0–5 min)', minutes: 3, badge: 'Fastest' },
    { label: '<15 min', minutes: 12, badge: 'Low' },
    { label: '15–30 min', minutes: 22, badge: 'Moderate' },
    { label: '30–60 min', minutes: 45, badge: 'High' },
    { label: '60+ min', minutes: 75, badge: 'Heavy' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRange === null) return;

    onSubmitReport(
      location.id,
      selectedRange,
      peopleCount ? parseInt(peopleCount, 10) : undefined,
      countersCount ? parseInt(countersCount, 10) : undefined,
      serviceType || undefined,
      note || undefined
    );

    // Trigger celebration confetti
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#8E7DBE', '#F68C7E', '#58AB78', '#E09F3E'],
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setSelectedRange(null);
      setPeopleCount('');
      setCountersCount('');
      setServiceType('');
      setNote('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-lavender-200 shadow-soft-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-lavender-100 flex items-center justify-between bg-cream-50/50">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-lavender-700 block">
              Crowdsourced Observation
            </span>
            <h2 className="text-base font-extrabold text-charcoal-900">
              Report current wait at {location.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-status-low-bg text-status-low-text border border-status-low-border flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-charcoal-900">Thank you!</h3>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-xs mx-auto leading-relaxed font-medium">
              Thanks — your observation helps improve Kolkata's waiting-time estimates in real-time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Wait time tier selection */}
            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-2">
                What is the current estimated wait? <span className="text-status-high-dot">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {waitTiers.map((tier) => {
                  const isSelected = selectedRange === tier.minutes;
                  return (
                    <button
                      type="button"
                      key={tier.label}
                      onClick={() => setSelectedRange(tier.minutes)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-lavender-600 text-white border-lavender-600 shadow-soft-sm scale-[1.01]'
                          : 'bg-cream-50 hover:bg-lavender-50/50 text-charcoal-800 border-lavender-100'
                      }`}
                    >
                      <span>{tier.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-cream-200 text-charcoal-500'
                      }`}>
                        {tier.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional details */}
            <div className="pt-2 border-t border-lavender-100 space-y-3">
              <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
                Optional Context (Improves Confidence)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-charcoal-600 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-charcoal-400" />
                    People visible in line
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 12"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(e.target.value)}
                    className="w-full bg-cream-50 text-xs px-3 py-2 rounded-xl border border-lavender-100 focus:outline-none focus:border-lavender-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-charcoal-600 mb-1 flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-charcoal-400" />
                    Active counters open
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 5"
                    value={countersCount}
                    onChange={(e) => setCountersCount(e.target.value)}
                    className="w-full bg-cream-50 text-xs px-3 py-2 rounded-xl border border-lavender-100 focus:outline-none focus:border-lavender-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-charcoal-600 mb-1">
                  Specific service / counter (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tatkal PRS counter, Biometrics desk, Blood draw..."
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-cream-50 text-xs px-3 py-2 rounded-xl border border-lavender-100 focus:outline-none focus:border-lavender-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-charcoal-600 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-charcoal-400" />
                  Quick observation note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Token machine rebooted, moving rapidly"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-cream-50 text-xs px-3 py-2 rounded-xl border border-lavender-100 focus:outline-none focus:border-lavender-400"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={selectedRange === null}
                className={`w-full py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center justify-center gap-2 ${
                  selectedRange === null
                    ? 'bg-cream-200 text-charcoal-400 cursor-not-allowed'
                    : 'bg-lavender-600 hover:bg-lavender-700 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Submit Wait Observation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
