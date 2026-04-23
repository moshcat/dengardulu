'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, FileAudio, X, AlertCircle } from 'lucide-react';
import { messages, Lang } from '@/i18n/messages';

const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPT =
  'audio/m4a,audio/mp4,audio/mpeg,audio/mp3,audio/ogg,audio/wav,audio/x-wav,audio/aac,audio/webm,audio/flac';

export type DropzoneProps = {
  onFile: (file: File | null) => void;
  lang: Lang;
};

export function Dropzone({ onFile, lang }: DropzoneProps) {
  const t = messages[lang];
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = useCallback(
    (f: File) => {
      if (f.size > MAX_BYTES) {
        setError(t.error_audio_too_large);
        onFile(null);
        return;
      }
      if (!f.type.startsWith('audio/')) {
        setError(t.error_audio_format);
        onFile(null);
        return;
      }
      setError(null);
      setFile(f);
      onFile(f);
    },
    [onFile, t]
  );

  const clear = () => {
    setFile(null);
    setError(null);
    onFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const f = e.dataTransfer.files[0];
          if (f) accept(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={[
          'relative rounded-[40px] p-12 text-center cursor-pointer transition-all',
          'bg-[var(--color-lifted)] border-2 border-dashed',
          dragActive
            ? 'border-[var(--color-ink)] bg-[var(--color-canvas)]'
            : file
            ? 'border-[var(--color-signal-light)] bg-[var(--color-signal-light)]/5'
            : 'border-[var(--color-taupe)] hover:border-[var(--color-ink)]',
        ].join(' ')}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) accept(f);
          }}
        />
        {file ? (
          <div className="flex items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--color-ink)] text-[var(--color-canvas)] flex items-center justify-center shrink-0">
              <FileAudio size={22} />
            </div>
            <div className="text-left min-w-0">
              <div className="font-medium text-[16px] truncate max-w-[260px]">
                {file.name}
              </div>
              <div className="text-[13px] text-[var(--color-slate)] mt-0.5">
                {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || 'audio'}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              className="w-9 h-9 rounded-full border border-[var(--color-ink)]/20 flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-canvas)] transition-colors"
              aria-label="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-center">
              <Upload size={24} className="text-[var(--color-slate)]" />
            </div>
            <div>
              <div className="text-[20px] font-medium mb-1">{t.dropzone_drop}</div>
              <div className="text-[13px] text-[var(--color-slate)]">{t.dropzone_or}</div>
            </div>
            <button type="button" className="outline-pill">
              {t.dropzone_browse}
            </button>
            <div className="text-[12px] text-[var(--color-slate)] mt-1">
              {t.dropzone_formats}
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 flex items-start gap-3 px-5 py-4 rounded-[20px] bg-[var(--color-mc-red)]/5 border border-[var(--color-mc-red)]/20">
          <AlertCircle size={18} className="text-[var(--color-mc-red)] shrink-0 mt-0.5" />
          <p className="text-[14px] text-[var(--color-mc-red)]">{error}</p>
        </div>
      )}
    </div>
  );
}
