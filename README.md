# ZenithFlix

AI-driven streaming platform UI — Frontend assessment (content browsing, watch history, video modal).

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Build:** `npm run build`
- **Tests:** `npm run test` (Vitest + React Testing Library)

## Project structure

```
src/
  app/           — Next.js App Router (layout, page, Providers, api/content)
  components/    — Header, ContentBrowser, ContentRow, ContentCard, ContentCardSkeleton,
                   ContentModal, WatchHistorySection, ImageWithFallback
  store/         — Redux store, watchHistorySlice (persist)
  hooks/         — useWatchHistory (Redux + persist)
  types/         — ContentItem, ApiResponse, WatchHistoryItem, Pagination
  data/          — mockContent (paginated trending + categories)
  test/          — Vitest setup
```

## Features

- **Content:** Three categories from API — Trending Now, For You, New Releases. Trending has horizontal infinite scroll with “load more” and loading indicator.
- **Skeletons:** Loading skeletons for all sections: ContentCardSkeleton in each row (Trending, For You, New Releases), WatchHistorySection shows list skeletons while loading.
- **Header:** Navigation links (Trending, For You, New Releases) with smooth scroll to sections; burger menu on mobile.
- **Video modal:** Clicking a card opens a modal with video, custom controls: play/pause (including Space), volume (vertical popup slider), playback speed (popup), fullscreen, progress bar at bottom. Controls auto-hide after inactivity; volume/speed popups use `createPortal` and remain visible in fullscreen. Buttons use `focus-visible` only (no focus ring on click).
- **Watch history:** Stored in Redux with `redux-persist` (localStorage). Progress is saved while watching; Watch History section shows items from history with progress bars. Rehydration from persist is normalized so the store always has an array.

## Architecture

- **API:** `GET /api/content?page=1` returns `{ categories: { trending, forYou, newReleases }, pagination }`. Mock data in `data/mockContent.ts`; pagination used for Trending infinite scroll.
- **State:** Content lists, loading, error, selected item, and pagination live in `ContentBrowser`. Watch history is in Redux (`watchHistorySlice`) with persist; `useWatchHistory()` exposes `history`, `getProgress`, `setProgress`.
- **Accessibility:** Modal has `role="dialog"`, focus on open, Escape to close. Content rows use `role="list"` / list semantics. Buttons use `focus-visible:ring` so the focus ring appears only for keyboard. No `aria-hidden` on focusable ancestors.

## Code review (Part 1)

See **[CODE_REVIEW.md](./CODE_REVIEW.md)** in the project root for the code review of the ContentBrowser snippet (fetch handling, useEffect cleanup, memoization, pagination).

## Assumptions

- **UI/UX:** Dark streaming-style layout. Cards scale on hover. Modal shows video with custom controls; “Play” drives real video playback and progress updates.
- **Content:** Multiple categories; only Trending is paginated. Watch History displays only items that exist in the mock content (resolved by `id`).
- **Persistence:** No backend for watch history — Redux persist uses localStorage key `persist:root` (or configured key).
