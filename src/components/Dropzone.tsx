'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, FileAudio, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { messages, Lang } from '@/i18n/messages';

const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPT = 'audio/m4a,audio/mp4,audio/mpeg,audio/mp3,audio/ogg,audio/wav,audio/x-wav,audio/aac,audio/webm,audio/flac';

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
        className={cn(
          'relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30',
          file && 'border-primary/60 bg-primary/5'
        )}
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
          <div className="flex items-center justify-center gap-3">
            <FileAudio className="size-8 text-primary" />
            <div className="text-left">
              <div className="font-medium truncate max-w-xs">{file.name}</div>
              <div className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'audio'}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="size-10 text-muted-foreground" />
            <div className="text-lg font-medium">{t.dropzone_drop}</div>
            <div className="text-sm text-muted-foreground">{t.dropzone_or}</div>
            <Button type="button" variant="outline">
              {t.dropzone_browse}
            </Button>
            <div className="text-xs text-muted-foreground">{t.dropzone_formats}</div>
          </div>
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
