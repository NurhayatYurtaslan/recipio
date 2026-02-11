'use client';

import { LoadingView } from '@/components/core/LoadingView';

/**
 * Tam sayfa loading görünümü.
 * /loading rotasına gidildiğinde veya Suspense fallback olarak kullanılabilir.
 */
export default function LoadingPage() {
  return <LoadingView message="Yükleniyor..." />;
}
