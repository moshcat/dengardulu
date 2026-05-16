'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  BadgeCheck,
  Share2,
  ClipboardList,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardIconHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  const [isElderly, setIsElderly] = useState(false);

  useEffect(() => {
    setIsElderly(document.documentElement.dataset.elderly === 'true');
  }, []);

  return (
    <div className="space-y-6">
      <VerdictBadge
        verdict={safety.verdict}
        score={safety.suspicion_score}
        headline={lang === 'bm' ? safety.headline_bm : safety.headline_en}
        lang={lang}
        isElderly={isElderly}
      />

      {/* Card 1 — Transcript + Voice Observations */}
      {!isElderly && (
        <Card variant="stadium">
          <CardIconHeader icon={<FileText size={18} />} title={t.card_transcript} />
          <CardContent>
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
                    <Badge key={i} variant="chip">{c}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card 2 — Red Flags */}
      <Card variant="stadium">
        <CardIconHeader icon={<AlertTriangle size={18} />} title={t.card_red_flags} />
        <CardContent>
          {safety.red_flags.length === 0 ? (
            <p className="text-[14px] text-[var(--color-slate)] italic">—</p>
          ) : (
            <ul className="space-y-4">
              {(isElderly ? safety.red_flags.slice(0, 2) : safety.red_flags).map((rf, i) => (
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
        </CardContent>
      </Card>

      {/* Card 3 — Challenge Questions */}
      <Card variant="accent">
        <CardIconHeader icon={<MessagesSquare size={18} />} title={t.card_challenge} />
        <CardContent>
          <div className="space-y-3 mb-5">
            {challenge.questions.map((q, i) => (
              <div
                key={i}
                className="rounded-[20px] bg-[var(--color-canvas)] border border-[var(--color-border)] px-5 py-4"
              >
                <div className="font-medium text-[15px] leading-[1.4] mb-1 text-[var(--color-ink)]">
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
        </CardContent>
      </Card>

      {/* Card 4 — Phone Reputation */}
      <Card variant="stadium">
        <CardIconHeader icon={<Phone size={18} />} title={t.card_phone} />
        <CardContent>
          {(phone.source === 'semakmule' || phone.source === 'semakmule+firestore') && (
            <Badge variant="source" className="mb-4 gap-1.5 shrink">
              <BadgeCheck size={12} />
              {phone.source === 'semakmule+firestore'
                ? (lang === 'bm' ? 'Sumber: Semakmule PDRM + Laporan Komuniti' : 'Source: Semakmule PDRM + Community Reports')
                : (lang === 'bm' ? 'Sumber: Semakmule PDRM · Data Langsung' : 'Source: Semakmule PDRM · Live Data')}
            </Badge>
          )}
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
                      <Badge key={tag} variant="chip">{tag}</Badge>
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

          {phone.external_sources && phone.external_sources.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={16} className="text-[var(--color-ink)]" />
                <span className="text-[13px] font-bold tracking-[0.02em] uppercase text-[var(--color-slate)]">
                  {lang === 'bm' ? 'Semak Juga Di Sumber Rasmi' : 'Cross-check on Official Sources'}
                </span>
              </div>
              <div className="space-y-2.5">
                {phone.external_sources.map((src) => (
                  <a
                    key={src.name}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-5 py-3.5 rounded-[20px] bg-[var(--color-canvas)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors group"
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
          {phone.queried_phone && (
            <div className="mt-4">
              <ReportButton phone={phone.queried_phone} lang={lang} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 5 — Action Plan + Hotlines */}
      <Card variant="stadium">
        <CardIconHeader icon={<ListChecks size={18} />} title={t.card_action} />
        <CardContent>
          <ol className="space-y-5">
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
                    <Badge
                      variant={
                        step.urgency === 'immediate'
                          ? 'urgency-immediate'
                          : step.urgency === 'soon'
                          ? 'urgency-soon'
                          : 'urgency-later'
                      }
                    >
                      {step.urgency === 'immediate'
                        ? t.urgency_immediate
                        : step.urgency === 'soon'
                        ? t.urgency_soon
                        : t.urgency_later}
                    </Badge>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="pt-6 mt-8 border-t border-[var(--color-border)]">
            <div className="eyebrow mb-4">
              <span>{t.hotlines}</span>
            </div>
            <div className="space-y-2.5">
              {safety.hotlines.map((h) => (
                <a
                  key={h.label}
                  href={`tel:${h.value.replace(/[\s-]/g, '')}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-[16px] bg-[var(--color-canvas)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-ink)] text-[var(--color-canvas)] flex items-center justify-center shrink-0">
                      <PhoneCall size={14} />
                    </div>
                    <span className="text-[13px] sm:text-[14px] font-medium truncate">{h.label}</span>
                  </div>
                  <span className="text-[14px] font-semibold tracking-tight shrink-0 whitespace-nowrap">{h.value}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <CcidReportDialog analysis={analysis} lang={lang} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-4 pt-6 pb-8">
        <ShareButton analysis={analysis} lang={lang} />
        <Button variant="outline-pill" size="pill" onClick={onRestart}>
          <RotateCcw size={16} />
          {t.analyze_another}
        </Button>
      </div>
    </div>
  );
}

function ReportButton({ phone, lang }: { phone: string; lang: Lang }) {
  const t = messages[lang];
  const [loading, setLoading] = useState(false);

  const report = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/report-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        toast.success(t.report_success);
      } else {
        toast.error(t.report_error);
      }
    } catch {
      toast.error(t.report_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline-pill"
      size="pill"
      onClick={report}
      disabled={loading}
      className="w-full justify-center"
    >
      <AlertTriangle size={16} />
      {t.report_number}
    </Button>
  );
}

function generateCcidReport(analysis: FullAnalysis, lang: Lang): string {
  const { transcribe, safety, phone } = analysis;
  const date = new Date().toLocaleDateString('ms-MY');
  const phoneStr = phone.queried_phone || '[NO_TEL_SUSPEK]';
  const flags = safety.red_flags
    .map((f, i) => `${i + 1}. ${lang === 'bm' ? f.label_bm : f.label_en}`)
    .join('\n');

  const deepfakePara = safety.suspicion_score >= 60
    ? `\nSaya mengesyaki bahawa pemanggil tersebut telah menggunakan teknologi manipulasi suara (voice deepfake). Analisis DengarDulu menunjukkan skor risiko ${safety.suspicion_score}/100 (${safety.verdict}).`
    : '';

  return `[DRAF LAPORAN POLIS — CCID]

BUTIRAN PENGADU
Nama: [NAMA_ANDA]
No. Kad Pengenalan / Pasport: [NO_IC_ANDA]
No. Telefon: [NO_TEL_ANDA]
Alamat Semasa: [ALAMAT_ANDA]

KETERANGAN KEJADIAN
Pada [TARIKH_KEJADIAN], jam lebih kurang [MASA_KEJADIAN], saya telah menerima satu panggilan telefon daripada nombor ${phoneStr}.

Pemanggil telah memberitahu bahawa:
"${transcribe.transcript}"
${deepfakePara}
Tanda-tanda mencurigakan yang dikesan:
${flags}

${phone.found ? `Nombor ${phoneStr} telah dilaporkan sebanyak ${phone.report_count} kali dalam pangkalan data.` : `Nombor ${phoneStr} tidak ditemui dalam pangkalan data PDRM.`}

TINDAKAN YANG DIMOHON
Saya memohon pihak polis menyiasat perkara ini di bawah seksyen berkaitan Kanun Keseksaan / Akta 588 (Akta Perlindungan Data Peribadi) / Akta 998 (Akta Jenayah Komputer).

---
Draf ini dijana oleh DengarDulu pada ${date} sebagai rujukan pelaporan.
Sila lengkapkan bahagian [ ] sebelum menyerahkan kepada pihak berkuasa.`;
}

function CcidReportDialog({ analysis, lang }: { analysis: FullAnalysis; lang: Lang }) {
  const t = messages[lang];
  const [open, setOpen] = useState(false);
  const report = generateCcidReport(analysis, lang);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline-pill" size="pill" onClick={() => setOpen(true)}>
        <ClipboardList size={16} />
        {t.generate_report}
      </Button>
      {open && (
        <DialogContent showCloseButton className="rounded-[32px] max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.generate_report}</DialogTitle>
            <DialogDescription className="text-[13px] text-[var(--color-slate)] leading-relaxed">
              {lang === 'bm'
                ? 'Draf ini telah diisi dengan data analisis. Lengkapkan bahagian [ ] sebelum menyerahkan.'
                : 'This draft is pre-filled with analysis data. Complete the [ ] sections before submitting.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto rounded-[20px] bg-[var(--color-canvas)] border border-[var(--color-border)] p-4 text-[13px] leading-[1.6] text-[var(--color-ink)] whitespace-pre-line">
            {report}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="ink-pill"
              size="pill-sm"
              className="w-full justify-center"
              onClick={async () => {
                await navigator.clipboard.writeText(report);
                toast.success(t.report_copied);
              }}
            >
              <Copy size={14} />
              {t.copy_report}
            </Button>
            <Button
              variant="outline-pill"
              size="pill-sm"
              className="w-full justify-center"
              nativeButton={false}
              render={
                <a
                  href="https://ereporting.rmp.gov.my/index.aspx/"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ExternalLink size={14} />
              {t.go_to_ereporting}
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

function generateShareText(analysis: FullAnalysis, lang: Lang): string {
  const { safety, challenge } = analysis;
  const topFlags = safety.red_flags
    .slice(0, 3)
    .map((f) => `- ${lang === 'bm' ? f.label_bm : f.label_en}`)
    .join('\n');
  const question =
    lang === 'bm'
      ? challenge.questions[0].question_bm
      : challenge.questions[0].question_en;

  return lang === 'bm'
    ? `DengarDulu — Analisis Nota Suara\n\nVerdict: ${safety.verdict} (${safety.suspicion_score}/100)\n\nBendera Merah:\n${topFlags}\n\nSoalan Pengesahan:\n"${question}"\n\nSemak sendiri di: https://dengardulu-169906713421.asia-southeast1.run.app`
    : `DengarDulu — Voice Note Analysis\n\nVerdict: ${safety.verdict} (${safety.suspicion_score}/100)\n\nRed Flags:\n${topFlags}\n\nVerification Question:\n"${question}"\n\nCheck it yourself: https://dengardulu-169906713421.asia-southeast1.run.app`;
}

function ShareButton({ analysis, lang }: { analysis: FullAnalysis; lang: Lang }) {
  const t = messages[lang];

  const share = async () => {
    const text = generateShareText(analysis, lang);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'DengarDulu', text });
      } catch {
        // user cancelled share sheet
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success(t.share_copied);
    }
  };

  return (
    <Button variant="outline-pill" size="pill" onClick={share}>
      <Share2 size={16} />
      {t.share_result}
    </Button>
  );
}

/* ──── Subcomponents ──── */

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
  const waHref = (() => {
    const encoded = encodeURIComponent(text);
    let digits = whatsappPhone?.replace(/\D/g, '') ?? '';
    if (digits.startsWith('0')) digits = '60' + digits.slice(1);
    if (digits && !digits.startsWith('60')) digits = '60' + digits;
    return digits ? `https://wa.me/${digits}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  })();

  return (
    <div className="rounded-[24px] bg-white/5 border border-white/10 p-5 pb-6">
      <div className="text-[11px] font-bold tracking-[0.04em] uppercase opacity-70 mb-3">
        {label}
      </div>
      <p className="text-[15px] leading-[1.5] mb-5 whitespace-pre-line">{text}</p>
      <div className="flex flex-wrap gap-3 items-center">
        <Button
          variant="ink-pill"
          size="pill-sm"
          nativeButton={false}
          className="bg-[#25D366] border-[#25D366] hover:opacity-90"
          render={
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              title={whatsappHelp}
            />
          }
        >
          <Send size={14} />
          {whatsappLabel ?? 'WhatsApp'}
        </Button>
        <Button
          variant="outline-pill"
          size="pill-sm"
          className="bg-[var(--color-canvas)] text-[var(--color-ink)] border-[var(--color-canvas)]"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            toast.success(copiedLabel);
          }}
        >
          <Copy size={14} />
          {copyLabel}
        </Button>
      </div>
    </div>
  );
}
