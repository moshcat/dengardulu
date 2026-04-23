import { z } from 'zod';

// ─── Step 1: Transcribe & Characterize ───────────────────────────────────────

export const VoiceObservations = z.object({
  intonation: z.enum(['flat', 'natural', 'exaggerated']),
  pauses: z.enum(['natural', 'unnatural', 'minimal']),
  breathing_present: z.boolean(),
  pitch_stability: z.enum(['stable', 'unstable', 'robotic']),
  synthetic_cues: z.array(z.string()),
  emotion_authenticity: z.enum(['authentic', 'incongruent', 'neutral']),
});

export const TranscribeOutput = z.object({
  transcript: z.string(),
  language: z.enum(['ms', 'en', 'manglish', 'zh', 'ta', 'mixed', 'other']),
  voice_observations: VoiceObservations,
});
export type TranscribeOutput = z.infer<typeof TranscribeOutput>;

export const TranscribeInput = z.object({
  audioBase64: z.string(),
  mimeType: z.string(),
});
export type TranscribeInput = z.infer<typeof TranscribeInput>;

// ─── Step 2: Content Analyzer ────────────────────────────────────────────────

export const ScamPatternMatch = z.object({
  matched_pattern: z.string(),
  category: z.enum([
    'urgency',
    'authority',
    'money_request',
    'secrecy',
    'emotional_manipulation',
    'personal_info_request',
  ]),
  severity: z.enum(['low', 'medium', 'high']),
  transcript_quote: z.string(),
});

export const SensitiveRequest = z.object({
  type: z.enum([
    'money_transfer',
    'otp_or_pin',
    'personal_info',
    'account_password',
    'document_photo',
    'physical_meeting',
    'bank_login',
    'crypto_transfer',
  ]),
  quote: z.string(),
});

export const ContentAnalyzerOutput = z.object({
  scam_pattern_matches: z.array(ScamPatternMatch),
  urgency_score: z.number().int().min(0).max(10),
  sensitive_requests: z.array(SensitiveRequest),
  impersonation_signals: z.object({
    claimed_role: z.string(),
    authority_type: z.enum(['professional', 'familial', 'governmental', 'financial', 'none']),
    credibility_cues_missing: z.array(z.string()),
  }),
  secrecy_markers: z.array(z.string()),
  rag_patterns_hit_count: z.number().int().min(0),
});
export type ContentAnalyzerOutput = z.infer<typeof ContentAnalyzerOutput>;

// ─── Step 3: Challenge Generator ─────────────────────────────────────────────

export const ChallengeQuestion = z.object({
  question_bm: z.string(),
  question_en: z.string(),
  why_this_works: z.string(),
  what_to_expect: z.string(),
});

export const ChallengeOutput = z.object({
  questions: z.array(ChallengeQuestion).length(2),
  copypaste_whatsapp_bm: z.string(),
  copypaste_whatsapp_en: z.string(),
});
export type ChallengeOutput = z.infer<typeof ChallengeOutput>;

// ─── Phone Lookup Tool ───────────────────────────────────────────────────────

export const ExternalSource = z.object({
  name: z.string(),
  url: z.string().url(),
  description_bm: z.string(),
  description_en: z.string(),
});
export type ExternalSource = z.infer<typeof ExternalSource>;

export const PhoneLookupResult = z.object({
  found: z.boolean(),
  report_count: z.number().int().min(0).default(0),
  last_seen: z.string().optional(),
  tags: z.array(z.string()).default([]),
  queried_phone: z.string().optional(),
  external_sources: z.array(ExternalSource).default([]),
});
export type PhoneLookupResult = z.infer<typeof PhoneLookupResult>;

// ─── Step 4: Safety Plan ─────────────────────────────────────────────────────

export const RedFlag = z.object({
  label_bm: z.string(),
  label_en: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  evidence_quote: z.string(),
});

export const ActionStep = z.object({
  step_bm: z.string(),
  step_en: z.string(),
  urgency: z.enum(['immediate', 'soon', 'later']),
});

export const Hotline = z.object({
  label: z.string(),
  value: z.string(),
});

export const SafetyPlanOutput = z.object({
  verdict: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  suspicion_score: z.number().int().min(0).max(100),
  headline_bm: z.string(),
  headline_en: z.string(),
  red_flags: z.array(RedFlag),
  action_plan: z.array(ActionStep),
  verification_message: z.object({
    bm: z.string(),
    en: z.string(),
  }),
  hotlines: z.array(Hotline),
  confidence: z.enum(['low', 'medium', 'high']),
});
export type SafetyPlanOutput = z.infer<typeof SafetyPlanOutput>;

// ─── Master Flow Input ───────────────────────────────────────────────────────

export const AnalyzeInput = z.object({
  audioBase64: z.string(),
  mimeType: z.string(),
  caller_phone: z.string().optional(),
  claimed_role: z.string().optional(),
});
export type AnalyzeInput = z.infer<typeof AnalyzeInput>;

// ─── Full analysis result (everything combined, for SSE final payload) ───────

export const FullAnalysis = z.object({
  transcribe: TranscribeOutput,
  content: ContentAnalyzerOutput,
  phone: PhoneLookupResult,
  challenge: ChallengeOutput,
  safety: SafetyPlanOutput,
  meta: z.object({
    started_at: z.string(),
    duration_ms: z.number(),
    model: z.string(),
  }),
});
export type FullAnalysis = z.infer<typeof FullAnalysis>;
