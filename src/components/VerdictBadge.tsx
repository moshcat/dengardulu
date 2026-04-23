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
    <div className={`rounded-[40px] border p-8 md:p-10 ${toneClass}`}>
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center shrink-0">
          <Icon size={32} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="eyebrow mb-2 opacity-80">
            <span>{t.suspicion_score}</span>
          </div>
          <div className="text-[32px] md:text-[40px] font-medium leading-[1.05] tracking-[-0.02em] mb-2">
            {label}
          </div>
          <p className="text-[15px] opacity-85 leading-[1.5] max-w-xl">{headline}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[48px] md:text-[64px] font-medium leading-none tracking-[-0.02em]">
            {score}
          </div>
          <div className="text-[11px] font-bold tracking-[0.04em] uppercase opacity-70 mt-1">
            / 100
          </div>
        </div>
      </div>

      <div className="mt-6 h-1.5 bg-black/10 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ${barColor}`}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}
