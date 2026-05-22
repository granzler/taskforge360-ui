'use client';

import { useSession, signOut, signIn } from 'next-auth/react';
import { User, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  'system-admin': 'System Admin',
  'product-owner': 'Product Owner',
  'scrum-master': 'Scrum Master',
  'developer': 'Developer'
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  'system-admin': 'bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20',
  'product-owner': 'bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-500/20',
  'scrum-master': 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/20',
  'developer': 'bg-green-500/10 text-green-500 border-green-500/20 dark:bg-green-500/20'
};

export default function UserInfo() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="h-8 w-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <button
        onClick={() => signIn()}
        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
      >
        Sign In
      </button>
    );
  }

  // Get user initials
  const initials = session?.user?.name
    ? session.user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : 'U';

  const roles = session?.user?.roles || [];
  const primaryRole = ['system-admin', 'product-owner', 'scrum-master', 'developer'].find(
    (r) => roles.includes(r)
  ) || roles[0];

  const handleSignOut = async () => {
    setIsOpen(false);
    if (session?.logoutUrl) {
      const redirectUri = typeof window !== 'undefined' ? window.location.origin : '';
      const logoutUrl = `${session.logoutUrl}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;
      // Clear NextAuth session locally without redirecting automatically
      await signOut({ redirect: false });
      // Perform manual redirection to Keycloak logout URL to clear SSO session
      window.location.href = logoutUrl;
    } else {
      await signOut({ callbackUrl: '/login' });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-border"
      >
        <span className="text-sm font-medium hidden sm:block">
          {session?.user?.name || 'User'}
        </span>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
          {initials}
        </div>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 rounded-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session?.user?.email}
              </p>
              {primaryRole && (
                <div className="mt-1 flex">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${ROLE_BADGE_CLASSES[primaryRole] || 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-500/20'}`}>
                    {ROLE_DISPLAY_NAMES[primaryRole] || primaryRole}
                  </span>
                </div>
              )}
            </div>

            <div className="py-1">
              <button
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                <User size={16} className="mr-2" />
                Profile
              </button>
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800 py-1">
              <button
                onClick={handleSignOut}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}