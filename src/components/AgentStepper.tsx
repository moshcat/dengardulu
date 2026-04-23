'use client';

import { useState } from 'react';
import { Check, Loader2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { messages, Lang } from '@/i18n/messages';

export type StepStatus = 'pending' | 'active' | 'done' | 'error';

export type StepperStage = {
  id: string;
  label_bm: string;
  label_en: string;
  status: StepStatus;
  data?: unknown;
};

export function AgentStepper({
  stages,
  lang,
}: {
  stages: StepperStage[];
  lang: Lang;
}) {
  return (
    <div className="w-full space-y-3" aria-live="polite" aria-atomic="false">
      {stages.map((s, i) => (
        <StageRow key={s.id} stage={s} lang={lang} index={i} />
      ))}
    </div>
  );
}

function StageRow({
  stage,
  lang,
  index,
}: {
  stage: StepperStage;
  lang: Lang;
  index: number;
}) {
  const t = messages[lang];
  const [open, setOpen] = useState(false);
  const label = lang === 'bm' ? stage.label_bm : stage.label_en;
  const hasData = stage.data !== undefined && stage.data !== null;

  const containerClass = [
    'rounded-[24px] border p-5 transition-all',
    stage.status === 'active' &&
      'bg-[var(--color-ink)] border-transparent text-[var(--color-canvas)] shadow-[0_24px_48px_0_rgba(20,20,19,0.12)]',
    stage.status === 'done' &&
      'bg-[var(--color-lifted)] border-[#0A7A3D]/30',
    stage.status === 'pending' &&
      'bg-transparent border-[var(--color-border)] border-dashed',
    stage.status === 'error' &&
      'bg-[#FCE7E9] border-[var(--color-mc-red)]/30',
  ]
    .filter(Boolean)
    .join(' ');

  const numberClass = [
    'w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-semibold shrink-0',
    stage.status === 'active' && 'bg-[var(--color-signal-light)] text-white',
    stage.status === 'done' && 'bg-[#E6F4EC] text-[#0A7A3D]',
    stage.status === 'pending' && 'bg-transparent border border-[var(--color-taupe)] text-[var(--color-slate)]',
    stage.status === 'error' && 'bg-[var(--color-mc-red)] text-white',
  ]
    .filter(Boolean)
    .join(' ');

  const labelClass = [
    'font-medium text-[16px] leading-[1.3]',
    stage.status === 'pending' && 'text-[var(--color-slate)]',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-4">
        <div className={numberClass}>
          {stage.status === 'active' && <Loader2 size={16} className="animate-spin" />}
          {stage.status === 'done' && <Check size={16} />}
          {stage.status === 'pending' && String(index + 1).padStart(2, '0')}
          {stage.status === 'error' && <AlertCircle size={16} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className={labelClass}>{label}</div>
        </div>
        {hasData && stage.status !== 'pending' && (
          <button
            onClick={() => setOpen((o) => !o)}
            className={`inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors ${
              stage.status === 'active'
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-[var(--color-canvas)] text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            {open ? t.hide_agent_output : t.show_agent_output}
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>
      {open && hasData && (
        <pre
          className={`mt-4 text-[11px] leading-[1.5] p-4 rounded-[16px] overflow-auto max-h-64 font-mono ${
            stage.status === 'active'
              ? 'bg-white/5 text-white/80 border border-white/10'
              : 'bg-[var(--color-canvas)] text-[var(--color-slate)] border border-[var(--color-border)]'
          }`}
        >
          {JSON.stringify(stage.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
