import React, { useState, useEffect } from 'react';
import { Moon, Sliders, Plus, Check } from 'lucide-react';

interface SleepTimerBarProps {
  onTimeChange?: (minutes: number) => void;
}

export const SleepTimerBar: React.FC<SleepTimerBarProps> = ({ onTimeChange }) => {
  const [minutesLeft, setMinutesLeft] = useState(28);
  const [isActive, setIsActive] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isActive || minutesLeft <= 0) return;
    const interval = setInterval(() => {
      setMinutesLeft((prev) => (prev > 1 ? prev - 1 : 0));
    }, 60000);
    return () => clearInterval(interval);
  }, [isActive, minutesLeft]);

  const addTime = (mins: number) => {
    setMinutesLeft((prev) => {
      const next = Math.min(prev + mins, 120);
      if (onTimeChange) onTimeChange(next);
      return next;
    });
    setIsActive(true);
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setMinutesLeft(val);
    if (onTimeChange) onTimeChange(val);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl">
      <div className="bg-[#121626]/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80 rounded-full px-5 py-3.5 flex items-center justify-between gap-4 text-white">
        {/* Left: Crescent Moon Icon & Label */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
            <Moon className="w-4 h-4 fill-amber-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">Sleep Timer</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {minutesLeft > 0 ? `${minutesLeft}m Left` : 'Off'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Screen dims softly when bedtime story concludes
            </span>
          </div>
        </div>

        {/* Center: Slider */}
        <div className="flex-1 max-w-xs hidden md:flex items-center gap-2">
          <input
            type="range"
            min="5"
            max="90"
            value={minutesLeft}
            onChange={handleSlider}
            className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Right: Quick +15m and Settings */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => addTime(15)}
            className="bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-white/10 active:scale-95"
          >
            <Plus className="w-3 h-3 text-amber-400" />
            <span>+15m</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full transition-colors border ${
              showSettings
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
            }`}
            title="Timer Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
