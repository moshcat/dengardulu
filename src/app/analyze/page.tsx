'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { NavBar } from '@/components/NavBar';
import { Dropzone } from '@/components/Dropzone';
import { AgentStepper, StepperStage } from '@/components/AgentStepper';
import { ResultReport } from '@/components/ResultReport';
import { saveAnalysis } from '@/lib/history';
import { messages, Lang } from '@/i18n/messages';
import { Walkthrough } from '@/components/Walkthrough';
import { analyzeSteps } from '@/lib/walkthrough-steps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('shared');
    if (!sharedId) return;

    fetch(`/share-target?id=${sharedId}`)
      .then(async (res) => {
        if (!res.ok) {
          console.error('share-target GET failed:', res.status, await res.text());
          return;
        }
        const blob = await res.blob();
        const ext = blob.type.includes('ogg') ? 'opus' : blob.type.split('/')[1] || 'audio';
        setFile(new File([blob], `shared-audio.${ext}`, { type: blob.type || 'audio/ogg' }));
        window.history.replaceState({}, '', '/analyze');
      })
      .catch((err) => console.error('share-target fetch error:', err));
  }, []);

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
        const analysis = event.data as FullAnalysis;
        setResult(analysis);
        saveAnalysis(analysis, { phone, role });
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
    <div className="min-h-screen flex flex-col">
      <NavBar lang={lang} onLangChange={setLang} />

      <main id="main-content" className="flex-1 pb-16 px-6" style={{ paddingTop: 'calc(var(--nav-height) + 1rem)' }}>
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

              <div data-tour="dropzone">
                <Dropzone onFile={setFile} file={file} lang={lang} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div data-tour="phone-input">
                  <label
                    htmlFor="phone"
                    className="block text-[13px] font-bold tracking-[0.02em] uppercase text-[var(--color-slate)] mb-3"
                  >
                    {t.phone_label}
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    variant="pill"
                    placeholder={t.phone_placeholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div data-tour="role-selector">
                  <label
                    className="block text-[13px] font-bold tracking-[0.02em] uppercase text-[var(--color-slate)] mb-3"
                    id="role-label"
                  >
                    {t.role_label}
                  </label>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-labelledby="role-label"
                  >
                    {ROLES.map((r) => (
                      <Badge
                        key={r}
                        variant="chip"
                        role="radio"
                        aria-checked={role === r}
                        render={<button type="button" />}
                        onClick={() => setRole(r)}
                        className={`cursor-pointer transition-all ${
                          role === r
                            ? 'bg-[var(--color-ink)] text-[var(--color-canvas)] border-[var(--color-ink)]'
                            : ''
                        }`}
                      >
                        {t[`role_${r}` as keyof typeof t]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                variant="ink-pill"
                size="pill-lg"
                disabled={!file}
                onClick={startAnalysis}
                data-tour="start-btn"
              >
                <Sparkles size={18} />
                {t.start_analysis}
              </Button>
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
              <Alert variant="destructive-pill-lg">
                <AlertCircle size={20} />
                <div className="flex-1 min-w-0">
                  <AlertTitle className="font-medium mb-1">
                    {t.error_generic}
                  </AlertTitle>
                  <AlertDescription className="text-[13px] text-[var(--color-slate)] font-mono break-all">
                    {errorMsg || 'unknown'}
                  </AlertDescription>
                </div>
              </Alert>
              <AgentStepper stages={stages} lang={lang} />
              <Button variant="outline-pill" size="pill" onClick={restart}>
                {t.analyze_another}
              </Button>
            </div>
          )}

          {/* ───────── DONE ───────── */}
          {phase === 'done' && result && (
            <ResultReport analysis={result} lang={lang} onRestart={restart} />
          )}
        </div>
      </main>

      <footer className="bg-[var(--color-ink)] text-white/60 text-[12px] text-center py-6 px-6">
        <p className="max-w-2xl mx-auto leading-[1.5]">{t.footer_disclaimer}</p>
      </footer>

      {phase === 'idle' && (
        <Walkthrough steps={analyzeSteps} lang={lang} storageKey="dengardulu_tour_analyze" />
      )}
    </div>
  );
}
