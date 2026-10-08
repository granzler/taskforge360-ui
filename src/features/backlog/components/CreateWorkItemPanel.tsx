'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { CreateWorkItemRequestDto, WorkItemDto } from '@/domain/entities/WorkItem';
import { Sprint } from '@/domain/entities/Sprint';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { WorkItemStatus, WorkItemType } from '@/domain/types';
import { useCreateWorkItem } from '../hooks/useCreateWorkItem';
import WorkItemForm from './WorkItemForm';

/**
 * Where the inline create form is open. Kept at page level so only a single
 * panel can be open at any time across the backlog, sprints and epics views.
 */
export type CreateWorkItemTarget =
    | { scope: 'top' }
    | { scope: 'backlog' }
    | { scope: 'sprint'; id: number }
    | { scope: 'epic'; id: number };

/** Restores keyboard focus to the trigger that opened a create panel. */
export function focusCreateTrigger(key: string) {
    requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`[data-create-trigger="${key}"]`)?.focus();
    });
}

interface CreateWorkItemPanelProps {
    projectId: number;
    sprints?: Sprint[];
    epics?: EpicResponseDto[];
    sprintId?: number;
    epicId?: number;
    subtitle?: string;
    onClose: () => void;
    onCreated: (workItem: WorkItemDto) => void;
}

/**
 * Full creation form rendered inline in the page (no modal), mirroring the
 * quick-create row placed right above it.
 */
export default function CreateWorkItemPanel({
    projectId,
    sprints = [],
    epics = [],
    sprintId,
    epicId,
    subtitle,
    onClose,
    onCreated,
}: CreateWorkItemPanelProps) {
    const { create, isLoading } = useCreateWorkItem({
        onSuccess: (workItem) => onCreated(workItem),
    });

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleSubmit = async (data: {
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
    }) => {
        const dto: CreateWorkItemRequestDto = {
            type: data.type,
            title: data.title,
            description: data.description,
            storyPoints: data.storyPoints,
            statusId: data.statusId,
            acceptanceCriteria: data.acceptanceCriteria,
            sprintId: data.type === WorkItemType.Task ? undefined : data.sprintId,
            parentId: data.parentId,
            projectId: data.projectId,
            priority: data.priority,
            assignedTo: data.assignedTo,
            labelIds: data.labelIds,
            concurrencyVersion: 1,
        };

        await create(dto);
    };

    return (
        <div className="rounded-xl border border-primary/30 bg-card shadow-sm overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-accent/30">
                <div>
                    <h2 className="text-sm font-bold">Create Work Item</h2>
                    {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close create form"
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-background/80 hover:text-foreground transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-4 md:p-6">
                <WorkItemForm
                    embedded
                    initialData={{
                        title: '',
                        statusId: WorkItemStatus.Backlog,
                        sprintId,
                        parentId: epicId,
                    }}
                    projectId={projectId}
                    sprints={sprints}
                    epics={epics}
                    isSprintReadOnly={!!sprintId}
                    isLoading={isLoading}
                    showTypeSelector={true}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    submitLabel="Create Work Item"
                />
            </div>
        </div>
    );
}
