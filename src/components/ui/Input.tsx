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
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    className={`
                        w-full px-4 py-3 bg-accent/30 border rounded-xl text-sm font-medium
                        placeholder:text-slate-400 transition-all shadow-sm
                        focus-visible:outline-2 focus-visible:outline-primary/40 focus-visible:outline-offset-2 focus-visible:border-primary/50
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error
                            ? 'border-red-500 focus-visible:outline-red-500/40'
                            : 'border-border/50 focus:border-primary/30'
                        }
                        ${className}
                    `}
                    {...props}
                />
                {error && (
                    <p id={`${inputId}-error`} className="mt-1 text-xs text-red-500" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
