import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'bordered' | 'ghost';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'default', children, ...props }, ref) => {
        const variantStyles = {
            default: 'border border-border bg-card shadow-sm',
            bordered: 'border-2 border-dashed border-border bg-card/30',
            ghost: 'bg-transparent',
        };

        return (
            <div
                ref={ref}
                className={`rounded-xl ${variantStyles[variant]} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
