'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShareTargetPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/analyze?shared=1');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)]">
      <p className="text-[var(--color-slate)] text-[15px]">Mengalihkan…</p>
    </div>
  );
}
