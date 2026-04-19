'use client';

import { cn } from '@/lib/utils';
import { messages, Lang } from '@/i18n/messages';
import { Progress } from '@/components/ui/progress';
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
  const Icon = verdict === 'HIGH' ? ShieldAlert : verdict === 'MEDIUM' ? ShieldQuestion : ShieldCheck;

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 flex flex-col gap-4',
        verdict === 'HIGH' &&
          'bg-destructive/10 border-destructive/40 text-destructive-foreground',
        verdict === 'MEDIUM' && 'bg-amber-500/10 border-amber-500/40',
        verdict === 'LOW' && 'bg-green-500/10 border-green-500/40'
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            'size-10',
            verdict === 'HIGH' && 'text-destructive',
            verdict === 'MEDIUM' && 'text-amber-600',
            verdict === 'LOW' && 'text-green-600'
          )}
        />
        <div>
          <div
            className={cn(
              'text-2xl font-bold tracking-tight',
              verdict === 'HIGH' && 'text-destructive',
              verdict === 'MEDIUM' && 'text-amber-700 dark:text-amber-500',
              verdict === 'LOW' && 'text-green-700 dark:text-green-500'
            )}
          >
            {label}
          </div>
          <div className="text-sm text-muted-foreground">{headline}</div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{t.suspicion_score}</span>
          <span className="font-mono font-medium">{score} / 100</span>
        </div>
        <Progress value={score} className="h-2" />
      </div>
    </div>
  );
}
