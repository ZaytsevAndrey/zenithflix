"use client";

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { watchHistoryReducer, watchHistoryAsArray } from "./watchHistorySlice";

const watchHistoryPersistConfig = {
  key: "zenithflix-watch-history",
  storage,
  transforms: [
    createTransform((s) => s, (out) => watchHistoryAsArray(out)),
  ],
};

const persistedWatchHistory = persistReducer(
  watchHistoryPersistConfig,
  watchHistoryReducer
);

export const store = configureStore({
  reducer: {
    watchHistory: persistedWatchHistory,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/PURGE",
        ],
      },
    }),
});

export const persistor = persistStore(store);
export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
