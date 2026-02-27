"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import {
  watchHistoryActions,
  selectWatchHistoryItems,
} from "@/store/watchHistorySlice";

export function useWatchHistory() {
  const dispatch = useDispatch<AppDispatch>();
  const history = useSelector(selectWatchHistoryItems);

  const setProgress = useCallback(
    (id: number, progress: number) => {
      dispatch(watchHistoryActions.setProgress({ id, progress }));
    },
    [dispatch]
  );

  const getProgress = useCallback(
    (id: number): number => {
      const item = history.find((x) => x.id === id);
      return item?.progress ?? 0;
    },
    [history]
  );

  return { history, setProgress, getProgress };
}
