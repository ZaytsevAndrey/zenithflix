"use client";

import type { ContentItem } from "@/types/content";
import { ImageWithFallback } from "./ImageWithFallback";

interface WatchHistorySectionProps {
  items: ContentItem[];
  loading?: boolean;
  getProgress: (id: number) => number;
  onSelect: (item: ContentItem) => void;
}

function WatchHistorySkeleton() {
  return (
    <div
      className="flex w-full cursor-default items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 animate-pulse"
      aria-hidden
    >
      <div className="h-16 w-12 flex-shrink-0 rounded bg-zinc-700" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-zinc-700" />
        <div className="h-3 w-1/2 rounded bg-zinc-700" />
      </div>
      <div className="h-2 w-24 flex-shrink-0 rounded-full bg-zinc-700" />
    </div>
  );
}

export function WatchHistorySection({
  items,
  loading,
  getProgress,
  onSelect,
}: WatchHistorySectionProps) {
  if (loading) {
    return (
      <section
        id="watch-history"
        className="space-y-3 px-4 pb-8 md:px-8"
        aria-labelledby="watch-history-heading"
      >
        <h2 id="watch-history-heading" className="text-lg font-semibold text-white">
          Watch History
        </h2>
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i}>
              <WatchHistorySkeleton />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section
        id="watch-history"
        className="space-y-3 px-4 pb-8 md:px-8"
        aria-labelledby="watch-history-heading"
      >
        <h2 id="watch-history-heading" className="text-lg font-semibold text-white">
          Watch History
        </h2>
        <p className="text-sm text-zinc-500">
          Watch something from Trending to see your progress here.
        </p>
      </section>
    );
  }

  return (
    <section
      id="watch-history"
      className="space-y-3 px-4 pb-8 md:px-8"
      aria-labelledby="watch-history-heading"
    >
      <h2 id="watch-history-heading" className="text-lg font-semibold text-white">
        Watch History
      </h2>
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const progress = getProgress(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-800/80 p-3 text-left transition hover:border-zinc-500 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                onClick={() => onSelect(item)}
              >
                <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-zinc-700">
                  <ImageWithFallback
                    src={item.thumbnail}
                    alt=""
                    className="h-full w-full object-cover"
                    fallbackClassName="h-16 w-12"
                  />
                  {progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-600">
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{item.title}</p>
                  <p className="text-xs text-zinc-400">
                    {item.year} • {progress}% watched
                  </p>
                </div>
                <div className="h-2 w-24 flex-shrink-0 overflow-hidden rounded-full bg-zinc-700">
                  <div
                    className="h-full bg-red-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

