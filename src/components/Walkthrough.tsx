'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/i18n/messages';
import type { WalkthroughStep } from '@/lib/walkthrough-steps';

type Rect = { top: number; left: number; width: number; height: number };

export function Walkthrough({
  steps,
  lang,
  storageKey,
  onComplete,
}: {
  steps: WalkthroughStep[];
  lang: Lang;
  storageKey: string;
  onComplete?: () => void;
}) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(storageKey)) {
      const timer = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const measure = useCallback(() => {
    const s = steps[step];
    if (!s?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(s.target);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const pad = 8;
    setRect({
      top: r.top - pad,
      left: r.left - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
  }, [step, steps]);

  useEffect(() => {
    if (!active) return;
    measure();

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, measure]);

  useEffect(() => {
    if (!active) return;
    const s = steps[step];
    if (!s?.target) return;
    const el = document.querySelector(s.target);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(measure, 400);
    return () => clearTimeout(timer);
  }, [active, step, steps, measure]);

  const finish = useCallback(() => {
    setActive(false);
    localStorage.setItem(storageKey, '1');
    onComplete?.();
  }, [storageKey, onComplete]);

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const restart = useCallback(() => {
    setStep(0);
    setActive(true);
  }, []);

  useEffect(() => {
    const handler = () => restart();
    window.addEventListener('walkthrough:restart', handler);
    return () => window.removeEventListener('walkthrough:restart', handler);
  }, [restart]);

  if (!active) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const title = lang === 'bm' ? current.title_bm : current.title_en;
  const desc = lang === 'bm' ? current.desc_bm : current.desc_en;

  const tooltipStyle: React.CSSProperties = rect
    ? {
        position: 'fixed',
        top: rect.top + rect.height + 12,
        left: Math.max(16, Math.min(rect.left, window.innerWidth - 320)),
        zIndex: 102,
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 102,
      };

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 z-[100] transition-all duration-300"
        style={{ backgroundColor: 'rgba(20, 20, 19, 0.6)' }}
        onClick={finish}
      />

      {/* Spotlight cutout */}
      {rect && (
        <div
          className="fixed z-[101] rounded-2xl ring-4 ring-[var(--color-signal-light)] transition-all duration-300"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            backgroundColor: 'transparent',
            boxShadow: '0 0 0 9999px rgba(20, 20, 19, 0.6)',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="w-[300px] bg-[var(--color-canvas)] rounded-3xl p-5 shadow-2xl transition-all duration-300"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={finish}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-slate)] hover:bg-[var(--color-lifted)] transition-colors"
          aria-label="Close tour"
        >
          <X size={14} />
        </button>

        {/* Step counter */}
        <div className="flex gap-1.5 mb-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 bg-[var(--color-signal)]'
                  : i < step
                  ? 'w-3 bg-[var(--color-signal-light)]'
                  : 'w-3 bg-[var(--color-border)]'
              }`}
            />
          ))}
        </div>

        <h3 className="text-[16px] font-bold text-[var(--color-ink)] mb-1.5">{title}</h3>
        <p className="text-[13px] text-[var(--color-slate)] leading-[1.5] mb-4">{desc}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            className={`text-[12px] font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors ${
              step === 0 ? 'invisible' : ''
            }`}
          >
            {lang === 'bm' ? 'Kembali' : 'Back'}
          </button>

          <Button
            variant="ink-pill"
            size="pill-sm"
            onClick={next}
            className="gap-1.5"
          >
            {isLast
              ? lang === 'bm' ? 'Selesai' : 'Done'
              : lang === 'bm' ? 'Seterusnya' : 'Next'}
            {isLast ? <Check size={14} /> : <ArrowRight size={14} />}
          </Button>
        </div>
      </div>
    </>
  );
}
