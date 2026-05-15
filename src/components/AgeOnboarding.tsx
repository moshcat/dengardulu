'use client';

import { useState, useEffect } from 'react';
import { messages, Lang } from '@/i18n/messages';

export function AgeOnboarding({ lang, onComplete }: { lang: Lang; onComplete: (isElderly: boolean) => void }) {
  const [shown, setShown] = useState(false);
  const t = messages[lang];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem('dengardulu_age_onboarding_shown');
    if (!seen) {
      setShown(true);
    }
  }, []);

  const handleYes = () => {
    localStorage.setItem('dengardulu_age_onboarding_shown', 'true');
    document.documentElement.setAttribute('data-elderly', 'true');
    localStorage.setItem('dengardulu_elderly', 'true');
    setShown(false);
    onComplete(true);
  };

  const handleNo = () => {
    localStorage.setItem('dengardulu_age_onboarding_shown', 'true');
    document.documentElement.setAttribute('data-elderly', 'false');
    localStorage.setItem('dengardulu_elderly', 'false');
    setShown(false);
    onComplete(false);
  };

  if (!shown) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="age-dialog-title"
      aria-describedby="age-dialog-desc"
    >
      <div className="bg-[var(--color-canvas)] rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-lg border-2 border-[var(--color-ink)]/10">
        <h2
          id="age-dialog-title"
          className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] mb-4"
        >
          {lang === 'bm' ? 'Selamat Datang' : 'Welcome'}
        </h2>

        <p
          id="age-dialog-desc"
          className="text-[15px] sm:text-base text-[var(--color-granite)] leading-relaxed mb-6"
        >
          {lang === 'bm'
            ? 'Adakah anda berusia 50 tahun ke atas? Kami ada mod khusus dengan huruf lebih besar dan interface yang lebih mudah untuk pengguna seperti anda.'
            : 'Are you 50 years old or older? We have a special Easy Mode with larger text and a simpler interface designed for you.'}
        </p>

        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={handleNo}
            className="flex-1 px-4 py-3 sm:py-4 rounded-xl border-2 border-[var(--color-ink)] text-[var(--color-ink)] font-semibold hover:bg-[var(--color-ink)]/5 active:bg-[var(--color-ink)]/10 transition-colors text-sm sm:text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
            aria-label={lang === 'bm' ? 'Tidak' : 'No'}
          >
            {lang === 'bm' ? 'Tidak' : 'No'}
          </button>
          <button
            onClick={handleYes}
            className="flex-1 px-4 py-3 sm:py-4 rounded-xl bg-[var(--color-ink)] text-[var(--color-canvas)] font-semibold hover:bg-[var(--color-charcoal)] active:bg-black transition-colors text-sm sm:text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
            aria-label={lang === 'bm' ? 'Ya' : 'Yes'}
          >
            {lang === 'bm' ? 'Ya' : 'Yes'}
          </button>
        </div>
      </div>
    </div>
  );
}
