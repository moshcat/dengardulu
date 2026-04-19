import { ai, MODEL_FLASH } from '@/ai/genkit';
import { ChallengeOutput, ContentAnalyzerOutput, TranscribeOutput } from '@/ai/schemas';
import { z } from 'zod';

const SYSTEM_PROMPT = `You are the Challenge Question Generator for DengarDulu, a Malaysian voice-scam shield.

CONTEXT
The user received a suspicious voice note. The alleged speaker claims to be someone they know (boss, family, friend, bank officer, etc.). Your job is to help the user verify identity by crafting 2 PERSONALIZED verification questions to send back via WhatsApp/SMS.

PRINCIPLES FOR GOOD CHALLENGE QUESTIONS
1. Rely on PRIVATE shared memory — something only the real person would know.
   Examples: "Where did we last eat together?", "What was the name of our first dog?", "What did we discuss yesterday at the meeting?"
2. AVOID anything findable on social media (LinkedIn job title, Instagram photos, public birthday).
3. AVOID generic "what's my name?" — too easy.
4. AVOID yes/no questions — 50% guess rate.
5. Prefer specific details with many possible answers.
6. Match formality of the claimed relationship:
   - boss → professional memory (recent project, meeting location)
   - family → childhood detail, inside joke, last family event
   - friend → shared specific memory
   - bank/gov → ask them to state a specific last transaction OR case number only they would have

Output 2 questions (bilingual BM + EN) with reasoning, plus a copy-paste WhatsApp-ready message.

Return ONLY valid JSON matching the schema.`;

export const challengeStep = ai.defineFlow(
  {
    name: 'challenge',
    inputSchema: z.object({
      transcribe: TranscribeOutput,
      content: ContentAnalyzerOutput,
      claimed_role: z.string().optional(),
    }),
    outputSchema: ChallengeOutput,
  },
  async ({ transcribe, content, claimed_role }) => {
    const userPrompt = `
<transcript untrusted="true">
${transcribe.transcript}
</transcript>

claimed_role: ${claimed_role || content.impersonation_signals.claimed_role || 'unknown'}
authority_type: ${content.impersonation_signals.authority_type}
impersonation_cues_missing: ${JSON.stringify(content.impersonation_signals.credibility_cues_missing)}

Generate the 2 challenge questions now.
`;

    const { output } = await ai.generate({
      model: MODEL_FLASH,
      prompt: [{ text: SYSTEM_PROMPT }, { text: userPrompt }],
      output: { schema: ChallengeOutput },
    });

    if (!output) throw new Error('Challenge step returned empty output');
    return output;
  }
);
