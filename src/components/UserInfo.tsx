'use client';

import { useSession, signOut, signIn } from 'next-auth/react';
import { User, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';

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
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session?.user?.email}
              </p>
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
                onClick={() => signOut()}
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