'use client';

import { useState, useEffect } from 'react';
import { FileText, AlignLeft, Hash, Flag, CheckSquare, FolderKanban, Loader2 } from 'lucide-react';
import { UserStoryStatus } from '@/domain/types';
import { Sprint } from '@/domain/entities/Sprint';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { UserSearchResult } from '@/domain/entities/User';
import { projectService } from '@/infrastructure/services/projectService';
import { LabelSelector } from '@/features/labels/components/LabelSelector';
import UserStoryAssigneeSelector from './UserStoryAssigneeSelector';

interface UserStoryFormProps {
    initialData?: {
        title: string;
        description?: string;
        storyPoints?: number;
        statusId: number;
        acceptanceCriteria?: string;
        sprintId?: number;
        epicId?: number;
        assignedTo?: string;
        labelIds?: number[];
    };
    projectId: number;
    sprints?: Sprint[];
    epics?: EpicResponseDto[];
    isSprintReadOnly?: boolean;
    isLoading: boolean;
    onSubmit: (data: {
        title: string;
        description?: string;
        storyPoints?: number;
        statusId: number;
        acceptanceCriteria?: string;
        sprintId?: number;
        epicId?: number;
        projectId: number;
        priority: number;
        assignedTo?: string;
        labelIds?: number[];
    }) => void;
    onCancel: () => void;
    submitLabel: string;
}

export default function UserStoryForm({
    initialData,
    projectId,
    sprints = [],
    epics = [],
    isSprintReadOnly = false,
    isLoading,
    onSubmit,
    onCancel,
    submitLabel,
}: UserStoryFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [storyPoints, setStoryPoints] = useState<number | ''>(initialData?.storyPoints || '');
    const [statusId, setStatusId] = useState<number>(initialData?.statusId || UserStoryStatus.Backlog);
    const [acceptanceCriteria, setAcceptanceCriteria] = useState(initialData?.acceptanceCriteria || '');
    const [selectedSprintId, setSelectedSprintId] = useState<number | undefined>(initialData?.sprintId);
    const [selectedEpicId, setSelectedEpicId] = useState<number | undefined>(initialData?.epicId);
    const [assignedUser, setAssignedUser] = useState<UserSearchResult | null>(null);
    const [isLoadingAssignee, setIsLoadingAssignee] = useState(!!initialData?.assignedTo);
    const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>(initialData?.labelIds || []);

    useEffect(() => {
        const assignedTo = initialData?.assignedTo;
        if (!assignedTo) {
            setIsLoadingAssignee(false);
            return;
        }

        let cancelled = false;

        const loadUser = async () => {
            try {
                const projectUsersResult = await projectService.getProjectUsers(projectId);
                
                if (cancelled) return;
                
                let found = null;
                
                if (projectUsersResult.success && projectUsersResult.data.length > 0) {
                    found = projectUsersResult.data.find(u => u.id === assignedTo);
                }
                
                if (!found && assignedTo.length >= 3) {
                    const searchResult = await projectService.searchUsers(assignedTo);
                    if (!cancelled && searchResult.success) {
                        found = searchResult.data.find(u => u.id === assignedTo);
                    }
                }
                
                if (found) {
                    setAssignedUser(found);
                } else {
                    setAssignedUser({ id: assignedTo, username: assignedTo, displayName: assignedTo, email: '' });
                }
            } catch {
                if (!cancelled) {
                    setAssignedUser({ id: assignedTo, username: assignedTo, displayName: assignedTo, email: '' });
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingAssignee(false);
                }
            }
        };

        loadUser();

        return () => {
            cancelled = true;
        };
    }, [initialData?.assignedTo, projectId]);

    const isValid = title.trim().length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            storyPoints: storyPoints || undefined,
            statusId,
            acceptanceCriteria: acceptanceCriteria.trim() || undefined,
            sprintId: selectedSprintId,
            epicId: selectedEpicId,
            projectId,
            priority: 2,
            assignedTo: assignedUser?.id,
            labelIds: selectedLabelIds,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-1.5">
                <label htmlFor="story-title" className="block text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        id="story-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="As a user, I want to..."
                        autoFocus
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="story-description" className="block text-sm font-medium">
                    Description
                </label>
                <div className="relative">
                    <AlignLeft size={14} className="absolute left-3 top-3 text-muted-foreground" />
                    <textarea
                        id="story-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the user story in detail..."
                        rows={3}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="story-points" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Hash size={13} /> Story Points</span>
                    </label>
                    <input
                        id="story-points"
                        type="number"
                        min="0"
                        max="100"
                        value={storyPoints}
                        onChange={(e) => setStoryPoints(e.target.value ? parseInt(e.target.value) : '')}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="story-status" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Flag size={13} /> Status</span>
                    </label>
                    <select
                        id="story-status"
                        value={statusId}
                        onChange={(e) => setStatusId(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    >
                        <option value={UserStoryStatus.Backlog}>Backlog</option>
                        <option value={UserStoryStatus.ToDo}>To Do</option>
                        <option value={UserStoryStatus.InProgress}>In Progress</option>
                        <option value={UserStoryStatus.ReadyForReview}>Ready for Review</option>
                        <option value={UserStoryStatus.InReview}>In Review</option>
                        <option value={UserStoryStatus.Done}>Done</option>
                        <option value={UserStoryStatus.Blocked}>Blocked</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="story-sprint" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><FolderKanban size={13} /> Sprint</span>
                    </label>
                    {isSprintReadOnly ? (
                        <div className="px-3 py-2 text-sm rounded-md border border-border bg-muted/50 text-muted-foreground">
                            {sprints.find(s => s.id === selectedSprintId)?.name || `Sprint #${selectedSprintId}`}
                        </div>
                    ) : (
                        <select
                            id="story-sprint"
                            value={selectedSprintId || ''}
                            onChange={(e) => setSelectedSprintId(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        >
                            <option value="">No Sprint (Backlog)</option>
                            {sprints.map(sprint => (
                                <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="story-epic" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Flag size={13} /> Epic</span>
                    </label>
                    <select
                        id="story-epic"
                        value={selectedEpicId || ''}
                        onChange={(e) => setSelectedEpicId(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    >
                        <option value="">No Epic</option>
                        {epics.map(epic => (
                            <option key={epic.id} value={epic.id}>{epic.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="story-ac" className="block text-sm font-medium">
                    <span className="flex items-center gap-1.5"><CheckSquare size={13} /> Acceptance Criteria</span>
                </label>
                <textarea
                    id="story-ac"
                    value={acceptanceCriteria}
                    onChange={(e) => setAcceptanceCriteria(e.target.value)}
                    placeholder="Enter acceptance criteria (one per line)..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {isLoadingAssignee ? (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assignee</label>
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-secondary/50 border border-secondary rounded-lg">
                            <Loader2 size={14} className="animate-spin" />
                            Loading...
                        </div>
                    </div>
                ) : (
                    <UserStoryAssigneeSelector
                        assignedUser={assignedUser}
                        onAssign={(user) => setAssignedUser(user)}
                        onRemove={() => setAssignedUser(null)}
                    />
                )}

                <LabelSelector
                    selectedLabelIds={selectedLabelIds}
                    onChange={setSelectedLabelIds}
                />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        submitLabel
                    )}
                </button>
            </div>
        </form>
    );
}