'use client';

import { messages, Lang } from '@/i18n/messages';
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

type Verdict = 'LOW' | 'MEDIUM' | 'HIGH';

export function VerdictBadge({
  verdict,
  score,
  headline,
  lang,
}: {
  verdict: Verdict;
  score: number;
  headline: string;
  lang: Lang;
}) {
  const t = messages[lang];
  const label =
    verdict === 'HIGH' ? t.verdict_high : verdict === 'MEDIUM' ? t.verdict_medium : t.verdict_low;
  const Icon =
    verdict === 'HIGH' ? ShieldAlert : verdict === 'MEDIUM' ? ShieldQuestion : ShieldCheck;

  const toneClass =
    verdict === 'HIGH'
      ? 'bg-[#FCE7E9] border-[#EB001B]/30 text-[#EB001B]'
      : verdict === 'MEDIUM'
      ? 'bg-[#FFF1E6] border-[var(--color-signal)]/30 text-[var(--color-signal)]'
      : 'bg-[#E6F4EC] border-[#0A7A3D]/30 text-[#0A7A3D]';

  const barColor =
    verdict === 'HIGH'
      ? 'bg-[#EB001B]'
      : verdict === 'MEDIUM'
      ? 'bg-[var(--color-signal)]'
      : 'bg-[#0A7A3D]';

  return (
    <div className={`rounded-[28px] md:rounded-[40px] border p-5 sm:p-8 md:p-10 ${toneClass}`}>
      {/* Mobile: stacked layout */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
        <div className="flex items-center gap-4 sm:block">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/60 flex items-center justify-center shrink-0">
            <Icon size={24} strokeWidth={1.8} className="sm:w-8 sm:h-8" />
          </div>
          {/* Score — inline on mobile, separate column on desktop */}
          <div className="sm:hidden">
            <div className="text-[40px] font-medium leading-none tracking-[-0.02em]">
              {score}<span className="text-[14px] opacity-60 ml-0.5">/100</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="eyebrow mb-1 opacity-80">
            <span>{t.suspicion_score}</span>
          </div>
          <div className="text-[26px] sm:text-[32px] md:text-[40px] font-medium leading-[1.1] tracking-[-0.02em] mb-1.5">
            {label}
          </div>
          <p className="text-[14px] sm:text-[15px] opacity-85 leading-[1.45]">{headline}</p>
        </div>

        {/* Score — right column on sm+ */}
        <div className="hidden sm:block text-right shrink-0">
          <div className="text-[48px] md:text-[64px] font-medium leading-none tracking-[-0.02em]">
            {score}
          </div>
          <div className="text-[11px] font-bold tracking-[0.04em] uppercase opacity-70 mt-1">
            / 100
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 h-1.5 bg-black/10 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ${barColor}`}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}
