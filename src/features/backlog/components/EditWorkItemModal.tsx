'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useUpdateWorkItem } from '../hooks/useUpdateWorkItem';
import { WorkItemDto, UpdateWorkItemRequestDto } from '@/domain/entities/WorkItem';
import { Sprint } from '@/domain/entities/Sprint';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { WORK_ITEM_TYPE_LABELS, WorkItemType } from '@/domain/types';
import WorkItemForm from './WorkItemForm';

interface EditWorkItemModalProps {
    workItem: WorkItemDto;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: (workItem: WorkItemDto) => void;
    sprints?: Sprint[];
    epics?: EpicResponseDto[];
}

export default function EditWorkItemModal({
    workItem,
    isOpen,
    onClose,
    onUpdated,
    sprints = [],
    epics = [],
}: EditWorkItemModalProps) {
    const { update, isLoading } = useUpdateWorkItem({
        onSuccess: (updatedWorkItem) => {
            onUpdated(updatedWorkItem);
            onClose();
        },
    });

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

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
        const dto: UpdateWorkItemRequestDto = {
            title: data.title,
            description: data.description,
            storyPoints: data.storyPoints,
            statusId: data.statusId,
            acceptanceCriteria: data.acceptanceCriteria,
            sprintId: data.type === WorkItemType.Task ? undefined : data.sprintId,
            projectId: data.projectId,
            priority: data.priority,
            assignedTo: data.assignedTo,
            labelIds: data.labelIds,
            concurrencyVersion: workItem.concurrencyVersion,
        };

        await update(workItem.id, dto);
    };

    const typeLabel = WORK_ITEM_TYPE_LABELS[workItem.type as WorkItemType] || 'Work Item';

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto w-full max-w-lg bg-background rounded-xl shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <div>
                            <h2 className="text-base font-bold">Edit {typeLabel}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{workItem.title}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="px-6 py-5">
                        <WorkItemForm
                            initialData={{
                                title: workItem.title,
                                description: workItem.description,
                                storyPoints: workItem.storyPoints,
                                statusId: workItem.statusId,
                                acceptanceCriteria: workItem.acceptanceCriteria,
                                sprintId: workItem.sprintId,
                                parentId: workItem.parentId,
                                type: workItem.type as WorkItemType,
                                assignedTo: workItem.assignedTo,
                                labelIds: workItem.labels?.map(l => l.id),
                            }}
                            projectId={workItem.projectId}
                            sprints={sprints}
                            epics={epics}
                            isSprintReadOnly={!!workItem.sprintId}
                            isLoading={isLoading}
                            showTypeSelector={true}
                            defaultType={workItem.type as WorkItemType}
                            onSubmit={handleSubmit}
                            onCancel={onClose}
                            submitLabel="Save Changes"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
