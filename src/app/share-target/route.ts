import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

const pending = new Map<string, { buffer: Buffer; type: string; expires: number }>();

const EXPIRY_MS = 60_000;

function cleanup() {
  const now = Date.now();
  for (const [k, v] of pending) {
    if (now > v.expires) pending.delete(k);
  }
}

export async function POST(req: NextRequest) {
  cleanup();

  const formData = await req.formData();
  const file = formData.get('audio') as File | null;

  if (!file) {
    return NextResponse.redirect(new URL('/analyze', req.url), 303);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();
  pending.set(id, { buffer, type: file.type || 'audio/ogg', expires: Date.now() + EXPIRY_MS });

  return NextResponse.redirect(new URL(`/analyze?shared=${id}`, req.url), 303);
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  cleanup();
  const entry = pending.get(id);
  if (!entry) return NextResponse.json({ error: 'expired' }, { status: 404 });

  pending.delete(id);
  return new NextResponse(new Uint8Array(entry.buffer), {
    headers: { 'Content-Type': entry.type, 'Cache-Control': 'no-store' },
  });
}
