/** Shown instantly while a page's data loads, so a click never feels like nothing happened. */
export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass-card skeleton h-[104px]" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-card skeleton h-44" />
        ))}
      </div>
      <div className="glass-card skeleton h-56" />
    </div>
  );
}
