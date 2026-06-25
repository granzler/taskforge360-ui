'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreateWorkItem } from '../hooks/useCreateWorkItem';
import { CreateWorkItemRequestDto } from '@/domain/entities/WorkItem';
import { Sprint } from '@/domain/entities/Sprint';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { WorkItemStatus, WorkItemType, WORK_ITEM_TYPE_LABELS } from '@/domain/types';
import WorkItemForm from './WorkItemForm';

interface CreateWorkItemModalProps {
    projectId: number;
    projectName: string;
    sprints?: Sprint[];
    epics?: EpicResponseDto[];
    sprintId?: number;
    epicId?: number;
    defaultType?: WorkItemType;      // For creating a specific type (e.g., Task from story detail)
    onClose: () => void;
    onCreated: (workItemId?: number) => void;
}

export default function CreateWorkItemModal({
    projectId,
    projectName,
    sprints = [],
    epics = [],
    sprintId,
    epicId,
    defaultType = WorkItemType.Story,
    onClose,
    onCreated,
}: CreateWorkItemModalProps) {
    const { create, isLoading } = useCreateWorkItem({
        onSuccess: (item) => {
            onCreated(item.id);
        },
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

    const typeLabel = WORK_ITEM_TYPE_LABELS[defaultType] || 'Work Item';

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
                            <h2 className="text-base font-bold">Create {typeLabel}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{projectName}</p>
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
                                title: '',
                                description: undefined,
                                storyPoints: undefined,
                                statusId: WorkItemStatus.Backlog,
                                acceptanceCriteria: undefined,
                                sprintId: sprintId,
                                parentId: epicId,
                            }}
                            projectId={projectId}
                            sprints={sprints}
                            epics={epics}
                            isSprintReadOnly={!!sprintId}
                            isLoading={isLoading}
                            showTypeSelector={true}
                            defaultType={defaultType}
                            onSubmit={handleSubmit}
                            onCancel={onClose}
                            submitLabel={`Create ${typeLabel}`}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
