'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { getHistory, clearHistory, type HistoryEntry } from '@/lib/history';
import { ResultReport } from '@/components/ResultReport';
import { messages, Lang } from '@/i18n/messages';

export default function HistoryPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEntries(getHistory());
  }, []);

  const handleClear = () => {
    if (confirm(messages[lang].history_clear_confirm)) {
      clearHistory();
      setEntries([]);
    }
  };

  const t = messages[lang];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <nav className="floating-nav">
        <Link href="/" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
          <ArrowLeft size={18} />
          <span className="text-[14px] font-medium">Back</span>
        </Link>
        <h1 className="text-[18px] font-medium">{t.history_title}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setLang(lang === 'bm' ? 'en' : 'bm')}
            className="px-3 py-1 rounded-full bg-[var(--color-lifted)] border border-[var(--color-border)] text-[12px] font-medium hover:bg-[var(--color-bone)] transition-colors"
          >
            {lang === 'bm' ? 'EN' : 'BM'}
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-24 sm:px-6">
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[16px] text-[var(--color-slate)] mb-6">{t.history_empty}</p>
            <Link href="/analyze" className="ink-pill inline-flex items-center gap-2">
              Start Analysis
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {entries.map((entry) => (
                <div key={entry.id}>
                  <button
                    onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                    className="w-full text-left rounded-[20px] border border-[var(--color-border)] bg-[var(--color-lifted)] p-4 hover:border-[var(--color-ink)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-[var(--color-slate)] mb-2">
                          {new Date(entry.timestamp).toLocaleString(lang === 'bm' ? 'ms-MY' : 'en-US')}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.04em] uppercase border ${
                              entry.verdict === 'HIGH'
                                ? 'border-[var(--color-mc-red)]/40 text-[var(--color-mc-red)] bg-[var(--color-mc-red)]/5'
                                : entry.verdict === 'MEDIUM'
                                ? 'border-[var(--color-signal)]/40 text-[var(--color-signal)] bg-[var(--color-signal)]/5'
                                : 'border-[var(--color-border)] text-[var(--color-slate)]'
                            }`}
                          >
                            {entry.verdict} ({entry.score}/100)
                          </span>
                        </div>
                        <p className="text-[14px] text-[var(--color-granite)] line-clamp-2">
                          &ldquo;{entry.transcript_preview}{entry.full.transcribe.transcript.length > 80 ? '…' : ''}&rdquo;
                        </p>
                      </div>
                    </div>
                  </button>
                  {expanded === entry.id && (
                    <div className="mt-4 p-6 rounded-[20px] bg-[var(--color-lifted)] border border-[var(--color-border)]">
                      <ResultReport
                        analysis={entry.full}
                        lang={lang}
                        onRestart={() => setExpanded(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <button onClick={handleClear} className="outline-pill">
                <Trash2 size={16} />
                {t.history_clear}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
