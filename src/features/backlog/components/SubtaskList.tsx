'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { BarChart3, CheckSquare, Loader2, Pencil, Trash2 } from 'lucide-react';
import { UpdateWorkItemRequestDto, WorkItemDto } from '@/domain/entities/WorkItem';
import { UserSearchResult } from '@/domain/entities/User';
import { Status, WorkItemStatus, WorkItemType, WORK_ITEM_STATUS_LABELS } from '@/domain/types';
import { getEpicPriorityColor, getStatusIcon } from '@/lib/utils/colors';
import { usePermission } from '@/features/auth/hooks/usePermission';
import UserAvatar from '@/features/projects/components/UserAvatar';
import { useProjectUsers } from '@/features/projects/hooks/useProjectUsers';
import { useSubtasks } from '../hooks/useSubtasks';
import { useUpdateWorkItem } from '../hooks/useUpdateWorkItem';
import { useDeleteWorkItem } from '../hooks/useDeleteWorkItem';
import { useWorkItemStatuses } from '../hooks/useWorkItemStatuses';
import QuickCreateItem from './QuickCreateItem';
import UserStoryAssigneeSelector from './UserStoryAssigneeSelector';

interface SubtaskListProps {
    /** Parent Story, Bug or Spike. Tasks cannot have subtasks and render nothing. */
    parent: WorkItemDto;
}

const PRIORITY_LABELS: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };

/**
 * Builds the full update payload for a subtask. `labelIds` is intentionally
 * omitted so the backend keeps the existing labels, and `sprintId` is cleared
 * because child Tasks never live in a sprint.
 */
export function buildSubtaskUpdateDto(
    subtask: WorkItemDto,
    patch: Partial<UpdateWorkItemRequestDto>
): UpdateWorkItemRequestDto {
    return {
        title: subtask.title,
        description: subtask.description,
        acceptanceCriteria: subtask.acceptanceCriteria,
        storyPoints: subtask.storyPoints,
        priority: subtask.priority,
        projectId: subtask.projectId,
        statusId: subtask.statusId,
        parentId: subtask.parentId,
        sprintId: undefined,
        assignedTo: subtask.assignedTo,
        concurrencyVersion: subtask.concurrencyVersion,
        ...patch,
    };
}

export const isSubtaskDone = (subtask: WorkItemDto): boolean =>
    subtask.statusId === WorkItemStatus.Done || subtask.statusName?.toLowerCase() === 'done';

/**
 * Subtasks of a Story/Bug/Spike: quick creation, progress, inline status and
 * assignee editing, and deletion. Used both on the work item detail page and
 * inside the expanded backlog card.
 */
export default function SubtaskList({ parent }: SubtaskListProps) {
    const { hasScope } = usePermission();
    const canCreate = hasScope('workitems:create');
    const canUpdate = hasScope('workitems:update');
    const canDelete = hasScope('workitems:delete');

    const queryClient = useQueryClient();
    const { data: subtasks = [], isLoading } = useSubtasks(parent.id, { enabled: parent.type !== WorkItemType.Task });
    const { options: statusOptions } = useWorkItemStatuses();
    const { data: projectUsers = [] } = useProjectUsers(parent.projectId);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [assignee, setAssignee] = useState<UserSearchResult | null>(null);
    const [isAssigneeEdited, setIsAssigneeEdited] = useState(false);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);
    const [pendingStatusId, setPendingStatusId] = useState<number | null>(null);

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['workitem-subtasks', parent.id] });
        queryClient.invalidateQueries({ queryKey: ['backlog-items', parent.projectId] });
        queryClient.invalidateQueries({ queryKey: ['workitem', parent.id] });
    };

    const { update } = useUpdateWorkItem({ onSuccess: refresh });
    const { remove, isLoading: isDeleting } = useDeleteWorkItem({ onSuccess: refresh });

    if (parent.type === WorkItemType.Task) return null;

    const total = subtasks.length;
    const done = subtasks.filter(isSubtaskDone).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    const handleStatusChange = async (subtask: WorkItemDto, statusId: number) => {
        if (statusId === subtask.statusId) return;
        setPendingStatusId(subtask.id);
        try {
            await update(subtask.id, buildSubtaskUpdateDto(subtask, { statusId }));
        } finally {
            setPendingStatusId(null);
        }
    };

    /**
     * The subtask only stores the assignee's Keycloak id. Until the inline
     * editor is actually used, the original id is preserved on save even if
     * the user is not part of the project team.
     */
    const startEdit = (subtask: WorkItemDto) => {
        setConfirmingId(null);
        setAssignee(projectUsers.find(member => member.id === subtask.assignedTo) ?? null);
        setIsAssigneeEdited(false);
        setEditingId(subtask.id);
    };

    const saveAssignee = async (subtask: WorkItemDto) => {
        await update(subtask.id, buildSubtaskUpdateDto(subtask, {
            assignedTo: isAssigneeEdited ? assignee?.id : subtask.assignedTo,
        }));
        setEditingId(null);
    };

    const handleDelete = async (subtask: WorkItemDto) => {
        setEditingId(null);
        await remove(subtask.id, subtask.title);
        setConfirmingId(null);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-slate-500">
                    <CheckSquare size={14} /> Subtasks
                    <span className="text-xs font-semibold text-muted-foreground normal-case tracking-normal">
                        {done}/{total}
                    </span>
                </h2>
                {total > 0 && (
                    <div className="flex items-center gap-2">
                        <BarChart3 size={13} className="text-muted-foreground" aria-hidden="true" />
                        <div
                            role="progressbar"
                            aria-valuenow={percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Subtask progress"
                            className="h-1.5 w-28 overflow-hidden rounded-full bg-muted"
                        >
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">{percent}%</span>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                    <Loader2 size={14} className="animate-spin" /> Loading subtasks...
                </div>
            ) : total === 0 ? (
                <p className="text-sm italic text-muted-foreground">No subtasks yet.</p>
            ) : (
                <ul className="space-y-2">
                    {subtasks.map(subtask => {
                        const statusLabel =
                            WORK_ITEM_STATUS_LABELS[subtask.statusId as WorkItemStatus] ||
                            subtask.statusName ||
                            'To Do';
                        const isDone = isSubtaskDone(subtask);

                        return (
                            <li key={subtask.id} className="rounded-lg border border-border/60 bg-background/60">
                                <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                                    <span title={statusLabel} className="shrink-0">
                                        {getStatusIcon(statusLabel as Status)}
                                    </span>

                                    <Link
                                        href={`/workitems/${subtask.id}`}
                                        className={`min-w-0 flex-1 truncate text-sm font-medium hover:text-primary hover:underline underline-offset-2 ${isDone ? 'text-muted-foreground line-through' : ''}`}
                                    >
                                        {subtask.title}
                                    </Link>

                                    <select
                                        value={subtask.statusId}
                                        onChange={e => handleStatusChange(subtask, Number(e.target.value))}
                                        disabled={!canUpdate || pendingStatusId === subtask.id}
                                        aria-label={`Status for ${subtask.title}`}
                                        className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                                    >
                                        {statusOptions.map(opt => (
                                            <option key={opt.id} value={opt.id}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>

                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getEpicPriorityColor(subtask.priority)}`}>
                                        {PRIORITY_LABELS[subtask.priority] || 'Medium'}
                                    </span>

                                    <UserAvatar
                                        userId={subtask.assignedTo}
                                        projectId={parent.projectId}
                                        size="sm"
                                    />

                                    {canUpdate && (
                                        <button
                                            type="button"
                                            onClick={() => (editingId === subtask.id ? setEditingId(null) : startEdit(subtask))}
                                            aria-label={`Edit assignee for ${subtask.title}`}
                                            aria-expanded={editingId === subtask.id}
                                            className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                                        >
                                            <Pencil size={13} />
                                        </button>
                                    )}

                                    {canDelete && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingId(null);
                                                setConfirmingId(confirmingId === subtask.id ? null : subtask.id);
                                            }}
                                            aria-label={`Delete ${subtask.title}`}
                                            aria-expanded={confirmingId === subtask.id}
                                            className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-accent transition-colors"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>

                                {editingId === subtask.id && (
                                    <div className="border-t border-border/60 px-3 py-3">
                                        <UserStoryAssigneeSelector
                                            assignedUser={assignee}
                                            onAssign={user => {
                                                setIsAssigneeEdited(true);
                                                setAssignee(user);
                                            }}
                                            onRemove={() => {
                                                setIsAssigneeEdited(true);
                                                setAssignee(null);
                                            }}
                                        />
                                        <div className="mt-2 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-accent transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => saveAssignee(subtask)}
                                                className="px-3 py-1.5 text-xs font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {confirmingId === subtask.id && (
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-red-50/50 px-3 py-2 dark:bg-red-900/10">
                                        <span className="text-xs text-red-600 dark:text-red-400">
                                            Delete &ldquo;{subtask.title}&rdquo;?
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setConfirmingId(null)}
                                                className="px-3 py-1 text-xs font-medium rounded-md border border-border hover:bg-accent transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(subtask)}
                                                disabled={isDeleting}
                                                className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                                            >
                                                {isDeleting && <Loader2 size={12} className="animate-spin" />}
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {canCreate && (
                <QuickCreateItem
                    projectId={parent.projectId}
                    parentId={parent.id}
                    type={WorkItemType.Task}
                    statusId={WorkItemStatus.ToDo}
                    placeholder="Add a subtask..."
                    onCreated={refresh}
                />
            )}
        </div>
    );
}
