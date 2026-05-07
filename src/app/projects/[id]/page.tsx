'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Project } from '@/domain/entities/Project';
import { UserSearchResult } from '@/domain/entities/User';
import { projectService } from '@/infrastructure/services/projectService';
import { ArrowLeft, Calendar, Edit, Loader2, Mail, Save, Trash2, FolderOpen, Users, Clock } from 'lucide-react';
import UserAssigner from '@/features/auth/components/UserAssigner';
import { toast } from 'react-hot-toast';
import { useProject } from '@/features/projects/context/ProjectContext';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    const projectId = parseInt(id);

    const { refreshProjects } = useProject();
    const [project, setProject] = useState<Project | null>(null);
    const [users, setUsers] = useState<UserSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<{
        name: string;
        description: string;
        sprintDurationDays: number;
        concurrencyVersion: number;
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!projectId) return;

        const fetchData = async () => {
            try {
                const [projectResult, usersResult] = await Promise.all([
                    projectService.getById(projectId),
                    projectService.getProjectUsers(projectId)
                ]);

                if (projectResult.success) {
                    setProject(projectResult.data);
                    setEditForm({
                        name: projectResult.data.name,
                        description: projectResult.data.description || '',
                        sprintDurationDays: projectResult.data.sprintDurationDays,
                        concurrencyVersion: projectResult.data.concurrencyVersion,
                    });
                } else {
                    setError('Project not found or no longer exists.');
                }

                if (usersResult.success) {
                    setUsers(usersResult.data);
                }
            } catch (err) {
                console.error('Failed to fetch project details:', err);
                setError('Failed to load project details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [projectId]);

    const handleSave = async () => {
        if (!project || !editForm) return;
        setIsSaving(true);
        try {
            const updateResult = await projectService.update(project.id, {
                id: project.id,
                name: editForm.name,
                description: editForm.description,
                sprintDurationDays: editForm.sprintDurationDays,
                concurrencyVersion: editForm.concurrencyVersion,
            });

            if (updateResult.success) {
                // Update local state
                setProject({
                    ...project,
                    ...editForm
                });
                setIsEditing(false);
                toast.success('Project updated successfully.');
            } else {
                toast.error(updateResult.errors.map(e => e.message).join(', ') || 'Failed to update project.');
            }
        } catch (err) {
            console.error('Failed to update project:', err);
            toast.error('Failed to update project. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this user from the project?')) return;

        try {
            const result = await projectService.removeUser(projectId, userId);
            if (result.success) {
                setUsers(users.filter(u => u.id !== userId));
                toast.success('User removed from project.');
                await refreshProjects();
            } else {
                toast.error(result.errors.map(e => e.message).join(', ') || 'Failed to remove user.');
            }
        } catch (err) {
            console.error('Failed to remove user:', err);
            toast.error('Failed to remove user.');
        }
    };

    const handleAssignUser = async (user: UserSearchResult) => {
        if (!project) return;
        try {
            const result = await projectService.assignUser(projectId, user.id, project.concurrencyVersion);
            if (result.success) {
                if (!users.some(u => u.id === user.id)) {
                    setUsers([...users, user]);
                    toast.success('User added to project.');
                }
                await refreshProjects();
            } else {
                toast.error(result.errors.map(e => e.message).join(', ') || 'Failed to assign user.');
            }
        } catch (err) {
            console.error('Failed to assign user:', err);
            toast.error('Failed to assign user.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Link href="/projects" className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 mb-6 font-medium transition-colors">
                    <ArrowLeft size={16} /> Back to Projects
                </Link>
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                    <Trash2 size={24} className="text-red-400" />
                    <div>
                        <h3 className="font-bold">Error Loading Project</h3>
                        <p className="text-sm">{error || 'Project not found or no longer exists.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Link
                href="/projects"
                className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors w-fit"
            >
                <div className="p-1 rounded-md bg-transparent group-hover:bg-primary/10 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                Return to Workspace
            </Link>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                <div className="flex gap-5 flex-1">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shrink-0 shadow-sm border border-primary/10">
                        <FolderOpen size={32} strokeWidth={2.5} />
                    </div>

                    <div className="flex-1 max-w-2xl">
                        {isEditing && editForm ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Project Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => editForm && setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-accent/30 border border-border/50 rounded-xl font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm"
                                        placeholder="Enter project name..."
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-48">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <Calendar size={12} /> Sprint Duration
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={editForm.sprintDurationDays}
                                                onChange={e => editForm && setEditForm({ ...editForm, sprintDurationDays: parseInt(e.target.value) || 0 })}
                                                className="w-full pl-4 pr-12 py-2.5 bg-accent/30 border border-border/50 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm"
                                                min="1"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">Days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300 pt-1">
                                <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">{project.name}</h1>
                                <div className="flex items-center gap-4 text-sm font-medium">
                                    <div className="flex items-center gap-1.5 bg-accent/60 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 border border-border/50 shadow-sm">
                                        <Clock size={16} className="text-primary" />
                                        <span>{project.sprintDurationDays} Day Sprints</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-accent/60 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 border border-border/50 shadow-sm">
                                        <Users size={16} className="text-blue-500" />
                                        <span>{users.length} Team {users.length === 1 ? 'Member' : 'Members'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    {isEditing && editForm ? (
                        <>
                            <button
                                onClick={() => {
                                    setEditForm({ 
                                        name: project.name, 
                                        description: project.description || '', 
                                        sprintDurationDays: project.sprintDurationDays,
                                        concurrencyVersion: project.concurrencyVersion,
                                    });
                                    setIsEditing(false);
                                }}
                                className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-background border border-border rounded-xl hover:bg-accent/50 hover:text-slate-700 dark:hover:text-slate-200 transition-all shadow-sm"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95"
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-background border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 text-foreground transition-all shadow-sm"
                        >
                            <Edit size={16} className="text-primary" />
                            Edit Details
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Description */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-primary/0"></div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            Overview
                        </h2>

                        {isEditing && editForm ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Project Description</label>
                                <textarea
                                    rows={8}
                                    value={editForm.description}
                                    onChange={(e) => editForm && setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm resize-y leading-relaxed"
                                    placeholder="Write a comprehensive description of the project goals, tech stack, and objectives..."
                                />
                            </div>
                        ) : (
                            <div className="prose prose-slate dark:prose-invert max-w-none animate-in fade-in duration-300">
                                {project.description ? (
                                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                        {project.description}
                                    </p>
                                ) : (
                                    <div className="text-center py-10 px-4 border-2 border-dashed border-border/50 rounded-2xl bg-accent/10">
                                        <p className="text-slate-400 italic font-medium">No description provided for this project.</p>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="mt-3 text-sm font-bold text-primary hover:underline flex items-center gap-1 mx-auto"
                                        >
                                            <Edit size={14} /> Add Description
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar: Team Members */}
                <div className="space-y-8">
                    <section className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Users size={20} className="text-blue-500" />
                                Team Members
                            </h2>
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full">
                                {users.length}
                            </span>
                        </div>

                        <div className="mb-6 relative z-10">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Invite to Project</label>
                            <UserAssigner
                                assignedUsers={users}
                                onAssign={handleAssignUser}
                                onRemove={() => { }}
                                hideAssignedList={true}
                            />
                        </div>

                        {users.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-2xl bg-accent/10">
                                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-border/30">
                                    <Users size={20} className="text-slate-400" />
                                </div>
                                <p className="text-slate-500 text-sm font-medium">
                                    No team members yet.
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Search above to assign users.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {users.map((user) => (
                                    <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/40 border border-transparent hover:border-border/50 transition-all group backdrop-blur-sm">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm group-hover:scale-105 transition-transform">
                                            <span className="text-primary font-bold text-sm">
                                                {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-sm truncate text-foreground">
                                                {user.displayName || user.username}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                                                <Mail size={12} className="shrink-0" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveUser(user.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Remove User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
