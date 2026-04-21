import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

// Master Plan §5.5 button specs
const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[#59D3FF] text-black font-semibold hover:bg-[#3DC5F5] active:scale-[0.98] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59D3FF]/40',
  secondary:
    'bg-transparent text-[#59D3FF] border border-[rgba(89,211,255,0.40)] ' +
    'hover:bg-[rgba(89,211,255,0.08)] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59D3FF]/40',
  ghost:
    'bg-transparent text-white hover:bg-[rgba(255,255,255,0.06)] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
  danger:
    'bg-transparent text-[#F87171] border border-[rgba(248,113,113,0.40)] ' +
    'hover:bg-[rgba(248,113,113,0.08)] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F87171]/40',
  premium:
    'bg-gradient-to-r from-[#59D3FF] to-[#3DC5F5] text-black font-semibold ' +
    'hover:opacity-90 active:scale-[0.98] shadow-[0_0_20px_rgba(89,211,255,0.20)] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59D3FF]/40',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm  rounded-lg',
  md: 'px-6 py-3   text-sm  rounded-lg',
  lg: 'px-8 py-3.5 text-base rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? isLoading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
