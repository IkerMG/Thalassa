interface ReefSafeBadgeProps {
  reefSafe: boolean;
}

export default function ReefSafeBadge({ reefSafe }: ReefSafeBadgeProps) {
  return reefSafe ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.12)] text-[#34D399] border border-[rgba(52,211,153,0.25)]">
      ✓ Reef Safe
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[rgba(248,113,113,0.12)] text-[#F87171] border border-[rgba(248,113,113,0.25)]">
      ✕ Not Reef Safe
    </span>
  );
}
