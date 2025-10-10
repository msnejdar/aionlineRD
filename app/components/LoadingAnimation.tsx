'use client';

export default function LoadingAnimation({ message = 'Analyzuji nemovitost...' }: { message?: string }) {
  return (
    <div className="card text-center space-y-6 fade-in" style={{ boxShadow: 'var(--shadow-elevation-3)' }}>
      <div className="relative w-24 h-24 mx-auto">
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: '4px solid var(--color-primary-lighter)' }}
        ></div>
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: '4px solid var(--color-primary)',
            borderTopColor: 'transparent'
          }}
        ></div>
      </div>
      <div>
        <h3 className="mb-2" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          {message}
        </h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-neutral-medium)' }}>
          Tato operace může trvat 30-60 sekund...
        </p>
      </div>
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex items-center gap-3">
          <div className="loading-shimmer h-2 rounded flex-1"></div>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-medium)' }}>
            Nahrávání fotek...
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="loading-shimmer h-2 rounded flex-1" style={{ animationDelay: '0.5s' }}></div>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-medium)' }}>
            Analýza exteriéru...
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="loading-shimmer h-2 rounded flex-1" style={{ animationDelay: '1s' }}></div>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-medium)' }}>
            Analýza interiéru...
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="loading-shimmer h-2 rounded flex-1" style={{ animationDelay: '1.5s' }}></div>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-medium)' }}>
            Výpočet plochy...
          </span>
        </div>
      </div>
    </div>
  );
}
