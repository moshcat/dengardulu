'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Eye, EyeOff, Menu, X, Globe, HelpCircle, Download } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { LogoWordmark } from './Logo';
import { messages, Lang } from '@/i18n/messages';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

export function NavBar({
  lang,
  onLangChange,
  onElderly,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onElderly?: (enabled: boolean) => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isElderly, setIsElderly] = useState(false);
  const { canInstall, install } = usePWAInstall();
  const t = messages[lang];

  useEffect(() => {
    setIsElderly(document.documentElement.dataset.elderly === 'true');
  }, []);

  const toggleElderly = () => {
    const next = !isElderly;
    setIsElderly(next);
    document.documentElement.setAttribute('data-elderly', String(next));
    localStorage.setItem('dengardulu_elderly', String(next));
    onElderly?.(next);
  };

  const navBtnBase =
    'h-8 rounded-full border text-[12px] font-bold tracking-[0.02em] uppercase transition-colors flex items-center justify-center';
  const navBtnIdle =
    'bg-[var(--color-lifted)] text-[var(--color-ink)] border-[var(--color-border)] hover:border-[var(--color-ink)]/40';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-canvas)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link
            href="/"
            className="flex-shrink-0 flex items-center hover:opacity-70 transition-opacity"
            aria-label="DengarDulu home"
          >
            <LogoWordmark size={24} />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {[
              { href: '/', label: 'Home' },
              { href: '#how', label: 'How it works' },
              { href: '#impact', label: 'Impact' },
              { href: '/analyze', label: 'Analyze' },
              { href: '/history', label: 'History' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] font-medium text-[var(--color-granite)] hover:text-[var(--color-ink)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                data-tour="lang-switch"
                className={`${navBtnBase} ${navBtnIdle} gap-1 px-2.5 cursor-pointer`}
                aria-label="Select language"
              >
                <Globe size={12} className="text-[var(--color-slate)]" />
                <span>{lang === 'en' ? 'EN' : 'BM'}</span>
                <ChevronDown size={10} className="text-[var(--color-slate)]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 rounded-2xl bg-[var(--color-lifted)] border-[var(--color-border)]"
              >
                <DropdownMenuRadioGroup
                  value={lang}
                  onValueChange={(v) => onLangChange(v as Lang)}
                >
                  <DropdownMenuRadioItem value="en" className="rounded-xl text-[13px] font-medium py-2.5 px-4">
                    English
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="bm" className="rounded-xl text-[13px] font-medium py-2.5 px-4">
                    Bahasa Melayu
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={toggleElderly}
              data-tour="easy-mode"
              title={t.elderly_mode}
              className={`${navBtnBase} gap-1 px-2.5 ${
                isElderly
                  ? 'bg-[var(--color-signal)] text-white border-[var(--color-signal)]'
                  : navBtnIdle
              }`}
              aria-label={t.elderly_mode}
              aria-pressed={isElderly}
            >
              {isElderly ? <Eye size={13} /> : <EyeOff size={13} />}
              <span className="hidden sm:inline">{isElderly ? 'ON' : 'OFF'}</span>
            </button>

            {canInstall && (
              <button
                onClick={install}
                title={t.install_app}
                className={`${navBtnBase} bg-[var(--color-signal)] text-white border-[var(--color-signal)] gap-1 px-2.5`}
                aria-label={t.install_app}
              >
                <Download size={13} />
                <span className="hidden sm:inline">{t.install_app}</span>
              </button>
            )}

            <button
              onClick={() => window.dispatchEvent(new Event('walkthrough:restart'))}
              title={lang === 'bm' ? 'Panduan' : 'Tour'}
              className={`${navBtnBase} ${navBtnIdle} w-8`}
              aria-label="Restart tour"
            >
              <HelpCircle size={13} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${navBtnBase} ${navBtnIdle} w-8 md:hidden`}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-lifted)] -mx-4 px-6 py-2"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {[
              { href: '/', label: 'Home' },
              { href: '#how', label: 'How it works' },
              { href: '#impact', label: 'Impact' },
              { href: '/analyze', label: 'Analyze' },
              { href: '/history', label: 'History' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-[14px] font-medium text-[var(--color-ink)] hover:text-[var(--color-signal)] transition-colors py-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
