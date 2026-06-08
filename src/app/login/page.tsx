'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (!error) {
      signIn('keycloak', { callbackUrl: 'http://localhost:3000/' });
    }
  }, [error]);

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="flex flex-col items-center gap-3">
        <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-foreground">
          TaskForge360
        </h2>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl" role="alert">
          <strong className="font-bold">Authentication error!</strong>
          <span className="block sm:inline"> Please try again.</span>
          <button
            className="mt-4 w-full flex justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary shadow-md hover:bg-primary/90 transition-all focus-visible:outline-2 focus-visible:outline-primary/50 focus-visible:outline-offset-2"
            onClick={() => signIn('keycloak', { callbackUrl: 'http://localhost:3000/' })}
          >
            Sign In
          </button>
        </div>
      )}

      {!error && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/30 border-t-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">
            Redirecting to login...
          </p>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <Suspense fallback={
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/30 border-t-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">Loading...</p>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
