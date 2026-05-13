import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase-admin';
import { PhoneLookupResult, ExternalSource } from '@/ai/schemas';
import { z } from 'zod';

const SEMAKMULE_BASE = 'https://semakmule.rmp.gov.my/api/mule';
const SEMAKMULE_APIKEY = 'j3j389#nklala2';
const SEMAKMULE_TIMEOUT_MS = 5000;

function normalizePhone(phone: string): { full: string; last8: string } {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const last8 = cleaned.slice(-8);
  return { full: cleaned, last8 };
}

function buildExternalSources(): ExternalSource[] {
  return [
    {
      name: 'Semakmule CCID',
      url: 'https://semakmule.rmp.gov.my/',
      description_bm:
        'Semak nombor telefon, akaun bank, atau syarikat di portal rasmi PDRM CCID.',
      description_en:
        'Verify phone numbers, bank accounts, or companies on the official PDRM CCID portal.',
    },
    {
      name: 'BNM Financial Consumer Alert',
      url: 'https://www.bnm.gov.my/financial-consumer-alert-list',
      description_bm:
        'Senarai rasmi syarikat dan individu yang disenaraikan oleh Bank Negara Malaysia.',
      description_en:
        'Official list of companies and individuals flagged by Bank Negara Malaysia.',
    },
    {
      name: 'MCMC Scam Reports',
      url: 'https://www.mcmc.gov.my/en/sectors/broadcasting-new-media/awareness/scams',
      description_bm:
        'Maklumat penipuan komunikasi oleh Suruhanjaya Komunikasi dan Multimedia Malaysia.',
      description_en:
        'Communications scam alerts from the Malaysian Communications and Multimedia Commission.',
    },
  ];
}

/**
 * Query Semakmule PDRM live database for a phone number.
 * Returns report count from their 227K+ record database.
 * Falls back gracefully on network error or non-200 response.
 */
async function querySemakmule(phone: string): Promise<{ found: boolean; report_count: number } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SEMAKMULE_TIMEOUT_MS);

    const res = await fetch(`${SEMAKMULE_BASE}/get_search_data.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SEMAKMULE_APIKEY,
        Origin: 'https://semakmule.rmp.gov.my',
        Referer: 'https://semakmule.rmp.gov.my/',
        'User-Agent': 'Mozilla/5.0 (compatible; DengarDulu/1.0)',
      },
      body: JSON.stringify({ data: { category: 'telefon', telNo: phone } }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) return null;

    const json = await res.json();
    if (json.status !== 1) return null;

    // table_data is [[phone, report_count], ...] — use first row's report count
    // json.count is the total DB records matching query (different from per-number reports)
    const rows: [string, number][] = Array.isArray(json.table_data) ? json.table_data : [];
    const report_count = rows.length > 0 && typeof rows[0][1] === 'number' ? rows[0][1] : 0;
    return { found: rows.length > 0, report_count };
  } catch {
    return null;
  }
}

/**
 * Lookup strategy:
 * 1. Semakmule PDRM live API (227K+ records, real police data)
 * 2. Firestore local DB fallback (seed + community reports)
 * 3. External authoritative source links always shown
 */
export async function lookupPhoneReputation(phone: string): Promise<PhoneLookupResult> {
  const external = buildExternalSources();
  const queried = phone?.trim() || undefined;

  if (!queried) {
    return { found: false, report_count: 0, tags: [], external_sources: external, source: 'none' };
  }

  const { full, last8 } = normalizePhone(queried);

  // ── 1. Try Semakmule live API ────────────────────────────────────────────────
  // Try with local format first (e.g. 0172345678), then with full cleaned string
  const semakmuleResult =
    (await querySemakmule(full)) ??
    (full.startsWith('60') ? await querySemakmule('0' + full.slice(2)) : null) ??
    (full.startsWith('+60') ? await querySemakmule('0' + full.slice(3)) : null);

  if (semakmuleResult !== null) {
    return {
      found: semakmuleResult.found,
      report_count: semakmuleResult.report_count,
      tags: [],
      queried_phone: queried,
      external_sources: external,
      source: 'semakmule',
    };
  }

  // ── 2. Fallback: Firestore seed + community reports ──────────────────────────
  const collection = db().collection('scam_numbers');

  const byFull = await collection.where('phone', '==', full).limit(1).get();
  if (!byFull.empty) {
    const d = byFull.docs[0].data();
    return {
      found: true,
      report_count: d.reports ?? 0,
      last_seen: d.last_seen,
      tags: d.tags ?? [],
      queried_phone: queried,
      external_sources: external,
      source: 'firestore',
    };
  }

  const byLast8 = await collection.where('phone_hash_last8', '==', last8).limit(1).get();
  if (!byLast8.empty) {
    const d = byLast8.docs[0].data();
    return {
      found: true,
      report_count: d.reports ?? 0,
      last_seen: d.last_seen,
      tags: d.tags ?? [],
      queried_phone: queried,
      external_sources: external,
      source: 'firestore',
    };
  }

  return {
    found: false,
    report_count: 0,
    tags: [],
    queried_phone: queried,
    external_sources: external,
    source: 'firestore',
  };
}

export const phoneLookupTool = ai.defineTool(
  {
    name: 'lookupPhoneReputation',
    description:
      'Query the Malaysian scam-number reputation database. Checks Semakmule PDRM live database (227K+ records) first, then falls back to local Firestore. Returns whether the phone has been reported as scam, report count, and official sources for manual cross-check.',
    inputSchema: z.object({
      phone: z.string().describe('Phone number in any Malaysian format (with or without +60)'),
    }),
    outputSchema: PhoneLookupResult,
  },
  async ({ phone }) => lookupPhoneReputation(phone)
);
