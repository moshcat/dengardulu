'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Shield, Waves, MessageCircleQuestion, PhoneCall, ExternalLink } from 'lucide-react';
import { messages, Lang } from '@/i18n/messages';
import { LogoWordmark } from '@/components/Logo';

export default function Home() {
  const [lang, setLang] = useState<Lang>('en');
  const t = messages[lang];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Floating Navigation Pill */}
      <nav className="floating-nav">
        <LogoWordmark size={28} />
        <div className="hidden md:flex items-center gap-10 text-[15px] font-medium">
          <a href="#hero" className="hover:opacity-60 transition-opacity">Home</a>
          <a href="#how" className="hover:opacity-60 transition-opacity">How it works</a>
          <a href="#impact" className="hover:opacity-60 transition-opacity">Impact</a>
          <Link href="/analyze" className="hover:opacity-60 transition-opacity">Analyze</Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              lang === 'en' ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]' : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('bm')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              lang === 'bm' ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]' : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            BM
          </button>
        </div>
      </nav>

      <main className="flex-1 pt-32 pb-24">
        {/* ───────── HERO STADIUM ───────── */}
        <section id="hero" className="px-6 mb-32">
          <div className="max-w-[1280px] mx-auto">
            <div className="relative rounded-[40px] bg-[var(--color-ink)] overflow-hidden min-h-[560px] md:min-h-[620px]">
              {/* Soundwave ambient backdrop */}
              <SoundwaveBackdrop />

              <div className="relative z-10 h-full flex flex-col justify-between px-8 md:px-16 py-12 md:py-20 min-h-[560px] md:min-h-[620px]">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-signal)]/15 border border-[var(--color-signal)]/30 mb-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-signal-light)]" />
                    <span className="text-[12px] font-bold tracking-[0.04em] uppercase text-[var(--color-signal-light)]">
                      Secure Digital · FinTech
                    </span>
                  </div>
                  <h1 className="text-[var(--color-canvas)] max-w-3xl">
                    {t.hero_headline}
                  </h1>
                  <p className="mt-6 text-[var(--color-taupe)] max-w-xl text-[18px] leading-[1.5]">
                    {t.hero_sub}
                  </p>
                  <div className="mt-10 flex flex-wrap gap-3">
                    <Link href="/analyze" className="ink-pill !bg-[var(--color-canvas)] !text-[var(--color-ink)] !border-[var(--color-canvas)]">
                      {t.cta_check_now}
                      <ArrowRight size={18} />
                    </Link>
                    <a href="#how" className="outline-pill !bg-transparent !text-[var(--color-canvas)] !border-[var(--color-canvas)]/40">
                      How it works
                    </a>
                  </div>
                </div>

                {/* Stats strip at bottom of hero */}
                <div className="mt-12 md:mt-0 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 pt-12 border-t border-white/10">
                  <Stat label={t.stat_cases} emphasis="454+" />
                  <Stat label={t.stat_losses} emphasis="RM 2.72M" />
                  <Stat label={t.stat_warning} emphasis="—" subtle />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── GHOST WATERMARK SECTION HEADER ───────── */}
        <section id="how" className="relative px-6 py-20 overflow-hidden">
          <div className="ghost-watermark absolute top-4 left-1/2 -translate-x-1/2 text-[140px] md:text-[220px] whitespace-nowrap -z-10">
            {lang === 'bm' ? 'BAGAIMANA' : 'HOW IT WORKS'}
          </div>
          <div className="max-w-[1200px] mx-auto text-center mb-16 pt-24">
            <div className="eyebrow justify-center mb-5">
              <span>{lang === 'bm' ? 'Proses' : 'Process'}</span>
            </div>
            <h2 className="max-w-3xl mx-auto">
              {lang === 'bm'
                ? 'Tiga langkah. Lima belas saat. Satu keputusan selamat.'
                : 'Three steps. Fifteen seconds. One safe decision.'}
            </h2>
          </div>

          {/* Asymmetric constellation with orbital arc */}
          <div className="max-w-[1200px] mx-auto relative">
            <svg className="absolute top-20 left-0 w-full h-[600px] pointer-events-none -z-10 hidden md:block" viewBox="0 0 1200 600" preserveAspectRatio="none">
              <path d="M 180 340 Q 600 60 1020 340" fill="none" stroke="var(--color-signal-light)" strokeWidth="1" strokeDasharray="4,8" opacity="0.55" />
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
              <Portrait
                icon={<Waves size={56} strokeWidth={1.5} />}
                eyebrow="01"
                title={t.feat_1_title}
                desc={t.feat_1_desc}
                tone="cream"
                offset={0}
              />
              <Portrait
                icon={<Shield size={56} strokeWidth={1.5} />}
                eyebrow="02"
                title={t.feat_2_title}
                desc={t.feat_2_desc}
                tone="orange"
                offset={100}
              />
              <Portrait
                icon={<MessageCircleQuestion size={56} strokeWidth={1.5} />}
                eyebrow="03"
                title={t.feat_3_title}
                desc={t.feat_3_desc}
                tone="ink"
                offset={40}
              />
            </div>
          </div>
        </section>

        {/* ───────── IMPACT STRIP ───────── */}
        <section id="impact" className="px-6 py-24">
          <div className="max-w-[1200px] mx-auto">
            <div className="rounded-[40px] bg-[var(--color-lifted)] p-10 md:p-16 border border-[var(--color-border)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="eyebrow mb-4">
                    <span>{lang === 'bm' ? 'Kesan' : 'Impact'}</span>
                  </div>
                  <h2 className="mb-6">
                    {lang === 'bm'
                      ? 'Dibina khas untuk konteks Malaysia.'
                      : 'Built specifically for Malaysia.'}
                  </h2>
                  <p className="text-[var(--color-slate)] text-[17px] leading-[1.5] max-w-lg">
                    {lang === 'bm'
                      ? 'Faham Bahasa Melayu, Bahasa Inggeris dan Manglish. Dilatih dengan corak penipuan tempatan dan disokong hotline PDRM, BNM, serta CCID.'
                      : 'Understands Bahasa Melayu, English and Manglish. Trained on local scam patterns and backed by PDRM, BNM and CCID hotlines.'}
                  </p>
                </div>
                <div className="space-y-4">
                  <HotlineRow icon="CCID" label="Scam Response Centre" number="03-2610 1559" />
                  <HotlineRow icon="BNMTELELINK" label="Bank Negara Malaysia" number="1-300-88-5465" />
                  <HotlineRow icon="999" label="Emergency Response" number="999" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── CTA STRIP ───────── */}
        <section className="px-6 py-16">
          <div className="max-w-[1200px] mx-auto text-center">
            <h2 className="mb-6 max-w-2xl mx-auto">
              {lang === 'bm' ? t.tagline : t.tagline}
            </h2>
            <p className="text-[var(--color-slate)] mb-8 max-w-xl mx-auto">
              {lang === 'bm'
                ? 'Mula analisis nota suara anda. Percuma. Tiada login.'
                : 'Analyze your voice note now. Free. No login required.'}
            </p>
            <Link href="/analyze" className="ink-pill">
              {t.cta_check_now}
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* ───────── DARK FOOTER ───────── */}
      <footer className="bg-[var(--color-ink)] text-white pt-20 pb-16 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-white mb-16 max-w-2xl">
            {lang === 'bm'
              ? 'Dengar dulu. Jawab kemudian. Selamat seterusnya.'
              : "Listen first. Answer wisely. Stay safe next."}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <FooterCol title="Product">
              <FooterLink href="/analyze">Analyze Audio</FooterLink>
              <FooterLink href="#how">How it works</FooterLink>
              <FooterLink href="#impact">Impact</FooterLink>
            </FooterCol>
            <FooterCol title="Hackathon">
              <FooterLink href="https://projek2030.gdguctm.my" external>Project 2030</FooterLink>
              <FooterLink href="https://gdg.community.dev/gdg-on-campus-universiti-teknologi-malaysia-skudai-malaysia/" external>GDG UTM</FooterLink>
              <FooterLink href="#">Track 5 · FinTech</FooterLink>
            </FooterCol>
            <FooterCol title="Built with">
              <FooterLink href="https://gemini.google.com" external>Gemini 2.5 Flash</FooterLink>
              <FooterLink href="https://firebase.google.com/docs/genkit" external>Firebase Genkit</FooterLink>
              <FooterLink href="https://cloud.google.com/run" external>Cloud Run</FooterLink>
            </FooterCol>
            <FooterCol title="Hotlines">
              <FooterLink href="tel:+60326101559">CCID · 03-2610 1559</FooterLink>
              <FooterLink href="tel:1300885465">BNM · 1-300-88-5465</FooterLink>
              <FooterLink href="tel:999">999</FooterLink>
            </FooterCol>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <p className="text-[13px] text-white/50 max-w-2xl leading-[1.5]">
              {t.footer_disclaimer}
            </p>
            <div className="flex items-center gap-4 shrink-0">
              <div className="px-5 py-2 rounded-full border border-white/40 text-[13px]">
                {t.footer_built}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────── Subcomponents ─────────────────── */

function Stat({ label, emphasis, subtle }: { label: string; emphasis: string; subtle?: boolean }) {
  return (
    <div>
      <div className={`text-[36px] md:text-[44px] font-medium leading-none tracking-[-0.02em] ${subtle ? 'text-[var(--color-signal-light)]' : 'text-[var(--color-canvas)]'}`}>
        {emphasis}
      </div>
      <div className="mt-2 text-[14px] text-[var(--color-taupe)] leading-[1.4]">
        {label}
      </div>
    </div>
  );
}

function Portrait({
  icon,
  eyebrow,
  title,
  desc,
  tone,
  offset,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  desc: string;
  tone: 'cream' | 'orange' | 'ink';
  offset: number;
}) {
  const bgMap = {
    cream: 'bg-[var(--color-lifted)] text-[var(--color-ink)] border-[var(--color-border)]',
    orange: 'bg-[var(--color-signal-light)] text-white border-transparent',
    ink: 'bg-[var(--color-ink)] text-[var(--color-canvas)] border-transparent',
  };

  return (
    <div className="relative flex flex-col items-center text-center" style={{ marginTop: offset }}>
      <div className={`relative w-[240px] h-[240px] md:w-[280px] md:h-[280px] rounded-full flex items-center justify-center border ${bgMap[tone]}`}>
        {icon}
        <div className="satellite">
          <ArrowRight size={20} className="text-[var(--color-ink)]" />
        </div>
      </div>
      <div className="eyebrow mt-12 mb-3">
        <span>{eyebrow}</span>
      </div>
      <h3 className="mb-3 max-w-[280px]">{title}</h3>
      <p className="text-[15px] text-[var(--color-slate)] max-w-[300px] leading-[1.5]">
        {desc}
      </p>
    </div>
  );
}

function HotlineRow({ icon, label, number }: { icon: string; label: string; number: string }) {
  return (
    <a
      href={`tel:${number.replace(/[^0-9+]/g, '')}`}
      className="flex items-center justify-between gap-4 px-5 py-4 rounded-full bg-[var(--color-canvas)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] text-[var(--color-canvas)] flex items-center justify-center">
          <PhoneCall size={16} />
        </div>
        <div>
          <div className="text-[11px] font-bold tracking-[0.04em] uppercase text-[var(--color-slate)]">{icon}</div>
          <div className="text-[14px] font-medium leading-[1.2]">{label}</div>
        </div>
      </div>
      <div className="text-[15px] font-semibold tracking-tight">{number}</div>
    </a>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-[12px] font-bold tracking-[0.04em] uppercase text-white/40">{title}</span>
      {children}
    </div>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="text-[14px] font-[450] text-white/80 hover:text-[var(--color-signal-light)] transition-colors inline-flex items-center gap-1"
    >
      {children}
      {external && <ExternalLink size={11} className="opacity-60" />}
    </a>
  );
}

function SoundwaveBackdrop() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      viewBox="0 0 1200 600"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wave-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F37338" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#F37338" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F37338" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 40 }).map((_, i) => {
        const x = 30 + i * 30;
        const h = 80 + Math.sin(i * 0.45) * 120 + Math.cos(i * 1.2) * 60;
        const y = 300 - h / 2;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width="6"
            height={h}
            rx="3"
            fill="url(#wave-gradient)"
          />
        );
      })}
    </svg>
  );
}
