import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={[
            'bg-[#0D0D0D] border rounded-lg px-4 py-3 text-sm text-white placeholder-[#666]',
            'outline-none transition-colors duration-150',
            error
              ? 'border-[rgba(248,113,113,0.50)] focus:border-[#F87171]'
              : 'border-[rgba(255,255,255,0.08)] focus:border-[rgba(89,211,255,0.40)]',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-[#F87171]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
