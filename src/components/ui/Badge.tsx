import { HTMLAttributes, forwardRef } from 'react';
import { Priority, Status } from '@/domain/types';

type BadgeVariant = 
    | `priority-${Priority}`
    | `status-${Status | 'Planned' | 'Active' | 'Completed' | 'Closed'}`;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
    'priority-Critical': 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
    'priority-High': 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
    'priority-Medium': 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    'priority-Low': 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
    'status-To Do': 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
    'status-In Progress': 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    'status-Review': 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
    'status-Done': 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    'status-Planned': 'bg-blue-500 text-white',
    'status-Active': 'bg-green-500 text-white',
    'status-Completed': 'bg-purple-500 text-white',
    'status-Closed': 'bg-slate-500 text-white',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className = '', variant = 'priority-Medium', children, ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${variantStyles[variant]}
                    ${className}
                `}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';
