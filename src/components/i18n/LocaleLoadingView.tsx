'use client';

/** Full-page loading view (e.g. for locale switching). */
export function LocaleLoadingView() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-background"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
