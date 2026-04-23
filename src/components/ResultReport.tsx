'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  Phone,
  AlertTriangle,
  ListChecks,
  MessagesSquare,
  FileText,
  PhoneCall,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { VerdictBadge } from './VerdictBadge';
import { messages, Lang } from '@/i18n/messages';
import type { FullAnalysis } from '@/ai/schemas';

export function ResultReport({
  analysis,
  lang,
  onRestart,
}: {
  analysis: FullAnalysis;
  lang: Lang;
  onRestart: () => void;
}) {
  const t = messages[lang];
  const { transcribe, content, phone, challenge, safety } = analysis;

  return (
    <div className="space-y-6">
      <VerdictBadge
        verdict={safety.verdict}
        score={safety.suspicion_score}
        headline={lang === 'bm' ? safety.headline_bm : safety.headline_en}
        lang={lang}
      />

      {/* Card 1 — Transcript + Voice Observations */}
      <Card icon={<FileText size={18} />} title={t.card_transcript}>
        <blockquote className="border-l-2 border-[var(--color-ink)]/20 pl-4 italic text-[15px] text-[var(--color-slate)] leading-[1.55]">
          &ldquo;{transcribe.transcript}&rdquo;
        </blockquote>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
          <KV label="Intonation" value={transcribe.voice_observations.intonation} />
          <KV label="Pauses" value={transcribe.voice_observations.pauses} />
          <KV
            label="Breathing"
            value={transcribe.voice_observations.breathing_present ? 'present' : 'absent'}
          />
          <KV label="Pitch" value={transcribe.voice_observations.pitch_stability} />
          <KV label="Emotion" value={transcribe.voice_observations.emotion_authenticity} />
          <KV label="Language" value={transcribe.language} />
        </div>
        {transcribe.voice_observations.synthetic_cues.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <div className="eyebrow mb-2">
              <span>Synthetic cues</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {transcribe.voice_observations.synthetic_cues.map((c, i) => (
                <span key={i} className="ghost-chip">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Card 2 — Red Flags */}
      <Card icon={<AlertTriangle size={18} />} title={t.card_red_flags}>
        {safety.red_flags.length === 0 ? (
          <p className="text-[14px] text-[var(--color-slate)] italic">—</p>
        ) : (
          <ul className="space-y-4">
            {safety.red_flags.map((rf, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                    rf.severity === 'high'
                      ? 'bg-[var(--color-mc-red)]'
                      : rf.severity === 'medium'
                      ? 'bg-[var(--color-signal)]'
                      : 'bg-[var(--color-slate)]'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[15px]">
                    {lang === 'bm' ? rf.label_bm : rf.label_en}
                  </div>
                  {rf.evidence_quote && (
                    <div className="text-[13px] text-[var(--color-slate)] italic mt-1">
                      &ldquo;{rf.evidence_quote}&rdquo;
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Card 3 — Challenge Questions (the wow card) */}
      <Card
        icon={<MessagesSquare size={18} />}
        title={t.card_challenge}
        accent
      >
        <div className="space-y-3 mb-5">
          {challenge.questions.map((q, i) => (
            <div
              key={i}
              className="rounded-[20px] bg-[var(--color-canvas)] border border-[var(--color-border)] px-5 py-4"
            >
              <div className="font-medium text-[15px] leading-[1.4] mb-1">
                {lang === 'bm' ? q.question_bm : q.question_en}
              </div>
              <div className="text-[12px] text-[var(--color-slate)]">{q.why_this_works}</div>
            </div>
          ))}
        </div>
        <CopyBox
          label={`WhatsApp — ${lang === 'bm' ? 'Bahasa Melayu' : 'English'}`}
          text={lang === 'bm' ? challenge.copypaste_whatsapp_bm : challenge.copypaste_whatsapp_en}
          copyLabel={t.copy_to_clipboard}
          copiedLabel={t.copied}
          whatsappLabel={t.send_whatsapp}
          whatsappHelp={t.send_whatsapp_help}
          whatsappPhone={phone.queried_phone}
        />
      </Card>

      {/* Card 4 — Phone Reputation */}
      <Card icon={<Phone size={18} />} title={t.card_phone}>
        {phone.found ? (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-mc-red)]/10 text-[var(--color-mc-red)] flex items-center justify-center shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[16px]">{t.phone_found_yes}</div>
              <div className="text-[13px] text-[var(--color-slate)] mt-1">
                {phone.report_count} {t.phone_reports}
                {phone.last_seen && ` · ${t.phone_last_seen} ${phone.last_seen}`}
              </div>
              {phone.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {phone.tags.map((tag) => (
                    <span key={tag} className="ghost-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E6F4EC] text-[#0A7A3D] flex items-center justify-center shrink-0">
              <Check size={18} />
            </div>
            <p className="text-[14px] text-[var(--color-slate)]">
              {phone.queried_phone ? t.phone_found_no : t.phone_no_input}
            </p>
          </div>
        )}

        {/* External verification sources — always shown */}
        {phone.external_sources && phone.external_sources.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-[var(--color-ink)]" />
              <span className="text-[13px] font-bold tracking-[0.02em] uppercase text-[var(--color-slate)]">
                {lang === 'bm' ? 'Semak Juga Di Sumber Rasmi' : 'Cross-check on Official Sources'}
              </span>
            </div>
            <div className="space-y-2">
              {phone.external_sources.map((src) => (
                <a
                  key={src.name}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3 rounded-[20px] bg-[var(--color-canvas)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors group"
                >
                  <ExternalLink
                    size={16}
                    className="shrink-0 mt-0.5 text-[var(--color-slate)] group-hover:text-[var(--color-ink)] transition-colors"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[14px] group-hover:underline">
                      {src.name}
                    </div>
                    <div className="text-[12px] text-[var(--color-slate)] mt-0.5 leading-[1.45]">
                      {lang === 'bm' ? src.description_bm : src.description_en}
                    </div>
                  </div>
                </a>
              ))}
            </div>
            {phone.queried_phone && (
              <p className="mt-3 text-[11px] text-[var(--color-slate)] italic">
                {lang === 'bm'
                  ? `Salin nombor "${phone.queried_phone}" dan tampalkan pada portal di atas untuk semakan rasmi.`
                  : `Copy the number "${phone.queried_phone}" and paste it on the portals above for official verification.`}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Card 5 — Action Plan + Hotlines */}
      <Card icon={<ListChecks size={18} />} title={t.card_action}>
        <ol className="space-y-4">
          {safety.action_plan.map((step, i) => (
            <li key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--color-ink)] text-[var(--color-canvas)] flex items-center justify-center text-[14px] font-medium shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] leading-[1.4]">
                  {lang === 'bm' ? step.step_bm : step.step_en}
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.04em] uppercase border ${
                      step.urgency === 'immediate'
                        ? 'border-[var(--color-mc-red)]/40 text-[var(--color-mc-red)] bg-[var(--color-mc-red)]/5'
                        : step.urgency === 'soon'
                        ? 'border-[var(--color-signal)]/40 text-[var(--color-signal)] bg-[var(--color-signal)]/5'
                        : 'border-[var(--color-border)] text-[var(--color-slate)]'
                    }`}
                  >
                    {step.urgency === 'immediate'
                      ? t.urgency_immediate
                      : step.urgency === 'soon'
                      ? t.urgency_soon
                      : t.urgency_later}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="pt-6 mt-6 border-t border-[var(--color-border)]">
          <div className="eyebrow mb-3">
            <span>{t.hotlines}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {safety.hotlines.map((h) => (
              <a
                key={h.label}
                href={`tel:${h.value.replace(/[\s-]/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-canvas)] border border-[var(--color-border)] hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-canvas)] transition-all text-[13px]"
              >
                <PhoneCall size={14} />
                <span className="font-medium">{h.label}</span>
                <span className="opacity-70">{h.value}</span>
              </a>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <button onClick={onRestart} className="outline-pill">
          <RotateCcw size={16} />
          {t.analyze_another}
        </button>
      </div>
    </div>
  );
}

/* ──── Subcomponents ──── */

function Card({
  icon,
  title,
  children,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[40px] border p-6 md:p-8 ${
        accent
          ? 'bg-[var(--color-ink)] text-[var(--color-canvas)] border-transparent'
          : 'bg-[var(--color-lifted)] border-[var(--color-border)]'
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            accent
              ? 'bg-[var(--color-signal-light)] text-white'
              : 'bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink)]'
          }`}
        >
          {icon}
        </div>
        <h3 className={`${accent ? 'text-[var(--color-canvas)]' : ''} text-[22px]`}>{title}</h3>
      </div>
      <div className={accent ? '[&_.ghost-chip]:bg-white/10 [&_.ghost-chip]:text-white/90 [&_.ghost-chip]:border-white/20' : ''}>
        {children}
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
      <span className="text-[10px] font-bold tracking-[0.04em] uppercase text-[var(--color-slate)]">
        {label}
      </span>
      <span className="text-[13px] font-medium capitalize">{value}</span>
    </div>
  );
}

function CopyBox({
  label,
  text,
  copyLabel,
  copiedLabel,
  whatsappLabel,
  whatsappHelp,
  whatsappPhone,
}: {
  label: string;
  text: string;
  copyLabel: string;
  copiedLabel: string;
  whatsappLabel?: string;
  whatsappHelp?: string;
  whatsappPhone?: string;
}) {
  const [copied, setCopied] = useState(false);

  // wa.me/{phone} deep-links the specific contact; wa.me/?text= opens the chat
  // picker if no phone was provided. Phone must be digits only for wa.me.
  const waHref = (() => {
    const encoded = encodeURIComponent(text);
    const digits = whatsappPhone?.replace(/\D/g, '') ?? '';
    return digits ? `https://wa.me/${digits}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  })();

  return (
    <div className="rounded-[24px] bg-white/5 border border-white/10 p-5">
      <div className="text-[11px] font-bold tracking-[0.04em] uppercase opacity-70 mb-2">
        {label}
      </div>
      <p className="text-[15px] leading-[1.5] mb-4 whitespace-pre-line">{text}</p>
      <div className="flex flex-wrap gap-2 items-center">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
          title={whatsappHelp}
        >
          <Send size={14} />
          {whatsappLabel ?? 'WhatsApp'}
        </a>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-canvas)] text-[var(--color-ink)] text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  );
}
