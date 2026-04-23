import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/google-genai';

/**
 * Project/location resolved from env. On Cloud Run, GOOGLE_CLOUD_PROJECT is
 * auto-injected by the runtime, so explicit GCP_PROJECT_ID is for local dev.
 *
 * Intentionally does not throw at module load: Next.js build (page data
 * collection) imports this file without runtime env vars, which would fail
 * the build. Missing projectId will surface as a clearer error on first
 * Vertex call instead.
 */
const PROJECT_ID =
  process.env.GCP_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = process.env.GCP_LOCATION || 'asia-southeast1';

export const ai = genkit({
  plugins: [
    vertexAI({
      projectId: PROJECT_ID,
      location: LOCATION,
    }),
  ],
});

/**
 * Model tiers (Vertex AI — asia-southeast1)
 * - FLASH: default — gemini-2.5-flash (audio-capable, multilingual, 1M context)
 * - PRO: gemini-2.5-pro — reserved for safety-plan escalation on conflicting signals
 */
export const MODEL_FLASH = vertexAI.model('gemini-2.5-flash');
export const MODEL_PRO = vertexAI.model('gemini-2.5-pro');

/**
 * Retry wrapper with exponential backoff + jitter.
 *
 * Handles transient 503 / 429 / "overloaded" errors. Total worst-case wait
 * ≈ 0.5 + 1 + 2 + 4 + 8 = 15.5s across 5 attempts before giving up.
 */
export async function withRetry<T>(
  fn: (model: ReturnType<typeof vertexAI.model>) => Promise<T>,
  opts: { primary?: ReturnType<typeof vertexAI.model>; maxAttempts?: number } = {}
): Promise<T> {
  const primary = opts.primary ?? MODEL_FLASH;
  const maxAttempts = opts.maxAttempts ?? 5;

  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn(primary);
    } catch (err) {
      lastErr = err;
      if (!isTransient(err)) throw err;
      if (attempt < maxAttempts - 1) {
        const base = 500 * Math.pow(2, attempt); // 500, 1000, 2000, 4000, 8000
        const jitter = Math.random() * 300;
        await sleep(base + jitter);
      }
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error(typeof lastErr === 'string' ? lastErr : 'Vertex retry exhausted');
}

function isTransient(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b(503|429|500|502|504|overloaded|unavailable|high demand|rate limit|timeout|ECONN|DEADLINE_EXCEEDED|RESOURCE_EXHAUSTED)\b/i.test(
    msg
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
