import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { db } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function publicUrl(req: NextRequest, path: string): URL {
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
  return new URL(path, `${proto}://${host}`);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('audio') as File | null;

  if (!file) {
    return NextResponse.redirect(publicUrl(req, '/analyze'), 303);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();

  await db().collection('_shared_audio').doc(id).set({
    b64: buffer.toString('base64'),
    type: file.type || 'audio/ogg',
    createdAt: Date.now(),
  });

  return NextResponse.redirect(publicUrl(req, `/analyze?shared=${id}`), 303);
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  try {
    const doc = await db().collection('_shared_audio').doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const { b64, type } = doc.data()!;
    await db().collection('_shared_audio').doc(id).delete();

    const buffer = Buffer.from(b64, 'base64');
    return new NextResponse(new Uint8Array(buffer), {
      headers: { 'Content-Type': type, 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
