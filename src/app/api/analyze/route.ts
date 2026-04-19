import { NextRequest } from 'next/server';
import { analyzeVoiceNote } from '@/ai/flows/analyze';
import { sseEncode, SSE_HEADERS } from '@/lib/sse';

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

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of analyzeVoiceNote({
            audioBase64,
            mimeType,
            caller_phone,
            claimed_role,
          })) {
            controller.enqueue(sseEncode(event));
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
