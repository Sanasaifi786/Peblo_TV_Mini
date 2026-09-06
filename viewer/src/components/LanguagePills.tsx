import React from 'react';
import { Globe } from 'lucide-react';

interface LanguagePillsProps {
  availableLanguages: string[];
  activeLanguage: string;
  onSelectLanguage: (lang: string) => void;
  size?: 'sm' | 'md';
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  hi: 'हिन्दी',
  fr: 'Français',
  ja: '日本語',
  de: 'Deutsch',
  it: 'Italiano',
};

export const LanguagePills: React.FC<LanguagePillsProps> = ({
  availableLanguages,
  activeLanguage,
  onSelectLanguage,
  size = 'md',
}) => {
  if (!availableLanguages || availableLanguages.length <= 1) {
    return null;
  }

  const isSmall = size === 'sm';

  return (
    <div className="flex items-center flex-wrap gap-1.5">
      <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mr-1">
        <Globe className="w-3.5 h-3.5 text-rose-500" />
        <span className="hidden sm:inline">Audio:</span>
      </div>

      {availableLanguages.map((lang) => {
        const isActive = lang.toLowerCase() === activeLanguage.toLowerCase();
        const label = LANGUAGE_LABELS[lang.toLowerCase()] || lang.toUpperCase();

        return (
          <button
            key={lang}
            onClick={(e) => {
              e.stopPropagation();
              onSelectLanguage(lang);
            }}
            className={`font-semibold rounded-full transition-all border ${
              isSmall ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1'
            } ${
              isActive
                ? 'bg-[#E50914] text-white border-[#E50914] shadow-md shadow-red-950/50 scale-105'
                : 'bg-zinc-800/80 text-slate-300 border-zinc-700/60 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {label} ({lang.toUpperCase()})
          </button>
        );
      })}
    </div>
  );
};
