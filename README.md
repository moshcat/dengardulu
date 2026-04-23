# DengarDulu — Listen First. Answer Wisely.

> **AI safety copilot for Malaysian voice-note scams.**
> Forward a suspicious WhatsApp voice note. Get a verdict, red-flag list, and a personalized verification question in 15 seconds. Powered by Gemini 2.5 Flash on Vertex AI.

**🌐 Live:** https://dengardulu-169906713421.asia-southeast1.run.app
**🎓 Hackathon:** [Project 2030 · MyAI Future](https://projek2030.gdguctm.my) — GDG On Campus UTM, Malaysia
**🏁 Track:** 5 · Secure Digital (FinTech & Security)

---

## The Problem

AI voice-cloning scams are the fastest-growing fraud vector in Malaysia, and citizens have **no real-time way to verify a suspicious voice note** before acting on it.

- **454+** deepfake voice impersonation cases investigated by CCID since early 2024 — losses reaching **RM 2.72 million** ([Malay Mail, 28 Aug 2024](https://www.malaymail.com/news/malaysia/2024/08/28/ccid-director-over-450-deepfake-scams-under-police-investigation-losses-reach-rm272m/148500) · [Bernama](https://bernama.com/en/crime_courts/news.php?id=2334316))
- **12,110** scams in Q1 2025 alone, totaling **RM 573.7M** in losses ([RinggitPlus, 18 Apr 2025](https://ringgitplus.com/en/blog/personal-finance-news/rm573-million-lost-to-online-fraud-in-q1-2025-police-warn-of-ai-driven-scams.html))
- Scam calls in Malaysia **surged 82.81%** across 2024 ([Malay Mail, 3 Mar 2025](https://www.malaymail.com/news/malaysia/2025/03/03/the-dark-side-of-ai-scam-calls-nearly-double-in-malaysia-across-2024/168530))
- A woman lost **RM 5,000** after her *boss's* AI-cloned voice asked her via phone to buy Touch 'n Go PINs ([The Rakyat Post, 14 May 2025](https://www.therakyatpost.com/news/malaysia/2025/05/14/woman-loses-rm5k-after-answering-a-call-from-boss/) · [Malay Mail, 4 Aug 2025](https://www.malaymail.com/news/malaysia/2025/08/04/ai-scams-are-getting-real-here-are-the-cases-happening-in-malaysia-that-you-should-know-about/183459))

Banks freeze accounts only *after* the transfer. DengarDulu intervenes *before*.

---

## The Insight

Other solutions chase binary deepfake classification, which is hard, slow, and an arms race we lose. DengarDulu reframes the problem:

> **Hand the user a personalized counter-question.**
> Scammers cannot answer questions that rely on private shared memory. Real people can. This is the action layer that separates a *detector* from a *copilot*.

---

## What It Does

Upload a suspicious voice note; within ~15 seconds receive:

1. **Verdict** — `LOW` / `MEDIUM` / `HIGH` with a 0–100 suspicion score
2. **Transcript + voice-prosody observations** (intonation, pauses, breathing, pitch stability, synthetic cues, emotion authenticity)
3. **Bilingual red-flag list** grounded in a corpus of 138 Malaysian scam phrases (BM / EN / Manglish)
4. **Two personalized challenge questions** you can copy-paste or **send directly to WhatsApp**
5. **Phone reputation** cross-referenced with our Firestore DB + deep links to official sources (Semakmule CCID, BNM FCAL, MCMC)
6. **Concrete action plan** with Malaysian hotlines (CCID, BNM, 999)

---

## Architecture

```mermaid
flowchart TB
    U[User uploads voice note] --> API[/api/analyze SSE route/]
    API --> Flow[analyzeVoiceNote async generator]

    Flow --> A1[Agent 1: Transcribe & Characterize<br/>Gemini 2.5 Flash]
    A1 --> Par[Parallel]
    Par --> A2[Agent 2: Content Analyzer<br/>Flash + RAG 138 phrases]
    Par --> T1[Tool: PhoneLookup<br/>Firestore + external sources]
    A2 --> A3[Agent 3: Challenge Generator<br/>Flash]
    T1 --> A3
    A3 --> A4[Agent 4: Safety Plan<br/>Flash - Pro on conflict]
    A4 --> Stream[SSE stage events]
    Stream --> UI[React stepper UI]

    subgraph Google Cloud asia-southeast1
      VAI[Vertex AI]
      FS[(Firestore)]
      CR[Cloud Run]
    end

    A1 -.-> VAI
    A2 -.-> VAI
    A3 -.-> VAI
    A4 -.-> VAI
    T1 -.-> FS
    API -.-> CR
```

### Why agentic, not single-shot

Each Gemini call has a tightly scoped role and structured-output contract. The ChallengeGenerator never sees raw audio (only transcript + content analysis); the SafetyPlan never re-transcribes. This keeps costs down, context focused, and surfaces where each agent's reasoning lives for the transparency panel (the stepper's "Show agent output" toggle).

See **[GEMINI.md](./GEMINI.md)** for the full AI implementation declaration.

---

## Tech Stack

| Layer | Choice |
|---|---|
| **Frontend** | Next.js 16 App Router (Turbopack) · TypeScript · Tailwind v4 · custom Mastercard-inspired design system |
| **AI orchestration** | Firebase Genkit JS 1.32 (`@genkit-ai/google-genai`) |
| **Models** | Gemini 2.5 Flash (default) · Gemini 2.5 Pro (escalation) · served via **Vertex AI** `asia-southeast1` |
| **Data** | Firestore (native mode, `asia-southeast1`) — 138 scam phrases + 30 phone numbers |
| **Streaming** | Server-Sent Events for stage-by-stage UI updates |
| **Reliability** | Exponential-backoff retry (5 attempts, jitter) · SHA-256 audio cache (32 entries, 1h TTL) |
| **Auth** | ADC — Cloud Run default SA; no API keys in production |
| **Deploy** | Docker multi-stage (node:20-alpine, standalone Next output) · Cloud Run `asia-southeast1` with `--min-instances 1` during demo |

---

## Local Setup

### Prerequisites
- Node 20+
- `gcloud` CLI authenticated to a GCP project with Firestore native mode, Vertex AI, and (optionally) Secret Manager enabled
- A service-account JSON with `roles/aiplatform.user` + `roles/datastore.user`

### 1. Clone & install

```bash
git clone https://github.com/<your-org>/dengardulu.git
cd dengardulu
npm install
```

### 2. Configure environment

Create `.env.local`:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
GCP_PROJECT_ID=your-gcp-project-id
GCP_LOCATION=asia-southeast1
FIREBASE_PROJECT_ID=your-gcp-project-id
```

Place your service-account JSON at `./service-account.json` (gitignored).

### 3. Seed Firestore

```bash
npm run seed               # first run
npm run seed -- --force    # re-seed / upsert after data changes
```

### 4. Run dev server

```bash
npm run dev
# open http://localhost:3000
```

For Genkit dev UI (inspect each agent's structured output live):

```bash
npm run genkit
# open http://localhost:4000
```

---

## Deploy to Cloud Run

```bash
gcloud run deploy dengardulu \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --min-instances 1 --max-instances 10 \
  --memory 1Gi --cpu 1 --timeout 120 \
  --set-env-vars "GCP_PROJECT_ID=<proj>,GCP_LOCATION=asia-southeast1,FIREBASE_PROJECT_ID=<proj>" \
  --project <proj>
```

The default compute service account must have `roles/aiplatform.user` + `roles/datastore.user`:

```bash
PROJECT_NUMBER=$(gcloud projects describe <proj> --format='value(projectNumber)')
for role in aiplatform.user datastore.user; do
  gcloud projects add-iam-policy-binding <proj> \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/${role}" --condition=None
done
```

No `GEMINI_API_KEY` secret is required — Vertex AI uses ADC.

---

## Environment Variables

| Var | Where | Purpose |
|---|---|---|
| `GCP_PROJECT_ID` | local + Cloud Run | Vertex AI project |
| `GCP_LOCATION` | local + Cloud Run | Vertex AI region (default `asia-southeast1`) |
| `FIREBASE_PROJECT_ID` | local + Cloud Run | Firestore project (usually same as GCP_PROJECT_ID) |
| `GOOGLE_APPLICATION_CREDENTIALS` | **local only** | Path to SA JSON. Cloud Run uses metadata-service credentials automatically |
| `ESCALATE_TO_PRO` | optional | Set `true` to allow SafetyPlan to promote to Gemini 2.5 Pro on conflicting signals |

---

## AI Declaration

Gemini and Google AI tooling used per hackathon rules:

- **Models:** Gemini 2.5 Flash (all 4 agents, default) · Gemini 2.5 Pro (escalation)
- **Runtime:** Vertex AI (`asia-southeast1`)
- **Framework:** Firebase Genkit JS
- **Dev tooling:** Google AI Studio (prompt iteration), Antigravity (agentic IDE scaffolding), Genkit Developer UI (live flow debugging), Claude Code by Anthropic (frontend/infra pair-programming)
- **Training:** None. Zero-shot only.

Full implementation details and agent architecture: **[GEMINI.md](./GEMINI.md)**.

---

## Judging Rubric Alignment

| Criterion | Max | How we score |
|---|---|---|
| **AI Implementation & Technical Execution** | 25 | 4 Gemini agents + 1 tool + RAG grounding + Genkit orchestration + structured JSON + Vertex AI + retry/cache resilience |
| **Innovation & Creativity** | 20 | The *counter-question* framing — reframing detection into action. Voice prosody + content cues + personalized verification Q is a novel combination. WhatsApp direct-share closes the loop |
| **Impact & Problem Relevance** | 20 | Malaysia stats, BM/EN/Manglish support, 138 Malaysian scam-phrase RAG, local hotlines (CCID / BNM / 999), aligns with MyDIGITAL + FinTech track |
| **UI/UX & Presentation** | 10 | Bilingual toggle, responsive, aria-live agentic stepper, Mastercard-inspired editorial design system |
| **Code Quality** | 15 | Modular agents, Zod input validation, Typescript strict, IAM-based auth (no API-key secrets), retry + cache, documented prompts |
| **Pitch / Video** | 10 | See submitted materials |

---

## Roadmap (Post-Hackathon)

- **Real deepfake classifier** — complement voice observations with AASIST / RawNet audio inference
- **WhatsApp Business webhook** — users forward voice notes directly into a WA chatbot
- **Authenticated history** — Firebase Auth + per-user analysis history
- **Vertex AI Vector Search** — graduate RAG from inline corpus at >1k items
- **Community reporting** — `scam_numbers` collection writeable by verified users, PDRM/BNM partnership

---

## Limits — Honestly Stated

1. **Not a deepfake confirmation.** Voice cues alone cannot prove synthesis. We output *"suspicion score"*, never a binary *"this is fake"*.
2. **Phone DB is curated, not exhaustive.** 30 seed numbers from public CCID/BNM alerts. For authoritative checks, the UI deep-links to [Semakmule](https://semakmule.rmp.gov.my), BNM FCAL, MCMC.
3. **Audio size capped at 20 MB** (inline base64). Longer audio would need Files API — deferred.
4. **Cache is in-memory.** Cold starts lose the cache. `--min-instances 1` keeps the demo warm; a future Firestore-backed cache would survive restarts.

---

## Repo Layout

```
dengardulu/
├── src/
│   ├── app/              # Next.js App Router pages + API route
│   │   ├── page.tsx      # Landing (hero + stats + 3-feature constellation + hotlines)
│   │   ├── analyze/      # Upload + SSE stepper + ResultReport
│   │   └── api/analyze/  # POST endpoint with SSE stream + audio cache
│   ├── ai/
│   │   ├── genkit.ts         # Plugin init, retry wrapper, model tiers
│   │   ├── schemas.ts        # All Zod structured-output contracts
│   │   ├── flows/analyze.ts  # Master async-generator flow
│   │   ├── steps/            # 4 agents: transcribe, content-analyzer, challenge, safety-plan
│   │   └── tools/            # phone-lookup (Firestore + external sources)
│   ├── components/           # Dropzone, AgentStepper, VerdictBadge, ResultReport, Logo
│   ├── lib/                  # firebase-admin, sse encoder, analysis-cache
│   ├── i18n/messages.ts      # BM + EN dictionary
│   └── data/                 # Firestore seed JSONs
├── scripts/seed-firestore.ts # Upsert seed data
├── docs/prompts/             # Human-readable system prompts per agent
├── tests/fixtures/           # Test audio (gitignored)
├── GEMINI.md                 # AI implementation declaration
└── README.md                 # This file
```

---

## License

MIT © 2026 DengarDulu Team — built for Project 2030: MyAI Future Hackathon, GDG On Campus UTM.

---

## Credits

- **Gemini 2.5** by Google DeepMind — the audio + language model
- **Firebase Genkit** — the agentic orchestration layer
- **GDG On Campus UTM** — for hosting Project 2030
- **CCID Malaysia / BNM / MCMC** — for the scam-awareness data we ground against
