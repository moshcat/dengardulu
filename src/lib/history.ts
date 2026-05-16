import type { FullAnalysis } from '@/ai/schemas';

export type HistoryEntry = {
  id: string;
  timestamp: string;
  phone: string;
  role: string;
  verdict: string;
  score: number;
  transcript_preview: string;
  full: FullAnalysis;
};

const STORAGE_KEY = 'dengardulu_history';
const MAX_ENTRIES = 10;

export function saveAnalysis(
  result: FullAnalysis,
  meta: { phone: string; role: string }
): void {
  if (typeof window === 'undefined') return;
  const entries = getHistory();
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    phone: meta.phone,
    role: meta.role,
    verdict: result.safety.verdict,
    score: result.safety.suspicion_score,
    transcript_preview: result.transcribe.transcript.slice(0, 80),
    full: result,
  };
  entries.unshift(entry);
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
