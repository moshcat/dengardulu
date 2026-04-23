import { createHash } from 'node:crypto';
import type { FullAnalysis } from '@/ai/schemas';

/**
 * In-memory LRU-ish cache for full analyses keyed by SHA256 of the audio
 * buffer + caller context. Survives for the lifetime of the Cloud Run
 * instance; on cold start it rebuilds naturally as users upload.
 *
 * Why: Gemini free tier hits 503 spikes during judging windows. Caching
 * means the same demo audio replays instantly with zero API cost, and if
 * a judge uploads something we've seen, they don't hit a transient outage.
 *
 * We don't use Firestore for this: the first-run latency (~15s) is the
 * product's value prop, and caching same-content re-runs is a demo
 * reliability play, not a persistent feature.
 */

const MAX_ENTRIES = 32;
const TTL_MS = 60 * 60 * 1000; // 1 hour — keeps hot during demo day

type Entry = {
  analysis: FullAnalysis;
  expiresAt: number;
};

const store = new Map<string, Entry>();

export function cacheKey(
  audioBase64: string,
  caller_phone?: string,
  claimed_role?: string
): string {
  const h = createHash('sha256');
  h.update(audioBase64);
  h.update('|');
  h.update(caller_phone ?? '');
  h.update('|');
  h.update(claimed_role ?? '');
  return h.digest('hex');
}

export function getCached(key: string): FullAnalysis | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  // LRU refresh: re-set moves to end of insertion order
  store.delete(key);
  store.set(key, entry);
  return entry.analysis;
}

export function setCached(key: string, analysis: FullAnalysis): void {
  if (store.size >= MAX_ENTRIES) {
    // Evict oldest (first inserted)
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }
  store.set(key, { analysis, expiresAt: Date.now() + TTL_MS });
}

export function cacheStats(): { size: number; max: number } {
  return { size: store.size, max: MAX_ENTRIES };
}
