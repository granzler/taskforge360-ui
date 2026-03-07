'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreateProjectDto, Project, UpdateProjectDto, UserSearchResult } from '@/features/projects/types';
import { Loader2, Save, X, Calendar, Type } from 'lucide-react';
import UserAssigner from '@/features/auth/components/UserAssigner';

interface ProjectFormProps {
    initialData?: Project;
    onSubmit: (data: CreateProjectDto | UpdateProjectDto, users?: UserSearchResult[]) => Promise<void>;
    isOrdering?: boolean;
}

export default function ProjectForm({ initialData, onSubmit }: ProjectFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreateProjectDto>({
        name: '',
        description: '',
        sprintDurationDays: 14,
    });
    const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                sprintDurationDays: initialData.sprintDurationDays,
            });

            // Populate selected users if available in initialData
            if (initialData.projectUsers) {
                const initialUsers: UserSearchResult[] = initialData.projectUsers.map(pu => ({
                    id: pu.userId,
                    username: pu.userName || '', // Fallback or assume populated
                    displayName: pu.displayName || pu.userName || 'Unknown User',
                    email: pu.email || ''
                }));
                setSelectedUsers(initialUsers);
            }
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (initialData) {
                await onSubmit({ ...formData, id: initialData.id }, selectedUsers);
            } else {
                await onSubmit(formData, selectedUsers);
            }
            router.push('/projects');
            router.refresh();
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to save project. Please check the console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssignUser = (user: UserSearchResult) => {
        if (!selectedUsers.some(u => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-border/60 rounded-3xl p-6 shadow-sm relative overflow-hidden max-w-4xl mx-auto">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-primary/0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Core Fields */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Project Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm px-4 py-3 font-bold text-lg"
                            placeholder="Enter project name..."
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={5}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm px-4 py-3 resize-y leading-relaxed"
                            placeholder="Write a comprehensive description of the project goals..."
                        />
                    </div>

                    <div>
                        <label htmlFor="sprintDuration" className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Calendar size={12} /> Sprint Duration
                        </label>
                        <div className="relative max-w-[200px]">
                            <input
                                id="sprintDuration"
                                type="number"
                                min={1}
                                required
                                value={formData.sprintDurationDays}
                                onChange={(e) => setFormData({ ...formData, sprintDurationDays: parseInt(e.target.value) || 0 })}
                                className="w-full bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm pl-4 pr-12 py-2.5 font-medium"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">Days</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Team Management */}
                <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                        Team Assignment
                    </label>
                    <div className="flex-1 bg-accent/10 border border-border/50 rounded-2xl p-4 flex flex-col">
                        <UserAssigner
                            assignedUsers={selectedUsers}
                            onAssign={handleAssignUser}
                            onRemove={handleRemoveUser}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border/50 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 relative z-10">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-500 bg-background border border-border rounded-xl hover:bg-accent/50 hover:text-slate-700 dark:hover:text-slate-200 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
                >
                    <X size={16} />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
                >
                    {isSubmitting ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Save size={18} />
                    )}
                    {initialData ? 'Save Changes' : 'Create Project'}
                </button>
            </div>
        </form>
    );
}
