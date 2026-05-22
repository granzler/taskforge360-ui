'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, MoreVertical, Trash2, Loader2 } from 'lucide-react';
import { SubTask, Epic } from '@/domain/entities/Project';
import { UserStoryDto } from '@/domain/entities/UserStory';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { Sprint } from '@/domain/entities/Sprint';
import { sprintService } from '@/infrastructure/services/sprintService';
import { toast } from 'react-hot-toast';
import UserStoryItem from './UserStoryItem';
import CreateUserStoryModal from './CreateUserStoryModal';
import EditUserStoryModal from './EditUserStoryModal';

type EpicItem = Epic | EpicResponseDto;

interface SprintWithStories extends Sprint {
    stories: UserStoryDto[];
    totalStoryPoints: number;
}

interface SprintsTabProps {
    projectId: number;
    projectName: string;
    sprints: Sprint[];
    userStories: UserStoryDto[];
    subtasks: SubTask[];
    epics: EpicItem[];
    onSprintDeleted: (sprintId: number) => void;
    onStoryCreated: (storyId: number) => void;
    onStoryUpdated?: (story: UserStoryDto) => void;
    canDeleteSprint?: boolean;
    canCreateStory?: boolean;
    canUpdateStory?: boolean;
}

export default function SprintsTab({ 
    projectId, 
    projectName, 
    sprints, 
    userStories, 
    subtasks, 
    epics, 
    onSprintDeleted,
    onStoryCreated,
    onStoryUpdated,
    canDeleteSprint = false,
    canCreateStory = false,
    canUpdateStory = false,
}: SprintsTabProps) {
    const [expandedSprints, setExpandedSprints] = useState<number[]>([1, 2]);
    const [expandedStories, setExpandedStories] = useState<number[]>([]);
    
    // Deletion states
    const [menuOpenSprintId, setMenuOpenSprintId] = useState<number | null>(null);
    const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createModalSprintId, setCreateModalSprintId] = useState<number | undefined>(undefined);
    const [editingStory, setEditingStory] = useState<UserStoryDto | null>(null);

    const toggleSprint = (id: number) => {
        setExpandedSprints(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleStory = (id: number) => {
        setExpandedStories(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const storiesBySprint: SprintWithStories[] = sprints.map(sprint => {
        const sprintStories = userStories.filter(us => us.sprintId === sprint.id);
        const totalStoryPoints = sprintStories.reduce((sum, us) => sum + (us.storyPoints || 0), 0);
        return {
            ...sprint,
            stories: sprintStories,
            totalStoryPoints
        };
    });

    const unassignedStories = userStories.filter(us => !us.sprintId);
    const unassignedStoryPoints = unassignedStories.reduce((sum, us) => sum + (us.storyPoints || 0), 0);

    const getStatusColor = (statusName: string) => {
        switch (statusName.toLowerCase()) {
            case 'planned':
                return 'bg-blue-500';
            case 'active':
                return 'bg-green-500';
            case 'completed':
                return 'bg-purple-500';
            case 'closed':
                return 'bg-slate-500';
            default:
                return 'bg-slate-500';
        }
    };

    const handleDeleteSprint = async () => {
        if (!sprintToDelete) return;

        setIsDeleting(true);
        try {
            const result = await sprintService.delete(sprintToDelete.id);
            if (result.success) {
                toast.success(`Sprint "${sprintToDelete.name}" deleted successfully.`);
                onSprintDeleted(sprintToDelete.id);
                setSprintToDelete(null);
            } else {
                toast.error(result.errors.map(e => e.message).join(', ') || 'Failed to delete sprint.');
            }
        } catch (err) {
            console.error('Failed to delete sprint:', err);
            toast.error('An unexpected error occurred while deleting the sprint.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {storiesBySprint.map(sprint => (
                <div key={sprint.id} className="rounded-xl border border-border bg-card/50 shadow-sm relative transition-all">
                    <div
                        className={`bg-accent/30 p-4 flex items-center justify-between cursor-pointer hover:bg-accent/40 transition-colors ${expandedSprints.includes(sprint.id) ? 'rounded-t-xl' : 'rounded-xl'}`}
                        onClick={() => toggleSprint(sprint.id)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-slate-400">
                                {expandedSprints.includes(sprint.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-base flex items-center gap-3">
                                    {sprint.name}
                                    <span className={`text-[10px] ${getStatusColor(sprint.status.name)} text-white px-2 py-0.5 rounded-full uppercase tracking-widest`}>
                                        {sprint.status.name}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500">{sprint.startDate} — {sprint.endDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">{sprint.totalStoryPoints} pts</p>
                                <p className="text-[10px] text-muted-foreground">{sprint.stories.length} stories</p>
                            </div>
                            <div className="relative">
                                <button 
                                    className="p-2 hover:bg-background/80 rounded-full text-slate-400 transition-colors" 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setMenuOpenSprintId(menuOpenSprintId === sprint.id ? null : sprint.id);
                                    }}
                                >
                                    <MoreVertical size={16} />
                                </button>
                                
                                {menuOpenSprintId === sprint.id && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpenSprintId(null);
                                            }} 
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-lg z-20 overflow-hidden text-sm py-1 animate-in fade-in zoom-in-95 duration-100">
                                            {canDeleteSprint && (
                                                <button
                                                    className="w-full text-left px-4 py-2 hover:bg-accent hover:text-red-500 transition-colors flex items-center gap-2 text-red-600 dark:text-red-400"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuOpenSprintId(null);
                                                        setSprintToDelete(sprint);
                                                    }}
                                                >
                                                    <Trash2 size={14} /> Delete Sprint
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {expandedSprints.includes(sprint.id) && (
                        <div className="p-4 border-t border-border bg-background/20 rounded-b-xl">
                            {sprint.stories.length > 0 ? (
                                sprint.stories.map((story, idx) => (
                                    <UserStoryItem
                                        key={`${story.id}-${idx}`}
                                        story={story}
                                        isExpanded={expandedStories.includes(story.id)}
                                        onToggle={toggleStory}
                                        onEdit={(story) => setEditingStory(story)}
                                        subtasks={subtasks.filter(st => st.userStoryId === story.id)}
                                        epic={epics.find(e => e.id === story.epicId)}
                                        canUpdateStory={canUpdateStory}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-border rounded-lg text-sm">
                                    No stories in this sprint. Drag here to add.
                                </div>
                            )}
                            {canCreateStory && (
                                <button 
                                    className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-dashed border-border rounded-lg text-xs font-medium text-slate-500 hover:bg-accent/5 hover:text-primary transition-all"
                                    onClick={() => {
                                        setCreateModalSprintId(sprint.id);
                                        setShowCreateModal(true);
                                    }}
                                >
                                    <Plus size={14} /> Add User Story
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Backlog / Unassigned Stories */}
            <div className="relative pt-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Backlog / Unassigned
                        {unassignedStories.length > 0 && (
                            <span className="ml-2 text-muted-foreground font-normal">
                                ({unassignedStoryPoints} pts)
                            </span>
                        )}
                    </span>
                </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background shadow-sm">
                {unassignedStories.length > 0 ? (
                    unassignedStories.map((story, idx) => (
                        <UserStoryItem
                            key={`unassigned-${story.id}-${idx}`}
                            story={story}
                            isExpanded={expandedStories.includes(story.id)}
                            onToggle={toggleStory}
                            onEdit={(story) => setEditingStory(story)}
                            subtasks={subtasks.filter(st => st.userStoryId === story.id)}
                            epic={epics.find(e => e.id === story.epicId)}
                            canUpdateStory={canUpdateStory}
                        />
                    ))
                ) : (
                    <div className="text-center py-6 text-slate-500 text-sm italic">
                        No unassigned items in backlog.
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {sprintToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="w-full max-w-sm bg-background border border-border rounded-xl shadow-2xl p-6  animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/20">
                                <Trash2 size={24} />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">Delete Sprint?</h2>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Are you sure you want to delete the sprint <strong>&quot;{sprintToDelete.name}&quot;</strong>? This action cannot be undone. Associated user stories will be moved to the backlog.
                        </p>
                        <div className="flex justify-end gap-3 w-full">
                            <button
                                onClick={() => setSprintToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSprint}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <><Loader2 size={14} className="animate-spin" /> Deleting...</>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create User Story Modal */}
            {showCreateModal && (
                <CreateUserStoryModal
                    projectId={projectId}
                    projectName={projectName}
                    sprints={sprints}
                    epics={epics.filter((e): e is EpicResponseDto => 'title' in e)}
                    sprintId={createModalSprintId}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={(storyId) => {
                        setShowCreateModal(false);
                        if (storyId) {
                            onStoryCreated(storyId);
                        }
                    }}
                />
            )}

            {/* Edit User Story Modal */}
            {editingStory && (
                <EditUserStoryModal
                    story={editingStory}
                    isOpen={!!editingStory}
                    onClose={() => setEditingStory(null)}
                    onUpdated={(story) => {
                        onStoryUpdated?.(story);
                    }}
                    sprints={sprints}
                    epics={epics.filter((e): e is EpicResponseDto => 'title' in e)}
                />
            )}
        </div>
    );
}
