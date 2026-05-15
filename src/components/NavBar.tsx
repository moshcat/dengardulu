'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Eye, Menu, X } from 'lucide-react';
import { LogoWordmark } from './Logo';
import { messages, Lang } from '@/i18n/messages';

export function NavBar({
  lang,
  onLangChange,
  onElderly,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onElderly?: (enabled: boolean) => void;
}) {
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isElderly, setIsElderly] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const t = messages[lang];

  useEffect(() => {
    setIsElderly(document.documentElement.dataset.elderly === 'true');
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleElderly = () => {
    const next = !isElderly;
    setIsElderly(next);
    document.documentElement.setAttribute('data-elderly', String(next));
    localStorage.setItem('dengardulu_elderly', String(next));
    onElderly?.(next);
  };

  const handleLangSelect = (newLang: Lang) => {
    onLangChange(newLang);
    setLangOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-canvas)] border-b border-[var(--color-border)] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center hover:opacity-70 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
            aria-label="DengarDulu home"
          >
            <LogoWordmark size={28} />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#hero"
              className="text-sm font-medium text-[var(--color-granite)] hover:text-[var(--color-ink)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
            >
              Home
            </Link>
            <Link
              href="#how"
              className="text-sm font-medium text-[var(--color-granite)] hover:text-[var(--color-ink)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
            >
              How it works
            </Link>
            <Link
              href="#impact"
              className="text-sm font-medium text-[var(--color-granite)] hover:text-[var(--color-ink)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
            >
              Impact
            </Link>
            <Link
              href="/analyze"
              className="text-sm font-medium text-[var(--color-granite)] hover:text-[var(--color-ink)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
            >
              Analyze
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium text-[var(--color-granite)] hover:text-[var(--color-ink)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
            >
              History
            </Link>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-lifted)] border border-[var(--color-border)] text-xs sm:text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-ink)] active:bg-[var(--color-taupe)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
              >
                <span>{lang.toUpperCase()}</span>
                <ChevronDown size={16} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div
                  className="absolute right-0 mt-2 bg-[var(--color-canvas)] border-2 border-[var(--color-ink)] rounded-lg shadow-lg z-50 min-w-32"
                  role="listbox"
                >
                  <button
                    onClick={() => handleLangSelect('en')}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                      lang === 'en'
                        ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]'
                        : 'text-[var(--color-ink)] hover:bg-[var(--color-lifted)]'
                    } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]`}
                    role="option"
                    aria-selected={lang === 'en'}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLangSelect('bm')}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-t border-[var(--color-border)] ${
                      lang === 'bm'
                        ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]'
                        : 'text-[var(--color-ink)] hover:bg-[var(--color-lifted)]'
                    } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]`}
                    role="option"
                    aria-selected={lang === 'bm'}
                  >
                    Bahasa Melayu
                  </button>
                </div>
              )}
            </div>

            {/* Easy Mode Toggle */}
            <button
              onClick={toggleElderly}
              title={t.elderly_mode}
              className={`p-2 sm:p-2.5 rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] ${
                isElderly
                  ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]'
                  : 'bg-[var(--color-lifted)] text-[var(--color-ink)] hover:border-[var(--color-ink)] border border-[var(--color-border)]'
              }`}
              aria-label={t.elderly_mode}
              aria-pressed={isElderly}
            >
              <Eye size={20} className="sm:w-5 sm:h-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-lifted)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-lifted)] px-4 py-4 space-y-3">
            <Link
              href="#hero"
              className="block text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-signal)] transition-colors px-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="#how"
              className="block text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-signal)] transition-colors px-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="#impact"
              className="block text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-signal)] transition-colors px-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Impact
            </Link>
            <Link
              href="/analyze"
              className="block text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-signal)] transition-colors px-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Analyze
            </Link>
            <Link
              href="/history"
              className="block text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-signal)] transition-colors px-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              History
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
