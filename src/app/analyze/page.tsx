'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Dropzone } from '@/components/Dropzone';
import { AgentStepper, StepperStage } from '@/components/AgentStepper';
import { ResultReport } from '@/components/ResultReport';
import { messages, Lang } from '@/i18n/messages';
import type { FullAnalysis } from '@/ai/schemas';

type Phase = 'idle' | 'analyzing' | 'done' | 'error';

const INITIAL_STAGES = (): StepperStage[] => [
  {
    id: 'transcribe',
    label_bm: 'Menyalin dan menganalisis suara…',
    label_en: 'Transcribing & characterizing voice…',
    status: 'pending',
  },
  {
    id: 'content',
    label_bm: 'Memeriksa corak penipuan Malaysia…',
    label_en: 'Checking Malaysian scam patterns…',
    status: 'pending',
  },
  {
    id: 'phone',
    label_bm: 'Memeriksa pangkalan data nombor scam…',
    label_en: 'Checking scam phone database…',
    status: 'pending',
  },
  {
    id: 'challenge',
    label_bm: 'Menjana soalan pengesahan peribadi…',
    label_en: 'Generating verification questions…',
    status: 'pending',
  },
  {
    id: 'safety',
    label_bm: 'Menyusun rancangan keselamatan…',
    label_en: 'Assembling safety plan…',
    status: 'pending',
  },
];

const ROLES = ['boss', 'family', 'friend', 'bank', 'police', 'service', 'unknown'] as const;

export default function AnalyzePage() {
  const [lang, setLang] = useState<Lang>('bm');
  const t = messages[lang];
  const [phase, setPhase] = useState<Phase>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string>('unknown');
  const [stages, setStages] = useState<StepperStage[]>(INITIAL_STAGES());
  const [result, setResult] = useState<FullAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateStage = useCallback(
    (id: string, patch: Partial<StepperStage>) => {
      setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    },
    []
  );

  const startAnalysis = async () => {
    if (!file) return;
    setPhase('analyzing');
    setStages(INITIAL_STAGES());
    setResult(null);
    setErrorMsg(null);

    const form = new FormData();
    form.append('audio', file);
    form.append('phone', phone);
    form.append('role', role);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: form });
      if (!res.ok || !res.body) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const raw of events) {
          if (!raw.trim()) continue;
          const line = raw.replace(/^data: /, '').trim();
          if (!line) continue;
          let event: { stage: string; data: unknown };
          try {
            event = JSON.parse(line);
          } catch {
            continue;
          }

          handleEvent(event);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message);
      setPhase('error');
    }
  };

  const handleEvent = (event: { stage: string; data: unknown }) => {
    switch (event.stage) {
      case 'transcribing':
        updateStage('transcribe', { status: 'active' });
        break;
      case 'transcribed':
        updateStage('transcribe', { status: 'done', data: event.data });
        break;
      case 'content_analyzing':
        updateStage('content', { status: 'active' });
        break;
      case 'content_analyzed':
        updateStage('content', { status: 'done', data: event.data });
        break;
      case 'phone_looking_up':
        updateStage('phone', { status: 'active' });
        break;
      case 'phone_looked_up':
        updateStage('phone', { status: 'done', data: event.data });
        break;
      case 'challenge_generating':
        updateStage('challenge', { status: 'active' });
        break;
      case 'challenge_generated':
        updateStage('challenge', { status: 'done', data: event.data });
        break;
      case 'safety_planning':
        updateStage('safety', { status: 'active' });
        break;
      case 'done':
        updateStage('safety', { status: 'done', data: event.data });
        setResult(event.data as FullAnalysis);
        setPhase('done');
        break;
      case 'error':
        setStages((prev) =>
          prev.map((s) => (s.status === 'active' ? { ...s, status: 'error' } : s))
        );
        setErrorMsg(((event.data as { message: string }) ?? { message: 'unknown' }).message);
        setPhase('error');
        break;
    }
  };

  const restart = () => {
    setPhase('idle');
    setFile(null);
    setPhone('');
    setRole('unknown');
    setStages(INITIAL_STAGES());
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <ShieldCheck className="size-5 text-primary" />
            DengarDulu
          </Link>
          <div className="flex gap-1 text-sm">
            <button
              onClick={() => setLang('bm')}
              className={`px-2 py-1 rounded ${lang === 'bm' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              BM
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl w-full mx-auto px-4 py-6 md:py-10 flex-1 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Home
        </Link>

        {phase === 'idle' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t.analyze_title}</h1>
            <Dropzone onFile={setFile} lang={lang} />

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="phone">
                {t.phone_label}
              </label>
              <input
                id="phone"
                type="tel"
                placeholder={t.phone_placeholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.role_label}</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                      role === r
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {t[`role_${r}` as keyof typeof t]}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={!file}
              onClick={startAnalysis}
            >
              {t.start_analysis} →
            </Button>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              {lang === 'bm' ? 'Menganalisis…' : 'Analyzing…'}
            </h2>
            <AgentStepper stages={stages} lang={lang} />
          </div>
        )}

        {phase === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{errorMsg || t.error_generic}</AlertDescription>
            </Alert>
            <AgentStepper stages={stages} lang={lang} />
            <Button variant="outline" onClick={restart}>
              {t.analyze_another}
            </Button>
          </div>
        )}

        {phase === 'done' && result && (
          <ResultReport analysis={result} lang={lang} onRestart={restart} />
        )}
      </div>

      <footer className="border-t text-xs text-muted-foreground text-center py-4">
        <p>{t.footer_disclaimer}</p>
      </footer>
    </main>
  );
}
