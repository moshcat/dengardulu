import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase-admin';
import { PhoneLookupResult } from '@/ai/schemas';
import { z } from 'zod';

function normalizePhone(phone: string): { full: string; last8: string } {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const last8 = cleaned.slice(-8);
  return { full: cleaned, last8 };
}

/**
 * Plain async function — call directly from flow code.
 * Returns raw PhoneLookupResult, not a Genkit wrapped response.
 */
export async function lookupPhoneReputation(phone: string): Promise<PhoneLookupResult> {
  if (!phone || phone.trim() === '') {
    return { found: false, report_count: 0, tags: [] };
  }

  const { full, last8 } = normalizePhone(phone);
  const collection = db().collection('scam_numbers');

  const byFull = await collection.where('phone', '==', full).limit(1).get();
  if (!byFull.empty) {
    const d = byFull.docs[0].data();
    return {
      found: true,
      report_count: d.reports ?? 0,
      last_seen: d.last_seen,
      tags: d.tags ?? [],
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
    };
  }

  return { found: false, report_count: 0, tags: [] };
}

/**
 * Genkit tool wrapper — for model-callable usage (e.g. SafetyPlanAgent can invoke this).
 */
export const phoneLookupTool = ai.defineTool(
  {
    name: 'lookupPhoneReputation',
    description:
      'Query the Malaysian scam-number reputation database. Returns whether the phone number has been reported as scam, how many reports, when last seen, and tags describing the scam type.',
    inputSchema: z.object({
      phone: z.string().describe('Phone number in any Malaysian format (with or without +60)'),
    }),
    outputSchema: PhoneLookupResult,
  },
  async ({ phone }) => lookupPhoneReputation(phone)
);
