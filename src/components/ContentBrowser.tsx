"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ContentItem, ApiResponse, Pagination } from "@/types/content";
import { ContentRow } from "./ContentRow";
import { ContentModal } from "./ContentModal";
import { WatchHistorySection } from "./WatchHistorySection";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { TRENDING_MOCK_PAGINATED } from "@/data/mockContent";

const defaultPagination: Pagination = {
  currentPage: 1,
  totalPages: 1,
  hasNext: false,
  totalItems: 0,
};

export function ContentBrowser() {
  const [trending, setTrending] = useState<ContentItem[]>([]);
  const [forYou, setForYou] = useState<ContentItem[]>([]);
  const [newReleases, setNewReleases] = useState<ContentItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>("");
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const pageRef = useRef(1);
  const { history, getProgress, setProgress } = useWatchHistory();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/content?page=1`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ApiResponse) => {
        if (cancelled) return;
        setTrending(
          Array.isArray(data.categories?.trending) ? data.categories.trending : []
        );
        setForYou(
          Array.isArray(data.categories?.forYou) ? data.categories.forYou : []
        );
        setNewReleases(
          Array.isArray(data.categories?.newReleases)
            ? data.categories.newReleases
            : []
        );
        setPagination(data.pagination ?? defaultPagination);
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load content");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pagination.hasNext || loading) return;
    const root = trendingScrollRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (!root || !sentinel) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        pageRef.current += 1;
        fetch(`/api/content?page=${pageRef.current}`)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((data: ApiResponse) => {
            if (cancelled) return;
            const list = Array.isArray(data.categories?.trending)
              ? data.categories.trending
              : [];
            setTrending((prev) => [...prev, ...list]);
            setPagination(data.pagination ?? defaultPagination);
          })
          .catch(() => {})
          .finally(() => {
            if (!cancelled) setLoadingMore(false);
            loadingMoreRef.current = false;
          });
      },
      { root, rootMargin: "0px 100px 0px 0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [pagination.hasNext, loading]);

  const handleSelect = useCallback((item: ContentItem) => {
    setSelected(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelected(null);
  }, []);

  const handleProgressUpdate = useCallback((id: number, progress: number) => {
    setProgress(id, progress);
  }, [setProgress]);

  const watchHistoryItems = useMemo(
    () =>
      history
        .map((h) => TRENDING_MOCK_PAGINATED.find((c) => c.id === h.id))
        .filter((c): c is ContentItem => c != null),
    [history]
  );

  if (error) {
    return (
      <div className="px-4 py-8 text-red-400 md:px-8" role="alert">
        {error}
      </div>
    );
  }

  return (
    <>
      <ContentRow
        id="trending"
        title="Trending Now"
        items={trending}
        loading={loading}
        getProgress={getProgress}
        onSelect={handleSelect}
        scrollContainerRef={trendingScrollRef}
        sentinelRef={loadMoreSentinelRef}
        loadingMore={loadingMore}
      />

      {(loading || forYou.length > 0) && (
        <ContentRow
          id="for-you"
          title="For You"
          items={forYou}
          loading={loading}
          getProgress={getProgress}
          onSelect={handleSelect}
        />
      )}
      {(loading || newReleases.length > 0) && (
        <ContentRow
          id="new-releases"
          title="New Releases"
          items={newReleases}
          loading={loading}
          getProgress={getProgress}
          onSelect={handleSelect}
        />
      )}

      <WatchHistorySection
        items={watchHistoryItems}
        loading={loading}
        getProgress={getProgress}
        onSelect={handleSelect}
      />
      <ContentModal
        item={selected}
        onClose={handleCloseModal}
        onProgressUpdate={handleProgressUpdate}
      />
    </>
  );
}
