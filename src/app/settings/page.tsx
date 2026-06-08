'use client';

import { useSession } from 'next-auth/react';
import { usePermission } from '@/features/auth/hooks/usePermission';
import { User, Shield, ExternalLink, Loader2, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const { roles, scopes } = usePermission();

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const user = session?.user;
    const logoutUrl = session?.logoutUrl;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

            <div className="space-y-6">
                {/* Profile Section */}
                <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <User size={20} className="text-primary" />
                        Profile
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b border-border/30">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                                <span className="text-primary font-bold text-2xl">
                                    {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-lg">{user?.name || 'User'}</p>
                                <p className="text-sm text-slate-500">{user?.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Username</span>
                                <p className="mt-1 font-medium">{user?.username || user?.name || '-'}</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</span>
                                <p className="mt-1 font-medium">{user?.email || '-'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Roles & Permissions */}
                <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Shield size={20} className="text-blue-500" />
                        Roles & Permissions
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Roles</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {roles.length > 0 ? roles.map(role => (
                                    <span key={role} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold">
                                        {role}
                                    </span>
                                )) : (
                                    <span className="text-sm text-slate-400 italic">No roles assigned</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scopes</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {scopes.length > 0 ? scopes.map(scope => (
                                    <span key={scope} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium">
                                        {scope}
                                    </span>
                                )) : (
                                    <span className="text-sm text-slate-400 italic">No scopes assigned</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Management */}
                <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <ExternalLink size={20} className="text-slate-500" />
                        Account Management
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Manage your account credentials and security settings through the identity provider.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {logoutUrl && (
                            <a
                                href={logoutUrl}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all text-sm"
                            >
                                <ExternalLink size={16} />
                                Manage Account (Keycloak)
                            </a>
                        )}
                        <button
                            onClick={() => signOut()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl font-bold hover:bg-accent/50 transition-all text-sm"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
