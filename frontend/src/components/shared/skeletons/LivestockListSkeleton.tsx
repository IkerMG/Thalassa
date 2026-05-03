export default function LivestockListSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-20 bg-[rgba(255,255,255,0.07)] rounded" />
        <div className="h-7 w-24 bg-[rgba(255,255,255,0.06)] rounded-lg" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="h-3.5 w-24 bg-[rgba(255,255,255,0.07)] rounded" />
                <div className="h-2.5 w-8 bg-[rgba(255,255,255,0.05)] rounded" />
              </div>
              <div className="h-6 w-6 bg-[rgba(255,255,255,0.05)] rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-[rgba(255,255,255,0.05)] rounded-full" />
              <div className="h-4 w-14 bg-[rgba(255,255,255,0.05)] rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
