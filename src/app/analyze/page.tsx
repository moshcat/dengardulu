'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { LogoWordmark } from '@/components/Logo';
import { Dropzone } from '@/components/Dropzone';
import { AgentStepper, StepperStage } from '@/components/AgentStepper';
import { ResultReport } from '@/components/ResultReport';
import { messages, Lang } from '@/i18n/messages';
import type { FullAnalysis } from '@/ai/schemas';

type Phase = 'idle' | 'analyzing' | 'done' | 'error';

const INITIAL_STAGES = (): StepperStage[] => [
  {
    id: 'transcribe',
    label_bm: 'Menyalin dan menganalisis suara',
    label_en: 'Transcribing & characterizing voice',
    status: 'pending',
  },
  {
    id: 'content',
    label_bm: 'Memeriksa corak penipuan Malaysia',
    label_en: 'Checking Malaysian scam patterns',
    status: 'pending',
  },
  {
    id: 'phone',
    label_bm: 'Memeriksa pangkalan data nombor scam',
    label_en: 'Checking scam phone database',
    status: 'pending',
  },
  {
    id: 'challenge',
    label_bm: 'Menjana soalan pengesahan peribadi',
    label_en: 'Generating verification questions',
    status: 'pending',
  },
  {
    id: 'safety',
    label_bm: 'Menyusun rancangan keselamatan',
    label_en: 'Assembling safety plan',
    status: 'pending',
  },
];

const ROLES = ['boss', 'family', 'friend', 'bank', 'police', 'service', 'unknown'] as const;

export default function AnalyzePage() {
  const [lang, setLang] = useState<Lang>('en');
  const t = messages[lang];
  const [phase, setPhase] = useState<Phase>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string>('unknown');
  const [stages, setStages] = useState<StepperStage[]>(INITIAL_STAGES());
  const [result, setResult] = useState<FullAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateStage = useCallback((id: string, patch: Partial<StepperStage>) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

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
        setErrorMsg(
          ((event.data as { message: string }) ?? { message: 'unknown' }).message
        );
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
    <main className="min-h-screen flex flex-col">
      {/* Floating nav */}
      <nav className="floating-nav">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <LogoWordmark size={28} />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              lang === 'en'
                ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]'
                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('bm')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              lang === 'bm'
                ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]'
                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            BM
          </button>
        </div>
      </nav>

      <div className="flex-1 pt-32 pb-16 px-6">
        <div className="max-w-[880px] w-full mx-auto space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors"
          >
            <ArrowLeft size={16} /> {lang === 'bm' ? 'Kembali' : 'Back'}
          </Link>

          {/* ───────── IDLE ───────── */}
          {phase === 'idle' && (
            <div className="space-y-10">
              <div>
                <div className="eyebrow mb-4">
                  <span>Analisis</span>
                </div>
                <h1 className="mb-4">{t.analyze_title}</h1>
                <p className="text-[17px] text-[var(--color-slate)] max-w-xl leading-[1.5]">
                  {lang === 'bm'
                    ? 'Muat naik nota suara mencurigakan. Dalam 15 saat, kami berikan verdict, senarai red flag, dan soalan pengesahan peribadi.'
                    : 'Upload a suspicious voice note. In 15 seconds, get a verdict, red flag list, and a personalized verification question.'}
                </p>
              </div>

              <Dropzone onFile={setFile} lang={lang} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-[13px] font-bold tracking-[0.02em] uppercase text-[var(--color-slate)] mb-3"
                  >
                    {t.phone_label}
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder={t.phone_placeholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-full border border-[var(--color-ink)]/20 bg-white px-5 py-3 text-[15px] focus:border-[var(--color-ink)] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold tracking-[0.02em] uppercase text-[var(--color-slate)] mb-3">
                    {t.role_label}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`ghost-chip cursor-pointer transition-all ${
                          role === r ? 'chip-selected' : ''
                        }`}
                      >
                        {t[`role_${r}` as keyof typeof t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                disabled={!file}
                onClick={startAnalysis}
                className="ink-pill w-full justify-center py-4 text-[16px]"
              >
                <Sparkles size={18} />
                {t.start_analysis}
              </button>
            </div>
          )}

          {/* ───────── ANALYZING ───────── */}
          {phase === 'analyzing' && (
            <div className="space-y-6">
              <div>
                <div className="eyebrow mb-3">
                  <span>{lang === 'bm' ? 'Memproses' : 'Processing'}</span>
                </div>
                <h2>{lang === 'bm' ? 'Menganalisis…' : 'Analyzing…'}</h2>
                <p className="text-[15px] text-[var(--color-slate)] mt-2">
                  {lang === 'bm'
                    ? 'Empat ejen AI sedang bekerja. Sila tunggu.'
                    : 'Four AI agents are working. Please wait.'}
                </p>
              </div>
              <AgentStepper stages={stages} lang={lang} />
            </div>
          )}

          {/* ───────── ERROR ───────── */}
          {phase === 'error' && (
            <div className="space-y-5">
              <div className="flex items-start gap-4 px-6 py-5 rounded-[24px] bg-[var(--color-mc-red)]/5 border border-[var(--color-mc-red)]/30">
                <AlertCircle size={20} className="text-[var(--color-mc-red)] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--color-mc-red)] mb-1">
                    {t.error_generic}
                  </div>
                  <div className="text-[13px] text-[var(--color-slate)] font-mono break-all">
                    {errorMsg || 'unknown'}
                  </div>
                </div>
              </div>
              <AgentStepper stages={stages} lang={lang} />
              <button onClick={restart} className="outline-pill">
                {t.analyze_another}
              </button>
            </div>
          )}

          {/* ───────── DONE ───────── */}
          {phase === 'done' && result && (
            <ResultReport analysis={result} lang={lang} onRestart={restart} />
          )}
        </div>
      </div>

      <footer className="bg-[var(--color-ink)] text-white/60 text-[12px] text-center py-6 px-6">
        <p className="max-w-2xl mx-auto leading-[1.5]">{t.footer_disclaimer}</p>
      </footer>
    </main>
  );
}
