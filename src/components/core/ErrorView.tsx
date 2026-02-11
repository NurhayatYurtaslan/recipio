'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export type ErrorStatus = 404 | 403 | 500;

export interface ErrorViewProps {
  status: ErrorStatus;
  title?: string;
  description?: string;
  inline?: boolean;
  secondaryAction?: React.ReactNode;
}

function Icon404() {
  return (
    <svg viewBox="0 0 24 24" className="size-8 text-muted-foreground/70" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function Icon403() {
  return (
    <svg viewBox="0 0 24 24" className="size-8 text-muted-foreground/70" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function Icon500() {
  return (
    <svg viewBox="0 0 24 24" className="size-8 text-muted-foreground/70" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

const ICON_MAP = { 404: Icon404, 403: Icon403, 500: Icon500 } as const;

export function ErrorView({ status, title, description, inline = false, secondaryAction }: ErrorViewProps) {
  const t = useTranslations('ErrorPage');
  const Icon = ICON_MAP[status];
  const statusKey = String(status) as '404' | '403' | '500';
  const resolvedTitle = title ?? t(`${statusKey}.title`);
  const resolvedDescription = description ?? t(`${statusKey}.description`);

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        bg-background text-foreground
        ${inline ? 'min-h-[280px] w-full py-12' : 'min-h-screen w-full'}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center gap-5 max-w-xs px-5 text-center">
        <span className="text-[2.5rem] font-light tabular-nums text-muted-foreground/80 tracking-tight">
          {status}
        </span>
        <Icon />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{resolvedTitle}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{resolvedDescription}</p>
        </div>
        <div className="flex flex-col items-center gap-2 pt-1">
          <Link
            href="/"
            className="text-sm text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1 -mx-1"
          >
            {t('backToHome')}
          </Link>
          {status === 404 && (
            <Link
              href="/recipes"
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
            >
              {t('browseRecipes')}
            </Link>
          )}
          {status === 403 && (
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
            >
              {t('tryLogin')}
            </Link>
          )}
          {secondaryAction}
        </div>
      </div>
    </div>
  );
}
