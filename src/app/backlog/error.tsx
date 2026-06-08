'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function BacklogError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Backlog page error:', error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-16 max-w-6xl">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
                    <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-slate-500 max-w-md mb-8">
                    We encountered an error while loading the backlog. Please try again.
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all"
                    >
                        <RefreshCcw size={16} />
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="px-5 py-2.5 border border-border rounded-xl font-bold hover:bg-accent/50 transition-all"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
