import { createSlice, createSelector } from "@reduxjs/toolkit";
import type { WatchHistoryItem } from "@/types/content";

export function watchHistoryAsArray(raw: unknown): WatchHistoryItem[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    return Object.keys(obj)
      .filter((k) => k !== "_persist")
      .map((k) => obj[k])
      .filter(
        (x): x is WatchHistoryItem =>
          x != null &&
          typeof x === "object" &&
          "id" in x &&
          "progress" in x &&
          "updatedAt" in x
      );
  }
  return [];
}

const slice = createSlice({
  name: "watchHistory",
  initialState: [] as WatchHistoryItem[],
  reducers: {
    setProgress(
      state,
      action: { payload: { id: number; progress: number } }
    ) {
      const { id, progress } = action.payload;
      const pct = Math.min(100, Math.max(0, progress));
      const list = watchHistoryAsArray(state);
      const next = list.filter((x) => x.id !== id);
      next.push({
        id,
        progress: pct,
        updatedAt: Date.now(),
      });
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      return next;
    },
  },
});

export const watchHistoryActions = slice.actions;
export const watchHistoryReducer = slice.reducer;

const selectRaw = (state: { watchHistory?: unknown }) => state.watchHistory;

export const selectWatchHistoryItems = createSelector(
  [selectRaw],
  (raw): WatchHistoryItem[] => watchHistoryAsArray(raw)
);
