'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background glowing elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl motion-safe:animate-pulse -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

            <div className="max-w-md w-full bg-card/60 backdrop-blur-xl border border-border/85 rounded-3xl p-8 shadow-2xl text-center transition-all duration-300 hover:border-red-500/30">
                {/* Shield Alert Icon with animation */}
                <div className="mx-auto w-20 h-20 bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center rounded-2xl mb-8 motion-safe:animate-pulse">
                    <ShieldAlert size={40} strokeWidth={2} />
                </div>

                {/* Typography and copy */}
                <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-foreground">
                    Access Denied
                </h1>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-8">
                    Your account does not have the required permissions to access this page. If you believe this is an error, please contact your Keycloak administrator to update your client roles.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl shadow-lg hover:bg-primary/95 transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <Home size={16} />
                        Go to Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-accent/55 border border-border hover:bg-accent hover:text-foreground text-muted-foreground rounded-xl transition-all cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
