"use client";

import type { RefObject } from "react";
import type { ContentItem } from "@/types/content";
import { ContentCard } from "./ContentCard";
import { ContentCardSkeleton } from "./ContentCardSkeleton";

interface ContentRowProps {
  title: string;
  items: ContentItem[];
  loading?: boolean;
  getProgress?: (id: number) => number;
  onSelect: (item: ContentItem) => void;
  id?: string;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
  sentinelRef?: RefObject<HTMLDivElement | null>;
  loadingMore?: boolean;
}

export function ContentRow({
  title,
  items,
  loading,
  getProgress,
  onSelect,
  id,
  scrollContainerRef,
  sentinelRef,
  loadingMore,
}: ContentRowProps) {
  return (
    <section
      id={id}
      className="space-y-3 py-6"
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <h2
        id={id ? `${id}-heading` : undefined}
        className="px-4 text-lg font-semibold text-white md:px-8"
      >
        {title}
      </h2>
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto px-4 py-4 md:px-8"
        role="list"
        aria-label={title}
        style={{ scrollbarColor: "#52525b #27272a", scrollbarWidth: "thin" }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))
        ) : (
          items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              progress={getProgress?.(item.id)}
              onSelect={onSelect}
            />
          ))
        )}
        {loadingMore && !loading && (
          <div className="flex min-w-[120px] flex-shrink-0 items-center justify-center" aria-hidden>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
          </div>
        )}
        {sentinelRef && !loading && (
          <div ref={sentinelRef} className="min-w-[1px] flex-shrink-0" aria-hidden />
        )}
      </div>
    </section>
  );
}
