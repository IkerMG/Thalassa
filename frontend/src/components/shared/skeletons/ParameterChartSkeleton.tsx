export default function ParameterChartSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Parameter selector row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-7 rounded-lg bg-[rgba(255,255,255,0.06)]"
              style={{ width: `${52 + (i % 3) * 16}px` }}
            />
          ))}
        </div>
        <div className="h-7 w-20 rounded-lg bg-[rgba(255,255,255,0.06)]" />
      </div>

      {/* Chart area */}
      <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
        <div className="h-4 w-32 bg-[rgba(255,255,255,0.07)] rounded mb-4" />
        <div className="h-48 w-full bg-[rgba(255,255,255,0.04)] rounded-lg" />
      </div>

      {/* Stats row under chart */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex flex-col gap-2"
          >
            <div className="h-2.5 w-16 bg-[rgba(255,255,255,0.06)] rounded" />
            <div className="h-6 w-20 bg-[rgba(255,255,255,0.07)] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
