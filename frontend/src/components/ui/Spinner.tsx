interface SpinnerProps {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 20, className = '' }: SpinnerProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={[
        'border-2 border-[rgba(89,211,255,0.20)] border-t-[#59D3FF] rounded-full animate-spin',
        className,
      ].join(' ')}
    />
  );
}
