'use client';

import { useState } from 'react';
import { UserSearchResult } from '@/domain/entities/User';
import { projectService } from '@/infrastructure/services/projectService';
import UserAssigner from '@/features/auth/components/UserAssigner';
import { notifyResult } from '@/lib/utils/notify';
import { Mail, Trash2, Users } from 'lucide-react';
import { ConfirmModal } from '@/components/ui';

interface TeamMembersPanelProps {
    projectId: number;
    users: UserSearchResult[];
    onUsersChanged: () => Promise<void>;
    canUpdateProject: boolean;
    concurrencyVersion?: number;
}

export default function TeamMembersPanel({ projectId, users, onUsersChanged, canUpdateProject, concurrencyVersion }: TeamMembersPanelProps) {
    const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({});
    const [userToRemove, setUserToRemove] = useState<UserSearchResult | null>(null);

    const confirmAndRemoveUser = async (userId: string) => {
        setIsRemoving(prev => ({ ...prev, [userId]: true }));
        try {
            const result = await projectService.removeUser(projectId, userId);
            if (notifyResult(result, { success: 'User removed from project.' })) {
                await onUsersChanged();
            }
        } catch (err) {
            console.error('Failed to remove user:', err);
        } finally {
            setIsRemoving(prev => ({ ...prev, [userId]: false }));
            setUserToRemove(null);
        }
    };

    const handleAssignUser = async (user: UserSearchResult) => {
        try {
            const result = await projectService.assignUser(projectId, user.id, concurrencyVersion ?? 1);
            if (notifyResult(result, { success: 'User added to project.' })) {
                await onUsersChanged();
            }
        } catch (err) {
            console.error('Failed to assign user:', err);
        }
    };

    return (
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

            {canUpdateProject && (
                <div className="mb-6 relative z-10">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Invite to Project</label>
                    <UserAssigner
                        assignedUsers={users}
                        onAssign={handleAssignUser}
                        onRemove={() => {}}
                        hideAssignedList={true}
                    />
                </div>
            )}

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
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm group-hover:scale-105 transition-transform" role="img" aria-label={(user.displayName || user.username || '?').charAt(0).toUpperCase()}>
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
                            {canUpdateProject && (
                                <button
                                    onClick={() => setUserToRemove(user)}
                                    disabled={isRemoving[user.id]}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-40"
                                    title="Remove User"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <ConfirmModal
                isOpen={!!userToRemove}
                title="Remove team member?"
                message={`Are you sure you want to remove "${userToRemove?.displayName || userToRemove?.username}" from this project? They will lose access to all project data.`}
                confirmLabel="Remove"
                variant="danger"
                isLoading={!!(userToRemove && isRemoving[userToRemove.id])}
                onConfirm={() => userToRemove && confirmAndRemoveUser(userToRemove.id)}
                onCancel={() => setUserToRemove(null)}
            />
        </section>
    );
}
