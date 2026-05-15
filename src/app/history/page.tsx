'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { NavBar } from '@/components/NavBar';
import { getHistory, clearHistory, type HistoryEntry } from '@/lib/history';
import { ResultReport } from '@/components/ResultReport';
import { messages, Lang } from '@/i18n/messages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      <NavBar lang={lang} onLangChange={setLang} />

      <main id="main-content" className="max-w-2xl mx-auto px-4 sm:px-6" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', paddingBottom: '2rem' }}>
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[16px] text-[var(--color-slate)] mb-6">{t.history_empty}</p>
            <Button variant="ink-pill" size="pill" nativeButton={false} render={<Link href="/analyze" />}>
              Start Analysis
            </Button>
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
                          <Badge
                            variant={
                              entry.verdict === 'HIGH'
                                ? 'verdict-high'
                                : entry.verdict === 'MEDIUM'
                                ? 'verdict-medium'
                                : 'verdict-low'
                            }
                          >
                            {entry.verdict} ({entry.score}/100)
                          </Badge>
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
              <Button variant="outline-pill" size="pill" onClick={handleClear}>
                <Trash2 size={16} />
                {t.history_clear}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
