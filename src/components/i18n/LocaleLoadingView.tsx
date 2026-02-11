'use client';

import { LoadingView } from '@/components/core/LoadingView';

/** Full-page loading view (e.g. for locale switching). */
export function LocaleLoadingView() {
  return <LoadingView message="Yükleniyor..." />;
}
