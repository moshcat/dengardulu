'use client';

import { useState, useEffect } from 'react';
import { messages, Lang } from '@/i18n/messages';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function AgeOnboarding({ lang, onComplete }: { lang: Lang; onComplete: (isElderly: boolean) => void }) {
  const [shown, setShown] = useState(false);

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

  return (
    <Dialog open={shown} onOpenChange={(open) => { if (!open) handleNo(); }}>
      <DialogContent showCloseButton={false} className="rounded-[32px] max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl">
            {lang === 'bm' ? 'Selamat Datang' : 'Welcome'}
          </DialogTitle>
          <DialogDescription className="text-[15px] sm:text-base text-[var(--color-granite)] leading-relaxed">
            {lang === 'bm'
              ? 'Adakah anda berusia 50 tahun ke atas? Kami ada mod khusus dengan huruf lebih besar dan interface yang lebih mudah untuk pengguna seperti anda.'
              : 'Are you 50 years old or older? We have a special Easy Mode with larger text and a simpler interface designed for you.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline-pill"
            size="pill"
            onClick={handleNo}
            className="flex-1"
            aria-label={lang === 'bm' ? 'Tidak' : 'No'}
          >
            {lang === 'bm' ? 'Tidak' : 'No'}
          </Button>
          <Button
            variant="ink-pill"
            size="pill"
            onClick={handleYes}
            className="flex-1"
            aria-label={lang === 'bm' ? 'Ya' : 'Yes'}
          >
            {lang === 'bm' ? 'Ya' : 'Yes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
