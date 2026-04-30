export default function DashboardCardSkeleton() {
  return (
    <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-28 bg-[rgba(255,255,255,0.07)] rounded" />
          <div className="h-2.5 w-10 bg-[rgba(255,255,255,0.05)] rounded" />
        </div>
        <div className="h-4 w-14 bg-[rgba(255,255,255,0.05)] rounded" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="h-2.5 w-20 bg-[rgba(255,255,255,0.05)] rounded" />
        <div className="h-3 w-3 bg-[rgba(255,255,255,0.05)] rounded" />
      </div>
    </div>
  );
}
