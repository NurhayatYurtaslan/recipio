'use client';

import { useEffect } from 'react';
import { ErrorView } from '@/components/core/ErrorView';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('ErrorPage');

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <ErrorView
      status={500}
      secondaryAction={
        <Button onClick={reset} variant="outline">
          {t('tryAgain')}
        </Button>
      }
    />
  );
}
