import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const maxDuration = 30;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REPORTS_PER_HOUR = 5;

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') ?? '127.0.0.1';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= MAX_REPORTS_PER_HOUR) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string') {
      return new Response(JSON.stringify({ error: 'invalid_phone' }), { status: 400 });
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429 });
    }

    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    const digitOnly = cleanPhone.replace(/\D/g, '');

    if (digitOnly.length < 8) {
      return new Response(JSON.stringify({ error: 'invalid_phone' }), { status: 400 });
    }

    const ref = db().collection('scam_numbers').doc(digitOnly);
    const snap = await ref.get();

    if (snap.exists) {
      await ref.update({
        reports: FieldValue.increment(1),
        last_seen: new Date().toISOString().split('T')[0],
      });
    } else {
      const formattedPhone = cleanPhone.startsWith('+')
        ? cleanPhone
        : cleanPhone.startsWith('60')
        ? '+' + cleanPhone
        : '+60' + cleanPhone.replace(/^0/, '');

      await ref.set({
        phone: formattedPhone,
        phone_hash_last8: cleanPhone.slice(-8),
        reports: 1,
        last_seen: new Date().toISOString().split('T')[0],
        tags: ['community_report'],
        source: 'community',
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('report-number error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
