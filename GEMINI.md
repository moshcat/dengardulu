# GEMINI.md — AI Implementation Declaration

> **DengarDulu** — AI voice-scam safety copilot for Malaysia.
> Project 2030: MyAI Future Hackathon (GDG On Campus UTM), Track 5 · Secure Digital / FinTech.

This document declares **how Gemini and the Google AI ecosystem are used** inside DengarDulu, and how the product was developed using **Google AI Studio + Antigravity + Firebase Genkit** as the core tooling.

---

## 1. Google AI Surface Used

| Layer | Technology | Role |
|---|---|---|
| Model | **Gemini 2.5 Flash** (audio-capable, 1M-token context, multilingual) | All 4 agents — default tier |
| Model | **Gemini 2.5 Pro** | Reserved escalation for SafetyPlan on conflicting signals (env-gated via `ESCALATE_TO_PRO`) |
| Runtime | **Vertex AI** (`asia-southeast1`) | Production inference — lower latency to MY, enterprise quota, SA-based auth |
| Orchestration | **Firebase Genkit JS** (`@genkit-ai/google-genai` 1.32) | Flow, tool, generate() with Zod `responseSchema` |
| Dev UI | **Genkit Developer UI** (`genkit start`) | Prompt iteration, structured-output debugging, audio I/O inspection |
| IDE | **Google AI Studio** | Standalone prompt-tuning sandbox (see `docs/prompts/*.md`) |
| Agentic IDE | **Antigravity (Gemini agent IDE)** | Multi-file scaffolding of agent system prompts + JSON schemas in a single turn |
| Deployment | **Google Cloud Run** + **Firestore** native mode | Serverless inference host + RAG corpus store |

**No model was trained or fine-tuned.** All capability comes from Gemini 2.5 Flash's zero-shot multimodal understanding, steered by prompt architecture + structured-output constraints.

---

## 2. Agentic Architecture

DengarDulu is an **agentic flow**, not a single prompt. Four sequential Gemini agents + one tool, orchestrated by Firebase Genkit as an async generator that streams stage events via Server-Sent Events to the UI.

```
                    [audio blob + optional phone + claimed_role]
                                       │
                                       ▼
                  ┌────────────────────────────────────────────┐
                  │  AGENT 1 — TranscribeAndCharacterize       │  Gemini 2.5 Flash (audio in)
                  │  transcript + voice_observations:          │
                  │   intonation, pauses, breathing,           │
                  │   pitch_stability, synthetic_cues[],       │
                  │   emotion_authenticity                     │
                  └──────────────────┬─────────────────────────┘
                                     │
                       ┌─────────────┴─────────────┐
                       ▼                           ▼
         ┌────────────────────────┐   ┌──────────────────────────┐
         │ AGENT 2a — Content     │   │ TOOL — PhoneLookup       │
         │ Analyzer (Flash + RAG) │   │ Firestore scam_numbers + │
         │ urgency_score,         │   │ semakmule / BNM FCAL /   │
         │ scam_pattern_matches,  │   │ MCMC external links      │
         │ impersonation_signals, │   │                          │
         │ secrecy_markers        │   │                          │
         └────────────┬───────────┘   └──────────────┬───────────┘
                      └──────────────┬───────────────┘
                                     ▼
                  ┌────────────────────────────────────────────┐
                  │  AGENT 3 — ChallengeGenerator (Flash)      │
                  │  2 bilingual verification questions (BM+EN)│
                  │  + WhatsApp-ready copypaste message        │
                  └──────────────────┬─────────────────────────┘
                                     ▼
                  ┌────────────────────────────────────────────┐
                  │  AGENT 4 — SafetyPlanSynthesizer           │  Flash (Pro on conflict)
                  │  verdict (LOW | MEDIUM | HIGH),            │
                  │  suspicion_score 0-100,                    │
                  │  red_flags[], action_plan[], hotlines      │
                  └──────────────────┬─────────────────────────┘
                                     ▼
                         [SSE → React UI (stepper)]
```

### Agent source map

| Agent | File | Model | Input | Output schema |
|---|---|---|---|---|
| Transcribe | `src/ai/steps/transcribe.ts` | `gemini-2.5-flash` | audio (base64 inline) | `TranscribeOutput` |
| Content Analyzer | `src/ai/steps/content-analyzer.ts` | `gemini-2.5-flash` | transcript + RAG | `ContentAnalyzerOutput` |
| Challenge | `src/ai/steps/challenge.ts` | `gemini-2.5-flash` | transcript + content | `ChallengeOutput` |
| Safety Plan | `src/ai/steps/safety-plan.ts` | `gemini-2.5-flash` (Pro escalation) | all prior outputs | `SafetyPlanOutput` |
| Phone Lookup (tool) | `src/ai/tools/phone-lookup.ts` | — (Firestore) | phone string | `PhoneLookupResult` |

All schemas declared with **Zod** in `src/ai/schemas.ts` and enforced via Genkit's `responseSchema` so Gemini returns strict structured JSON — no free-form parsing, no markdown fences, no hallucinated keys.

---

## 3. Prompt Architecture

Full system prompts are version-controlled under `docs/prompts/` (one file per agent). Each follows the same anatomy:

1. **Role statement** — "You are the X Analyzer for DengarDulu."
2. **Critical framing** — explicit never-claims (e.g., "Do NOT claim this is a deepfake"); soft-verdict posture ("suspicion score", "observations").
3. **Scoring rubric** (SafetyPlan only) — deterministic +N rules per signal type.
4. **Injection guard** — transcript wrapped in `<transcript untrusted="true">...</transcript>` tags; downstream agents told to ignore embedded instructions.
5. **Output contract** — "Return ONLY valid JSON matching the schema. No prose, no markdown."

### Retrieval grounding (RAG)

The ContentAnalyzer agent is grounded against a curated corpus of **138 Malaysian scam phrases** (59 BM + 57 EN + 22 Manglish), categorized by `category/severity/lang`. Loaded once from Firestore per cold start (5-minute in-process cache) and injected inline into the system prompt as:

```
<grounding>
- [money_request/high/ms] "beli Touch 'n Go PIN"
- [urgency/high/manglish] "cepat lah bro, bank dah nak close"
...
</grounding>
```

No vector DB. At ~140 items, prompt-based retrieval is faster and more honest than pretending we need semantic search. Phase 2 would move to Vertex AI Vector Search if the corpus grows beyond ~1k items.

---

## 4. Development Workflow — Tools Used

The project was developed by a 3-person student team (user = Team Lead + sole developer). The toolchain:

| Tool | Role | Where visible |
|---|---|---|
| **Google AI Studio** | Prompt drafting + iteration in a sandbox; each agent's system prompt was first tuned here against representative test audio before being committed | `docs/prompts/{1-transcribe,2-content-analyzer,3-challenge-generator,4-safety-plan}.md` |
| **Antigravity** (Gemini agent IDE) | Multi-file scaffolding — generated the initial agent directory structure (`src/ai/steps/*`, `src/ai/schemas.ts`) from a high-level architecture description in a single turn | initial commit structure |
| **Firebase Genkit Dev UI** | Running the flow end-to-end locally with live audio uploads, inspecting each agent's structured output, debugging Zod schema failures | `npm run genkit` → localhost:4000 |
| **Claude Code (Anthropic)** | Pair-programming driver for the Next.js frontend, Cloud Run deployment, and Firestore seeding scripts — not used for Gemini prompts | committed code |
| **Google Cloud CLI** (`gcloud`) | Project setup, Firestore provisioning, Cloud Run deploy, IAM bindings | deploy commands |

The hackathon rules permit agentic IDE tools (Antigravity / Cursor / etc.) and require declaration of AI usage — both are satisfied above.

---

## 5. Reliability & Cost Strategy

Designed for a 48-hour judging window where transient spikes are expected:

- **Retry with jitter** — 5 attempts on any Gemini call, exponential backoff 0.5s → 1s → 2s → 4s → 8s (total ≤ 15.5s worst case), handles 503 / 429 / 500-series / timeout uniformly (`src/ai/genkit.ts`).
- **Audio SHA-256 cache** — in-memory LRU (32 entries, 1-hour TTL) keyed by audio hash + phone + role; cache hits replay the full pipeline as SSE events with 1.2s of visual delay, zero API calls (`src/lib/analysis-cache.ts`). Means demo day audio stays instant even under spike.
- **No API keys in production** — Cloud Run's default service account has `roles/aiplatform.user` + `roles/datastore.user`; Vertex and Firestore authenticate via ADC. Nothing to rotate, nothing to leak.
- **`--min-instances=1` during demo** — eliminates cold-start; ~USD 3 cost for the judging window.

---

## 6. What Gemini is NOT Doing

Intentional non-claims, to survive Q&A:

- **Not a binary deepfake classifier.** Voice prosody cues alone cannot confirm synthesis. The UI says *"suspicion score"* and *"voice observations"*, never *"100% deepfake"*.
- **Not a trained model.** Zero fine-tuning. All capability = zero-shot Gemini 2.5 Flash + structured output + RAG.
- **Not claiming authority on phone reputations.** Firestore is a seeded curated list from public CCID / BNM alerts. For authoritative verification we link users to Semakmule (CCID portal), BNM FCAL, and MCMC.
- **Not vectorized.** RAG corpus is ~140 phrases injected inline. Honest small-data design.

---

## 7. Files of Interest

- `src/ai/genkit.ts` — plugin init, retry wrapper, model tier declaration
- `src/ai/schemas.ts` — every structured output contract (Zod)
- `src/ai/flows/analyze.ts` — the master async-generator flow that yields SSE stage events
- `src/ai/steps/*.ts` — the 4 Gemini agents
- `src/ai/tools/phone-lookup.ts` — Firestore tool + external-source links
- `src/lib/analysis-cache.ts` — demo-day resilience cache
- `src/data/scam_phrases.seed.json` — 138 Malaysian scam phrases (BM + EN + Manglish)
- `docs/prompts/*.md` — human-readable system prompts for AI Studio iteration
