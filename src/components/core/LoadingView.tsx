'use client';

export interface LoadingViewProps {
  /** Alt metin (örn. "Yükleniyor...", "Loading..."). Boşsa sadece loader gösterilir. */
  message?: string;
  /** Tam ekran yerine içeriğe uyumlu yükseklik kullanır */
  inline?: boolean;
}

/**
 * Modern tam sayfa / inline yükleme görünümü.
 * Kart container, çift halka SVG loader, tipografi ve progress bar ile güncel UI.
 */
export function LoadingView({ message, inline = false }: LoadingViewProps) {
  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        min-h-screen w-full
        bg-gradient-to-b from-background via-muted/20 to-background
        ${inline ? 'min-h-[320px] py-16' : 'min-h-screen'}
      `}
      aria-live="polite"
      aria-busy="true"
      role="status"
      aria-label={message ?? 'Loading'}
    >
      {/* Ana kart container */}
      <div
        className={`
          relative flex flex-col items-center justify-center
          rounded-3xl
          bg-card/80 dark:bg-card/90
          backdrop-blur-xl
          border border-border/60
          px-12 py-14
          animate-loading-scale-in
          ${inline ? 'py-10 px-8' : ''}
        `}
      >
        {/* Çift halka loader + merkez ikon */}
        <div className="relative flex items-center justify-center w-28 h-28">
          {/* Dış track (sabit) */}
          <svg
            className="absolute inset-0 w-full h-full text-muted/40"
            viewBox="0 0 112 112"
            fill="none"
            aria-hidden
          >
            <circle
              cx="56"
              cy="56"
              r="52"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
          </svg>
          {/* Dönen halka (bir yön) */}
          <svg
            className="absolute inset-0 w-full h-full text-primary animate-loading-rotate"
            viewBox="0 0 112 112"
            fill="none"
            aria-hidden
          >
            <circle
              cx="56"
              cy="56"
              r="52"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="120 200"
              className="opacity-90"
            />
          </svg>
          {/* İç dönen halka (ters yön, accent) */}
          <svg
            className="absolute inset-0 w-full h-full text-accent animate-loading-rotate-reverse"
            viewBox="0 0 112 112"
            fill="none"
            aria-hidden
          >
            <circle
              cx="56"
              cy="56"
              r="38"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="80 160"
              className="opacity-80"
            />
          </svg>
          {/* Merkez ikon: yaprak / tarif teması */}
          <svg
            className="absolute w-9 h-9 text-primary animate-loading-fade"
            viewBox="0 0 36 36"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M18 4c-4 8-10 12-10 18 0 5 4.5 10 10 10s10-5 10-10c0-6-6-10-10-18z" />
          </svg>
        </div>
      </div>

      {/* Altta ince indeterminate progress bar (sadece tam ekran) */}
      {!inline && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-muted/40">
          <div className="h-full w-1/4 min-w-[100px] rounded-full bg-accent opacity-80 animate-loading-shimmer" />
        </div>
      )}
    </div>
  );
}
