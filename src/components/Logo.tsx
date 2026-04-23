/**
 * DengarDulu logo.
 *
 * Concept: A dynamic soundwave (waveform) composed of vertical "pills", 
 * echoing the project's Mastercard-inspired design system. 
 *
 * The central, tallest bar is Signal Light (#F37338), representing the 
 * "AI Spark" or the moment of critical listening. The surrounding bars 
 * are Ink Black, representing the steady flow of incoming audio.
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DengarDulu"
      role="img"
    >
      {/* Soundwave bars (vertical pills) - Centered and symmetric-ish */}
      <line x1="8" y1="16" x2="8" y2="24" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
      <line x1="14" y1="11" x2="14" y2="29" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" y1="5" x2="20" y2="35" stroke="var(--color-signal-light)" strokeWidth="4" strokeLinecap="round" />
      <line x1="26" y1="11" x2="26" y2="29" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
      <line x1="32" y1="16" x2="32" y2="24" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function LogoMarkOnDark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DengarDulu"
      role="img"
    >
      <line x1="8" y1="16" x2="8" y2="24" stroke="var(--color-canvas)" strokeWidth="4" strokeLinecap="round" />
      <line x1="14" y1="11" x2="14" y2="29" stroke="var(--color-canvas)" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" y1="5" x2="20" y2="35" stroke="var(--color-signal-light)" strokeWidth="4" strokeLinecap="round" />
      <line x1="26" y1="11" x2="26" y2="29" stroke="var(--color-canvas)" strokeWidth="4" strokeLinecap="round" />
      <line x1="32" y1="16" x2="32" y2="24" stroke="var(--color-canvas)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function LogoWordmark({
  size = 28,
  onDark = false,
}: {
  size?: number;
  onDark?: boolean;
}) {
  const Mark = onDark ? LogoMarkOnDark : LogoMark;
  return (
    <div className="flex items-center gap-2.5">
      <Mark size={size} />
      <span
        className="font-semibold tracking-tight leading-none"
        style={{
          fontSize: `${Math.round(size * 0.68)}px`,
          color: onDark ? 'var(--color-canvas)' : 'var(--color-ink)',
        }}
      >
        DengarDulu
      </span>
    </div>
  );
}
