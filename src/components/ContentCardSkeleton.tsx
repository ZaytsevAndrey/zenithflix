export function ContentCardSkeleton() {
  return (
    <div
      className="flex min-w-[260px] max-w-[260px] flex-shrink-0 flex-col rounded-lg border border-zinc-700 bg-zinc-800/50 p-0 overflow-hidden animate-pulse"
      aria-hidden
    >
      <div className="aspect-video w-full bg-zinc-700" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 rounded bg-zinc-700" />
        <div className="h-3 w-1/2 rounded bg-zinc-700" />
      </div>
    </div>
  );
}
