# Code Review: ContentBrowser.tsx — «Trending Now»

Review of the snippet: main issues with before/after code examples; minor issues listed briefly.

---

## Main issues (with snippets)

### 1. Fetch handling

No check for `response.ok`; direct access to `data.categories.trending` without guards — on 404/500 or API changes the app can crash.

**Before:**

```tsx
const fetchContent = async (page: number): Promise<ApiResponse> => {
  const response = await fetch(`/api/content?page=${page}`);
  return response.json();
};
// ...
.then((data) => {
  setTrendingContent(data.categories.trending);
  setError('');
})
```

**After:**

```tsx
const fetchContent = async (page: number): Promise<ApiResponse> => {
  const response = await fetch(`/api/content?page=${page}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};
// ...
.then((data) => {
  const trending = data.categories?.trending ?? [];
  setTrendingContent(Array.isArray(trending) ? trending : []);
  setError('');
})
```

---

### 2. Missing cleanup in useEffect

Race condition on fast navigation, setState after unmount, duplicate request in Strict Mode.

**Before:**

```tsx
useEffect(() => {
  setLoading(true);
  fetchContent(page)
    .then((data) => { setTrendingContent(data.categories.trending); setError(''); })
    .catch((err) => { setError('Failed to load content'); console.log(err); })
    .finally(() => setLoading(false));
}, [page]);
```

**After:**

```tsx
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  fetchContent(page)
    .then((data) => {
      if (!cancelled) {
        setTrendingContent(data.categories?.trending ?? []);
        setError('');
      }
    })
    .catch((err) => {
      if (!cancelled) {
        setError('Failed to load content');
        console.error(err);
      }
    })
    .finally(() => { if (!cancelled) setLoading(false); });
  return () => { cancelled = true; };
}, [page]);
```

---

### 3. Lack of memoization

All cards re-render on any parent state change; callbacks are recreated every time.

**Before:**

```tsx
{trendingContent.map((item) => (
  <div key={item.id} onClick={() => openDetail(item)}>
    <img src={item.thumbnail} alt={item.title} />
    <h3>{item.title}</h3>
    <p>{item.year} • {item.rating}/10</p>
  </div>
))}
```

**After:**

```tsx
const openDetail = useCallback((item: ContentItem) => { /* ... */ }, []);

{trendingContent.map((item) => (
  <TrendingCard key={item.id} item={item} onSelect={openDetail} />
))}

// TrendingCard.tsx
const TrendingCard = memo(function TrendingCard({ item, onSelect }: { item: ContentItem; onSelect: (i: ContentItem) => void }) {
  const handleClick = useCallback(() => onSelect(item), [item, onSelect]);
  return (/* ... */);
});
```

---

### 4. Pagination without API data

The “Next” button does not use `totalPages`/`hasNext` from the response — possible clicks beyond available data.

**Before:**

```tsx
const [page, setPage] = useState(1);
// ...
<button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
<span>Page {page}</span>
<button onClick={() => setPage(page + 1)}>Next</button>
```

**After:**

```tsx
const [page, setPage] = useState(1);
const [pagination, setPagination] = useState({ totalPages: 1, hasNext: false });

// after fetch:
setPagination(data.pagination ?? { totalPages: 1, hasNext: false });

// ...
<button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</button>
<span>Page {page} of {pagination.totalPages}</span>
<button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}>Next</button>
```

---

## Minor issues (summary)

- **Inline styles:** Styles are set via `style={{ ... }}`. In a Tailwind project, prefer utility classes over inline styles.

- **Images:** No `onError` for broken thumbnails, no `loading="lazy"` for cards outside the viewport, no fixed dimensions — risk of layout shift.

- **Content on page change:** The list can briefly show an empty state while loading. Prefer not clearing the list immediately; update it only after a successful response.
