'use client';

import { useSession } from 'next-auth/react';
import { useProject } from '@/features/projects/context/ProjectContext';
import { usePermission } from '@/features/auth/hooks/usePermission';
import Link from 'next/link';
import { FolderOpen, Calendar, Layers, Tag, ArrowRight } from 'lucide-react';

export default function Home() {
    const { data: session } = useSession();
    const { projects, isLoading, selectedProject } = useProject();
    const { roles } = usePermission();
    const isAdmin = roles.includes('system-admin') || roles.includes('product-owner');

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Welcome Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome, {session?.user?.name || 'User'}
                </h1>
                <p className="text-slate-500 mt-1">
                    Here is an overview of your workspace.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <Link href="/projects" className="group">
                    <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <FolderOpen size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-2xl font-extrabold">{isLoading ? '...' : projects.length}</p>
                        <p className="text-sm text-slate-500 font-medium">Projects</p>
                    </div>
                </Link>

                <Link href="/backlog" className="group">
                    <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                                <Calendar size={20} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-2xl font-extrabold">Backlog</p>
                        <p className="text-sm text-slate-500 font-medium">Sprints & Epics</p>
                    </div>
                </Link>

                <Link href={selectedProject ? `/projects/${selectedProject.id}` : '/projects'} className="group">
                    <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                <Layers size={20} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-2xl font-extrabold">Team</p>
                        <p className="text-sm text-slate-500 font-medium">Project Members</p>
                    </div>
                </Link>

                {isAdmin && (
                    <Link href="/admin/labels" className="group">
                        <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                                    <Tag size={20} className="text-amber-600 dark:text-amber-400" />
                                </div>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-2xl font-extrabold">Labels</p>
                            <p className="text-sm text-slate-500 font-medium">Administration</p>
                        </div>
                    </Link>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        href="/projects"
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-accent/50 border border-border/30 hover:border-primary/30 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FolderOpen size={22} className="text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Browse Projects</p>
                            <p className="text-xs text-slate-500">View and manage projects</p>
                        </div>
                    </Link>
                    <Link
                        href="/backlog"
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-accent/50 border border-border/30 hover:border-primary/30 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar size={22} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Plan Sprint</p>
                            <p className="text-xs text-slate-500">Manage backlog and sprints</p>
                        </div>
                    </Link>
                    {isAdmin && (
                        <Link
                            href="/admin/labels"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-accent/50 border border-border/30 hover:border-primary/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Tag size={22} className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Manage Labels</p>
                                <p className="text-xs text-slate-500">Create and edit labels</p>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
