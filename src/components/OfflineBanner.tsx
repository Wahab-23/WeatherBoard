import React from 'react';
import { WifiOff, Clock } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  isCachedPayload: boolean;
  fetchedAt?: string;
  onRefresh?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  isCachedPayload,
  fetchedAt,
  onRefresh,
}) => {
  if (isOnline && !isCachedPayload) {
    return null;
  }

  const formattedTime = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'previously';

  return (
    <aside
      aria-label="Network status banner"
      className="w-full border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong className="font-semibold">Offline Mode Active:</strong> Displaying cached meteorological snapshot
            synchronized at <span className="font-mono">{formattedTime}</span>.
          </span>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="touch-target inline-flex items-center gap-1.5 rounded border border-amber-500/30 bg-amber-500/20 px-3 py-1 font-mono text-[11px] font-medium text-amber-900 transition hover:bg-amber-500/30 dark:text-amber-100"
          >
            <Clock className="h-3 w-3" />
            Check Connection
          </button>
        )}
      </div>
    </aside>
  );
};

