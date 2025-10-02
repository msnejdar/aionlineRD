'use client';

export default function LoadingAnimation({ message = 'Analyzuji nemovitost...' }: { message?: string }) {
  return (
    <div className="glass-panel text-center space-y-6 fade-in">
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{message}</h3>
        <p className="text-sm text-gray-600">
          Tato operace může trvat 30-60 sekund...
        </p>
      </div>
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex items-center gap-3">
          <div className="loading-shimmer h-2 rounded flex-1"></div>
          <span className="text-xs text-gray-500">Nahrávání fotek...</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="loading-shimmer h-2 rounded flex-1" style={{ animationDelay: '0.5s' }}></div>
          <span className="text-xs text-gray-500">Analýza exteriéru...</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="loading-shimmer h-2 rounded flex-1" style={{ animationDelay: '1s' }}></div>
          <span className="text-xs text-gray-500">Analýza interiéru...</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="loading-shimmer h-2 rounded flex-1" style={{ animationDelay: '1.5s' }}></div>
          <span className="text-xs text-gray-500">Výpočet plochy...</span>
        </div>
      </div>
    </div>
  );
}
