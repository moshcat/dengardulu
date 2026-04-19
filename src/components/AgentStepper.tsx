'use client';

import { useState } from 'react';
import { Check, Loader2, Circle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      {stages.map((s) => (
        <StageRow key={s.id} stage={s} lang={lang} />
      ))}
    </div>
  );
}

function StageRow({
  stage,
  lang,
}: {
  stage: StepperStage;
  lang: Lang;
}) {
  const t = messages[lang];
  const [open, setOpen] = useState(false);
  const label = lang === 'bm' ? stage.label_bm : stage.label_en;
  const hasData = stage.data !== undefined && stage.data !== null;

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 transition-colors',
        stage.status === 'active' && 'border-primary shadow-sm',
        stage.status === 'done' && 'border-green-500/40',
        stage.status === 'error' && 'border-destructive'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          {stage.status === 'active' && <Loader2 className="size-5 text-primary animate-spin" />}
          {stage.status === 'done' && <Check className="size-5 text-green-600" />}
          {stage.status === 'pending' && <Circle className="size-5 text-muted-foreground" />}
          {stage.status === 'error' && <AlertCircle className="size-5 text-destructive" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn('font-medium', stage.status === 'pending' && 'text-muted-foreground')}>
            {label}
          </div>
        </div>
        {hasData && stage.status !== 'pending' && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {open ? t.hide_agent_output : t.show_agent_output}
            {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        )}
      </div>
      {open && hasData && (
        <pre className="mt-3 text-xs bg-muted/50 p-3 rounded overflow-auto max-h-64">
          {JSON.stringify(stage.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
