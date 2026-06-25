'use client';

import { useState, useEffect } from 'react';
import { FileText, AlignLeft, Hash, Flag, CheckSquare, FolderKanban, Loader2, Layers } from 'lucide-react';
import { WorkItemStatus, WorkItemType, WORK_ITEM_STATUS_OPTIONS, WORK_ITEM_TYPE_OPTIONS } from '@/domain/types';
import { Sprint } from '@/domain/entities/Sprint';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { UserSearchResult } from '@/domain/entities/User';
import { projectService } from '@/infrastructure/services/projectService';
import { LabelSelector } from '@/features/labels/components/LabelSelector';
import UserStoryAssigneeSelector from './UserStoryAssigneeSelector';

interface WorkItemFormProps {
    initialData?: {
        title: string;
        description?: string;
        storyPoints?: number;
        statusId: number;
        acceptanceCriteria?: string;
        sprintId?: number;
        parentId?: number;              // Replaces epicId
        type?: WorkItemType;            // For edit — not changeable after create
        assignedTo?: string;
        labelIds?: number[];
    };
    projectId: number;
    sprints?: Sprint[];
    epics?: EpicResponseDto[];
    isSprintReadOnly?: boolean;
    isLoading: boolean;
    showTypeSelector?: boolean;         // Show type selector (create mode)
    defaultType?: WorkItemType;         // Default type (for CreateTaskModal etc)
    onSubmit: (data: {
        title: string;
        description?: string;
        storyPoints?: number;
        statusId: number;
        acceptanceCriteria?: string;
        sprintId?: number;
        parentId?: number;
        type: WorkItemType;
        projectId: number;
        priority: number;
        assignedTo?: string;
        labelIds?: number[];
    }) => void;
    onCancel: () => void;
    submitLabel: string;
}

export default function WorkItemForm({
    initialData,
    projectId,
    sprints = [],
    epics = [],
    isSprintReadOnly = false,
    isLoading,
    showTypeSelector = true,
    defaultType = WorkItemType.Story,
    onSubmit,
    onCancel,
    submitLabel,
}: WorkItemFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [storyPoints, setStoryPoints] = useState<number | ''>(initialData?.storyPoints || '');
    const [statusId, setStatusId] = useState<number>(initialData?.statusId || WorkItemStatus.Backlog);
    const [acceptanceCriteria, setAcceptanceCriteria] = useState(initialData?.acceptanceCriteria || '');
    const [selectedSprintId, setSelectedSprintId] = useState<number | undefined>(initialData?.sprintId);
    const [selectedParentId, setSelectedParentId] = useState<number | undefined>(initialData?.parentId);
    const [selectedType, setSelectedType] = useState<WorkItemType>(initialData?.type || defaultType);
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
    const isTask = selectedType === WorkItemType.Task;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            storyPoints: storyPoints || undefined,
            statusId,
            acceptanceCriteria: acceptanceCriteria.trim() || undefined,
            sprintId: isTask ? undefined : selectedSprintId,           // Tasks don't go into sprints directly
            parentId: selectedParentId,
            type: selectedType,
            projectId,
            priority: 2,
            assignedTo: assignedUser?.id,
            labelIds: selectedLabelIds,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Type Selector (shown in create mode) */}
            {showTypeSelector && (
                <div className="space-y-1.5">
                    <label htmlFor="workitem-type" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Layers size={13} /> Type</span>
                    </label>
                    <select
                        id="workitem-type"
                        value={selectedType}
                        onChange={(e) => setSelectedType(Number(e.target.value) as WorkItemType)}
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    >
                        {WORK_ITEM_TYPE_OPTIONS.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="space-y-1.5">
                <label htmlFor="workitem-title" className="block text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        id="workitem-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={isTask ? "Describe the task..." : "As a user, I want to..."}
                        autoFocus
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="workitem-description" className="block text-sm font-medium">
                    Description
                </label>
                <div className="relative">
                    <AlignLeft size={14} className="absolute left-3 top-3 text-muted-foreground" />
                    <textarea
                        id="workitem-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={isTask ? "Describe the task details..." : "Describe the user story in detail..."}
                        rows={3}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="workitem-points" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Hash size={13} /> {isTask ? 'Effort' : 'Story Points'}</span>
                    </label>
                    <input
                        id="workitem-points"
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
                    <label htmlFor="workitem-status" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Flag size={13} /> Status</span>
                    </label>
                    <select
                        id="workitem-status"
                        value={statusId}
                        onChange={(e) => setStatusId(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    >
                        {WORK_ITEM_STATUS_OPTIONS.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {!isTask && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label htmlFor="workitem-sprint" className="block text-sm font-medium">
                            <span className="flex items-center gap-1.5"><FolderKanban size={13} /> Sprint</span>
                        </label>
                        {isSprintReadOnly ? (
                            <div className="px-3 py-2 text-sm rounded-md border border-border bg-muted/50 text-muted-foreground">
                                {sprints.find(s => s.id === selectedSprintId)?.name || `Sprint #${selectedSprintId}`}
                            </div>
                        ) : (
                            <select
                                id="workitem-sprint"
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
                        <label htmlFor="workitem-epic" className="block text-sm font-medium">
                            <span className="flex items-center gap-1.5"><Flag size={13} /> Epic / Parent</span>
                        </label>
                        <select
                            id="workitem-epic"
                            value={selectedParentId || ''}
                            onChange={(e) => setSelectedParentId(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        >
                            <option value="">No Epic</option>
                            {epics.map(epic => (
                                <option key={epic.id} value={epic.id}>{epic.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Parent selector for Tasks — links to a Story/Bug/Spike */}
            {isTask && (
                <div className="space-y-1.5">
                    <label htmlFor="workitem-parent" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Flag size={13} /> Parent Story / Bug / Spike</span>
                    </label>
                    <input
                        id="workitem-parent"
                        type="number"
                        value={selectedParentId || ''}
                        onChange={(e) => setSelectedParentId(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Enter parent work item ID..."
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                    <p className="text-[10px] text-muted-foreground">Tasks must be linked to a Story, Bug, or Spike via its ID.</p>
                </div>
            )}

            <div className="space-y-1.5">
                <label htmlFor="workitem-ac" className="block text-sm font-medium">
                    <span className="flex items-center gap-1.5"><CheckSquare size={13} /> Acceptance Criteria</span>
                </label>
                <textarea
                    id="workitem-ac"
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
