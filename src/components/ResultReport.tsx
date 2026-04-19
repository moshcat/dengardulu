'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, Phone, AlertTriangle, ListChecks, MessagesSquare, FileText, PhoneCall } from 'lucide-react';
import { VerdictBadge } from './VerdictBadge';
import { messages, Lang } from '@/i18n/messages';
import type { FullAnalysis } from '@/ai/schemas';
import { cn } from '@/lib/utils';

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
    <div className="space-y-4">
      <VerdictBadge
        verdict={safety.verdict}
        score={safety.suspicion_score}
        headline={lang === 'bm' ? safety.headline_bm : safety.headline_en}
        lang={lang}
      />

      {/* Card 1: Transcript + Voice Observations */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <FileText className="size-5 text-muted-foreground" />
          <CardTitle>{t.card_transcript}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <blockquote className="border-l-2 pl-3 italic text-sm text-muted-foreground">
            &ldquo;{transcribe.transcript}&rdquo;
          </blockquote>
          <div className="grid grid-cols-2 gap-2 text-xs">
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
            <div>
              <div className="text-xs font-medium mb-1">Synthetic cues</div>
              <div className="flex flex-wrap gap-1">
                {transcribe.voice_observations.synthetic_cues.map((c, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 2: Red Flags */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="size-5 text-amber-600" />
          <CardTitle>{t.card_red_flags}</CardTitle>
        </CardHeader>
        <CardContent>
          {safety.red_flags.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">—</div>
          ) : (
            <ul className="space-y-2">
              {safety.red_flags.map((rf, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={cn(
                      'size-2 rounded-full mt-2 shrink-0',
                      rf.severity === 'high' && 'bg-destructive',
                      rf.severity === 'medium' && 'bg-amber-500',
                      rf.severity === 'low' && 'bg-muted-foreground'
                    )}
                  />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{lang === 'bm' ? rf.label_bm : rf.label_en}</div>
                    {rf.evidence_quote && (
                      <div className="text-xs text-muted-foreground italic mt-0.5">
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

      {/* Card 3: Challenge Questions */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <MessagesSquare className="size-5 text-primary" />
          <CardTitle>{t.card_challenge}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {challenge.questions.map((q, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-1">
              <div className="font-medium">
                {lang === 'bm' ? q.question_bm : q.question_en}
              </div>
              <div className="text-xs text-muted-foreground">{q.why_this_works}</div>
            </div>
          ))}
          <CopyBox
            label={`📱 WhatsApp (${lang === 'bm' ? 'Bahasa Melayu' : 'English'})`}
            text={lang === 'bm' ? challenge.copypaste_whatsapp_bm : challenge.copypaste_whatsapp_en}
            copyLabel={t.copy_to_clipboard}
            copiedLabel={t.copied}
          />
        </CardContent>
      </Card>

      {/* Card 4: Phone Reputation */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Phone className="size-5 text-muted-foreground" />
          <CardTitle>{t.card_phone}</CardTitle>
        </CardHeader>
        <CardContent>
          {phone.found ? (
            <div className="flex items-start gap-3">
              <Badge variant="destructive">⚠</Badge>
              <div>
                <div className="font-medium">{t.phone_found_yes}</div>
                <div className="text-sm text-muted-foreground">
                  {phone.report_count} {t.phone_reports}
                  {phone.last_seen && ` • ${t.phone_last_seen} ${phone.last_seen}`}
                </div>
                {phone.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {phone.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">✓</Badge>
              <span>{t.phone_found_no}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 5: Action Plan + Hotlines */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <ListChecks className="size-5 text-primary" />
          <CardTitle>{t.card_action}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-2">
            {safety.action_plan.map((step, i) => (
              <li key={i} className="flex gap-3">
                <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm">{lang === 'bm' ? step.step_bm : step.step_en}</div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs mt-1',
                      step.urgency === 'immediate' && 'border-destructive text-destructive',
                      step.urgency === 'soon' && 'border-amber-500 text-amber-700'
                    )}
                  >
                    {step.urgency === 'immediate'
                      ? t.urgency_immediate
                      : step.urgency === 'soon'
                        ? t.urgency_soon
                        : t.urgency_later}
                  </Badge>
                </div>
              </li>
            ))}
          </ol>
          <div className="pt-3 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-2">{t.hotlines}</div>
            <div className="flex flex-wrap gap-2">
              {safety.hotlines.map((h) => (
                <a
                  key={h.label}
                  href={`tel:${h.value.replace(/[\s-]/g, '')}`}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-muted"
                >
                  <PhoneCall className="size-3" />
                  <span className="font-medium">{h.label}</span>
                  <span className="text-muted-foreground">{h.value}</span>
                </a>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={onRestart}>
          {t.analyze_another}
        </Button>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function CopyBox({
  label,
  text,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  text: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-muted/40 rounded-lg border p-3 space-y-2">
      <div className="text-xs font-medium">{label}</div>
      <p className="text-sm">{text}</p>
      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="size-3 mr-1" /> : <Copy className="size-3 mr-1" />}
        {copied ? copiedLabel : copyLabel}
      </Button>
    </div>
  );
}
