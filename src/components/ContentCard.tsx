"use client";

import { memo, useCallback } from "react";
import type { ContentItem } from "@/types/content";
import { ImageWithFallback } from "./ImageWithFallback";

interface ContentCardProps {
  item: ContentItem;
  progress?: number;
  onSelect: (item: ContentItem) => void;
}

function ContentCardComponent({ item, progress = 0, onSelect }: ContentCardProps) {
  const handleClick = useCallback(() => onSelect(item), [item, onSelect]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(item);
      }
    },
    [item, onSelect]
  );

  return (
    <article
      role="listitem"
      tabIndex={0}
      className="group flex min-w-[260px] max-w-[260px] flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/80 transition-all duration-200 hover:scale-105 hover:border-zinc-500 hover:shadow-lg hover:shadow-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
      aria-label={`${item.title}, ${item.year}, rating ${item.rating} out of 10`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-700">
        <ImageWithFallback
          src={item.thumbnail}
          alt=""
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          fallbackClassName="aspect-video"
          loading="lazy"
        />
        {progress > 0 && progress < 100 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-600"
            aria-hidden
          >
            <div
              className="h-full bg-red-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="truncate text-sm font-medium text-white">{item.title}</h3>
        <p className="text-xs text-zinc-400">
          {item.year} • {item.rating}/10
        </p>
      </div>
    </article>
  );
}

export const ContentCard = memo(ContentCardComponent);
