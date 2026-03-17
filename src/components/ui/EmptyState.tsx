import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    isLoading?: boolean;
}

export function EmptyState({ icon, title, description, action, isLoading }: EmptyStateProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Loading...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-border rounded-3xl bg-card/30">
            {icon && (
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            {description && (
                <p className="text-slate-500 max-w-md mx-auto mb-8">{description}</p>
            )}
            {action}
        </div>
    );
}
