import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
                        w-full bg-accent/30 border border-border/50 rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
                        transition-all shadow-sm px-4 py-3
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error ? 'border-red-500 focus:ring-red-500/20' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-xs text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
