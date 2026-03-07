'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Project, UserSearchResult } from '@/features/projects/types';
import { projectService } from '@/services/projectService';
import { ArrowLeft, Calendar, Edit, Loader2, User as UserIcon, Mail, Save, Trash2 } from 'lucide-react';
import UserAssigner from '@/features/auth/components/UserAssigner';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    const projectId = parseInt(id);

    const [project, setProject] = useState<Project | null>(null);
    const [users, setUsers] = useState<UserSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        sprintDurationDays: 14
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchData();
        }
    }, [projectId]);

    const fetchData = async () => {
        try {
            // Fetch project and users in parallel
            const [projectData, usersData] = await Promise.all([
                projectService.getById(projectId),
                projectService.getProjectUsers(projectId)
            ]);
            setProject(projectData);
            setUsers(usersData);

            // Initialize edit form
            setEditForm({
                name: projectData.name,
                description: projectData.description || '',
                sprintDurationDays: projectData.sprintDurationDays
            });
        } catch (err) {
            console.error('Failed to fetch project details:', err);
            setError('Failed to load project details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!project) return;
        setIsSaving(true);
        try {
            await projectService.update(project.id, {
                id: project.id,
                ...editForm
            });

            // Update local state
            setProject({
                ...project,
                ...editForm
            });
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update project:', err);
            alert('Failed to update project. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this user from the project?')) return;

        try {
            await projectService.removeUser(projectId, userId);
            // Optimistic update
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Failed to remove user:', err);
            alert('Failed to remove user.');
        }
    };

    const handleAssignUser = async (user: UserSearchResult) => {
        try {
            await projectService.assignUser(projectId, user.id);
            // Refresh users list to be safe, or optimistic update
            setUsers([...users, user]);
        } catch (err) {
            console.error('Failed to assign user:', err);
            alert('Failed to assign user.');
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
            <div className="container mx-auto px-4 py-8">
                <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
                    {error || 'Project not found'}
                </div>
                <Link href="/projects" className="text-primary hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link href="/projects" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Projects
                </Link>
                <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        {isEditing ? (
                            <div className="space-y-4 max-w-xl">
                                <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md font-bold text-2xl mb-2"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Sprint Days</label>
                                        <input
                                            type="number"
                                            value={editForm.sprintDurationDays}
                                            onChange={e => setEditForm({ ...editForm, sprintDurationDays: parseInt(e.target.value) || 0 })}
                                            className="w-24 px-3 py-1 border rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                                <div className="flex items-center gap-4 text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <Calendar size={16} />
                                        {project.sprintDurationDays} Days Sprint
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
                            >
                                <Edit size={16} />
                                Edit Project
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description */}
                    <section className="bg-card border rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Description</h2>
                        {isEditing ? (
                            <textarea
                                rows={6}
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter project description"
                            />
                        ) : (
                            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {project.description || 'No description provided.'}
                            </p>
                        )}
                    </section>

                    {/* Work Items / Sprints placeholder if needed */}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Team Members */}
                    <section className="bg-card border rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Team Members</h2>
                            <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                                {users.length}
                            </span>
                        </div>

                        <div className="mb-6">
                            <UserAssigner
                                assignedUsers={users}
                                onAssign={handleAssignUser}
                                onRemove={() => { }} // UserAssigner remove is for the self-managed list, but checking requirements... 
                                // Actually, we want to add new users via this. 
                                // The requirement says "Add Assign button". 
                                // UserAssigner has a search bar. Let's use it for searching and assigning.
                                // We can pass a no-op to onRemove here since we handle removal in the list below.
                                hideAssignedList={true}
                            />
                        </div>

                        {users.length === 0 ? (
                            <p className="text-muted-foreground text-sm italic">
                                No team members assigned yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-primary font-semibold">
                                                {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm truncate">
                                                {user.displayName || user.username}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                                                <Mail size={10} />
                                                {user.email}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveUser(user.id)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
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
