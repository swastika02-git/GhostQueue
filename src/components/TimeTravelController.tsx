import React from 'react';
import { Clock, Sun, Sunset, Moon, Play, RotateCcw } from 'lucide-react';

interface TimeTravelControllerProps {
  simulatedHour: number;
  onHourChange: (hour: number) => void;
  onResetLive: () => void;
  isLive: boolean;
}

export const TimeTravelController: React.FC<TimeTravelControllerProps> = ({
  simulatedHour,
  onHourChange,
  onResetLive,
  isLive,
}) => {
  const formatHour = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:00 ${ampm}`;
  };

  const timePresets = [
    { label: 'Morning Peak', hour: 10, icon: <Sun className="w-3 h-3 text-amber-500" /> },
    { label: 'Afternoon Lull', hour: 15, icon: <Sun className="w-3 h-3 text-yellow-600" /> },
    { label: 'Evening Surge', hour: 18, icon: <Sunset className="w-3 h-3 text-peach-accent" /> },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:px-4 sm:py-2 border border-lavender-100 shadow-soft flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-lavender-100 text-lavender-700 flex items-center justify-center shrink-0">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-extrabold text-charcoal-900 block">
            {formatHour(simulatedHour)}
          </span>
          <span className="text-[10px] text-charcoal-400 font-medium hidden sm:block">
            {isLive ? 'Live Kolkata Time' : 'Simulated Time Slot'}
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="flex-1 max-w-xs flex items-center gap-2">
        <input
          type="range"
          min="8"
          max="20"
          value={simulatedHour}
          onChange={(e) => onHourChange(parseInt(e.target.value, 10))}
          className="w-full accent-lavender-600 h-1.5 bg-cream-200 rounded-lg cursor-pointer"
          title="Slide to test diurnal queue changes across Kolkata"
        />
      </div>

      {/* Preset Quick Switches */}
      <div className="hidden lg:flex items-center gap-1.5">
        {timePresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onHourChange(preset.hour)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
              simulatedHour === preset.hour
                ? 'bg-lavender-100 text-lavender-700 border border-lavender-200'
                : 'bg-cream-50 hover:bg-cream-100 text-charcoal-600 border border-lavender-100/60'
            }`}
          >
            {preset.icon}
            <span>{preset.label}</span>
          </button>
        ))}

        {!isLive && (
          <button
            onClick={onResetLive}
            className="flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-semibold bg-cream-100 text-charcoal-500 hover:text-charcoal-800"
            title="Reset to current local time"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
