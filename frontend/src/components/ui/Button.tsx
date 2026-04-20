import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-cyan text-ocean-900 font-semibold hover:bg-cyan/90 shadow-glow hover:shadow-glow active:scale-[0.98]',
  ghost:
    'border border-cyan/30 text-text-primary hover:bg-cyan/10 hover:border-cyan/60',
  danger:
    'border border-reef-unsafe/40 text-reef-unsafe hover:bg-reef-unsafe/10',
  premium:
    'bg-gradient-to-r from-cyan to-coral text-ocean-900 font-semibold hover:opacity-90 shadow-glow active:scale-[0.98]',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2   text-sm rounded-xl',
  lg: 'px-6 py-3   text-base rounded-xl',
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
        'transition-all duration-200 font-body',
        'focus:outline-none focus:ring-2 focus:ring-cyan/40',
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
