import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.98]',
    secondary: 'bg-background border border-border text-foreground hover:bg-accent/50',
    destructive: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 shadow-sm hover:bg-red-200 dark:hover:bg-red-900/50',
    ghost: 'text-foreground hover:bg-accent/50',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`
                    inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all
                    disabled:opacity-50 disabled:pointer-events-none
                    ${variantStyles[variant]}
                    ${sizeStyles[size]}
                    ${className}
                `}
                {...props}
            >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
