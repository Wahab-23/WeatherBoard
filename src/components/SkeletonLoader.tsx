import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading meteorological telemetry">
      {/* Hero Card Skeleton */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white/50 p-6 sm:p-8 dark:border-neutral-800/80 dark:bg-neutral-900/30">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-xl bg-neutral-200/70 dark:bg-neutral-800" />
            <div className="h-4 w-28 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/50" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-10 rounded-xl bg-neutral-200/70 dark:bg-neutral-800" />
            <div className="h-10 w-10 rounded-xl bg-neutral-200/70 dark:bg-neutral-800" />
          </div>
        </div>

        <div className="mt-8 flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-16 w-36 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800" />
            <div className="h-4 w-44 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/50" />
          </div>
          <div className="h-14 w-24 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60" />
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-neutral-200/70 bg-white/40 p-4 dark:border-neutral-800/70 dark:bg-neutral-900/20"
          >
            <div className="h-3 w-16 rounded bg-neutral-200/60 dark:bg-neutral-800" />
            <div className="mt-3 h-6 w-20 rounded bg-neutral-200/80 dark:bg-neutral-800" />
            <div className="mt-2 h-3 w-24 rounded bg-neutral-200/40 dark:bg-neutral-800/40" />
          </div>
        ))}
      </div>

      {/* Hourly Forecast Skeleton */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white/50 p-6 dark:border-neutral-800/80 dark:bg-neutral-900/30">
        <div className="h-5 w-48 rounded bg-neutral-200/70 dark:bg-neutral-800 mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="min-w-[80px] h-28 rounded-2xl bg-neutral-200/40 dark:bg-neutral-800/30" />
          ))}
        </div>
      </div>

      {/* 5-Day Forecast Skeleton */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white/50 p-6 dark:border-neutral-800/80 dark:bg-neutral-900/30">
        <div className="h-5 w-48 rounded bg-neutral-200/70 dark:bg-neutral-800 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="h-4 w-16 rounded bg-neutral-200/50 dark:bg-neutral-800" />
              <div className="h-4 w-24 rounded bg-neutral-200/50 dark:bg-neutral-800" />
              <div className="h-2 w-48 rounded bg-neutral-200/40 dark:bg-neutral-800 hidden sm:block" />
              <div className="h-4 w-12 rounded bg-neutral-200/50 dark:bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

