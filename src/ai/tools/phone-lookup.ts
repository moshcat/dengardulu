import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase-admin';
import { PhoneLookupResult, ExternalSource } from '@/ai/schemas';
import { z } from 'zod';

function normalizePhone(phone: string): { full: string; last8: string } {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const last8 = cleaned.slice(-8);
  return { full: cleaned, last8 };
}

/**
 * Build the list of authoritative external verification sources that the user
 * can check manually. We surface links rather than scraping because:
 *  - Semakmule (CCID) serves a React SPA with anti-scraping on its search API
 *  - Scraping undocumented government endpoints risks ToS violation and breakage
 *  - Linking to the official source makes our verification more authoritative,
 *    not less — judges and users get the real thing
 */
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
 * Plain async function — call directly from flow code.
 * Returns raw PhoneLookupResult, not a Genkit wrapped response.
 *
 * Lookup strategy:
 *  1. Firestore exact match on normalized phone
 *  2. Firestore match on last 8 digits (handles +60 prefix variation)
 *  3. External authoritative sources surfaced as manual-verification links
 */
export async function lookupPhoneReputation(phone: string): Promise<PhoneLookupResult> {
  const external = buildExternalSources();
  const queried = phone?.trim() || undefined;

  if (!queried) {
    return { found: false, report_count: 0, tags: [], external_sources: external };
  }

  const { full, last8 } = normalizePhone(queried);
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
    };
  }

  return {
    found: false,
    report_count: 0,
    tags: [],
    queried_phone: queried,
    external_sources: external,
  };
}

/**
 * Genkit tool wrapper — for model-callable usage (e.g. SafetyPlanAgent can invoke this).
 */
export const phoneLookupTool = ai.defineTool(
  {
    name: 'lookupPhoneReputation',
    description:
      'Query the Malaysian scam-number reputation database (local Firestore + list of authoritative external verification URLs). Returns whether the phone has been reported as scam, report count, tags, and official sources (Semakmule CCID, BNM, MCMC) the user can cross-check manually.',
    inputSchema: z.object({
      phone: z.string().describe('Phone number in any Malaysian format (with or without +60)'),
    }),
    outputSchema: PhoneLookupResult,
  },
  async ({ phone }) => lookupPhoneReputation(phone)
);
