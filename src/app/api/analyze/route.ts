import { NextRequest } from 'next/server';
import { analyzeVoiceNote } from '@/ai/flows/analyze';
import { sseEncode, SSE_HEADERS } from '@/lib/sse';
import { cacheKey, getCached, setCached } from '@/lib/analysis-cache';
import type { FullAnalysis } from '@/ai/schemas';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_AUDIO_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIMES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/flac',
]);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const audio = form.get('audio');
    const caller_phone = (form.get('phone') as string) || '';
    const claimed_role = (form.get('role') as string) || '';

    if (!(audio instanceof File)) {
      return new Response(JSON.stringify({ error: 'audio file missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      return new Response(
        JSON.stringify({ error: `audio too large; max ${MAX_AUDIO_BYTES} bytes` }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const mimeType = audio.type || 'audio/mpeg';
    if (!ALLOWED_MIMES.has(mimeType)) {
      return new Response(
        JSON.stringify({ error: `unsupported audio mime: ${mimeType}` }),
        { status: 415, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const buf = Buffer.from(await audio.arrayBuffer());
    const audioBase64 = buf.toString('base64');
    const key = cacheKey(audioBase64, caller_phone, claimed_role);
    const cached = getCached(key);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (cached) {
            // Replay cached analysis as a fast SSE sequence so the UI still
            // animates through the stepper. No API calls.
            await replayCached(controller, cached);
            controller.close();
            return;
          }

          for await (const event of analyzeVoiceNote({
            audioBase64,
            mimeType,
            caller_phone,
            claimed_role,
          })) {
            controller.enqueue(sseEncode(event));
            if (event.stage === 'done') {
              setCached(key, event.data);
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          controller.enqueue(sseEncode({ stage: 'error', data: { message } }));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Emit stepper events for a cached analysis so the UI still looks alive.
 * Slightly delayed between stages for visual rhythm (total ~1.2s).
 */
async function replayCached(
  controller: ReadableStreamDefaultController<Uint8Array>,
  analysis: FullAnalysis
) {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  controller.enqueue(sseEncode({ stage: 'transcribing', data: null }));
  await wait(150);
  controller.enqueue(sseEncode({ stage: 'transcribed', data: analysis.transcribe }));

  controller.enqueue(sseEncode({ stage: 'content_analyzing', data: null }));
  controller.enqueue(sseEncode({ stage: 'phone_looking_up', data: null }));
  await wait(200);
  controller.enqueue(sseEncode({ stage: 'content_analyzed', data: analysis.content }));
  controller.enqueue(sseEncode({ stage: 'phone_looked_up', data: analysis.phone }));

  controller.enqueue(sseEncode({ stage: 'challenge_generating', data: null }));
  await wait(200);
  controller.enqueue(sseEncode({ stage: 'challenge_generated', data: analysis.challenge }));

  controller.enqueue(sseEncode({ stage: 'safety_planning', data: null }));
  await wait(200);
  controller.enqueue(sseEncode({ stage: 'done', data: analysis }));
}
