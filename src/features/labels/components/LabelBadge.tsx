import { HTMLAttributes, forwardRef } from 'react';

interface LabelBadgeProps extends HTMLAttributes<HTMLSpanElement> {
    tagName: string;
    color?: string;
}

export const LabelBadge = forwardRef<HTMLSpanElement, LabelBadgeProps>(
    ({ tagName, color, className = '', ...props }, ref) => {
        const backgroundColor = color || 'bg-primary/10';
        const textColor = 'text-primary';

        return (
            <span
                ref={ref}
                className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${backgroundColor} ${textColor}
                    ${className}
                `}
                {...props}
            >
                {tagName}
            </span>
        );
    }
);

LabelBadge.displayName = 'LabelBadge';