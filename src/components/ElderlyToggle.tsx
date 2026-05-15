'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { Lang, messages } from '@/i18n/messages';

export function ElderlyToggle({ lang }: { lang: Lang }) {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = messages[lang];

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('dengardulu_elderly');
    if (saved === 'true') {
      setEnabled(true);
      document.documentElement.setAttribute('data-elderly', 'true');
    }
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    document.documentElement.setAttribute('data-elderly', String(next));
    localStorage.setItem('dengardulu_elderly', String(next));
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-[12px] font-medium border transition-colors inline-flex items-center gap-1 sm:gap-1.5 ${
        enabled
          ? 'bg-[var(--color-ink)] text-[var(--color-canvas)] border-[var(--color-ink)]'
          : 'bg-[var(--color-lifted)] border-[var(--color-border)] hover:bg-[var(--color-bone)]'
      }`}
      title={t.elderly_mode}
    >
      <Eye size={12} className="sm:w-[14px] sm:h-[14px]" />
      <span className="hidden sm:inline">{t.elderly_mode}</span>
    </button>
  );
}
