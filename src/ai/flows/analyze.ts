import { ai } from '@/ai/genkit';
import { AnalyzeInput, FullAnalysis } from '@/ai/schemas';
import { transcribeStep } from '@/ai/steps/transcribe';
import { contentAnalyzerStep } from '@/ai/steps/content-analyzer';
import { challengeStep } from '@/ai/steps/challenge';
import { safetyPlanStep } from '@/ai/steps/safety-plan';
import { lookupPhoneReputation } from '@/ai/tools/phone-lookup';

export type StageEvent =
  | { stage: 'transcribing'; data: null }
  | { stage: 'transcribed'; data: Awaited<ReturnType<typeof transcribeStep>> }
  | { stage: 'content_analyzing'; data: null }
  | { stage: 'content_analyzed'; data: Awaited<ReturnType<typeof contentAnalyzerStep>> }
  | { stage: 'phone_looking_up'; data: null }
  | { stage: 'phone_looked_up'; data: Awaited<ReturnType<typeof lookupPhoneReputation>> }
  | { stage: 'challenge_generating'; data: null }
  | { stage: 'challenge_generated'; data: Awaited<ReturnType<typeof challengeStep>> }
  | { stage: 'safety_planning'; data: null }
  | { stage: 'done'; data: FullAnalysis }
  | { stage: 'error'; data: { message: string } };

export async function* analyzeVoiceNote(
  input: AnalyzeInput
): AsyncGenerator<StageEvent, void, unknown> {
  const started = Date.now();

  try {
    // Step 1 — Transcribe & Characterize
    yield { stage: 'transcribing', data: null };
    const transcribe = await transcribeStep({
      audioBase64: input.audioBase64,
      mimeType: input.mimeType,
    });
    yield { stage: 'transcribed', data: transcribe };

    // Step 2 — Parallel: Content Analyzer + Phone Lookup
    yield { stage: 'content_analyzing', data: null };
    yield { stage: 'phone_looking_up', data: null };

    const [content, phone] = await Promise.all([
      contentAnalyzerStep({
        transcribe,
        claimed_role: input.claimed_role,
        caller_phone: input.caller_phone,
      }),
      lookupPhoneReputation(input.caller_phone ?? ''),
    ]);

    yield { stage: 'content_analyzed', data: content };
    yield { stage: 'phone_looked_up', data: phone };

    // Step 3 — Challenge Generator
    yield { stage: 'challenge_generating', data: null };
    const challenge = await challengeStep({
      transcribe,
      content,
      claimed_role: input.claimed_role,
    });
    yield { stage: 'challenge_generated', data: challenge };

    // Step 4 — Safety Plan Synthesis
    yield { stage: 'safety_planning', data: null };
    const safety = await safetyPlanStep({
      transcribe,
      content,
      phone,
      challenge,
      caller_phone: input.caller_phone,
      claimed_role: input.claimed_role,
    });

    const full: FullAnalysis = {
      transcribe,
      content,
      phone,
      challenge,
      safety,
      meta: {
        started_at: new Date(started).toISOString(),
        duration_ms: Date.now() - started,
        model: 'gemini-2.5-flash',
      },
    };

    yield { stage: 'done', data: full };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    yield { stage: 'error', data: { message } };
  }
}

// Also expose as a Genkit flow for dev UI testing
export const analyzeFlow = ai.defineFlow(
  {
    name: 'analyzeVoiceNote',
    inputSchema: AnalyzeInput,
    outputSchema: FullAnalysis,
  },
  async (input) => {
    let final: FullAnalysis | null = null;
    for await (const event of analyzeVoiceNote(input)) {
      if (event.stage === 'done') final = event.data;
      if (event.stage === 'error') throw new Error(event.data.message);
    }
    if (!final) throw new Error('Flow completed without done event');
    return final;
  }
);
