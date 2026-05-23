interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`}
        />
    );
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
    return (
        <div className={`rounded-xl border border-border bg-card p-6 shadow-sm ${className}`}>
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <div className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
            </div>
        </div>
    );
}

export function SkeletonList({ rows = 3, className = '' }: SkeletonProps & { rows?: number }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="w-16 h-6 rounded-lg" />
                </div>
            ))}
        </div>
    );
}
