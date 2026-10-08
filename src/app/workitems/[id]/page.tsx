'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { SkeletonCard } from '@/components/ui';
import { UpdateWorkItemRequestDto, WorkItemDto } from '@/domain/entities/WorkItem';
import {
    WORK_ITEM_STATUS_LABELS,
    WORK_ITEM_TYPE_LABELS,
    WorkItemStatus,
    WorkItemType,
} from '@/domain/types';
import { getEpicPriorityColor } from '@/lib/utils/colors';
import { usePermission } from '@/features/auth/hooks/usePermission';
import { useWorkItem } from '@/features/backlog/hooks/useWorkItem';
import { useSprints } from '@/features/backlog/hooks/useSprints';
import { useEpicsByProject } from '@/features/backlog/hooks/useEpicsByProject';
import { useUpdateWorkItem } from '@/features/backlog/hooks/useUpdateWorkItem';
import WorkItemForm from '@/features/backlog/components/WorkItemForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

const STATUS_BADGES: Record<number, string> = {
    [WorkItemStatus.Backlog]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    [WorkItemStatus.ToDo]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    [WorkItemStatus.InProgress]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    [WorkItemStatus.InReview]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    [WorkItemStatus.Testing]: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    [WorkItemStatus.Deploying]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    [WorkItemStatus.ReadyForTesting]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    [WorkItemStatus.Done]: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export default function WorkItemDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const workItemId = parseInt(id, 10);
    const router = useRouter();
    const queryClient = useQueryClient();
    const { hasScope } = usePermission();
    const canUpdate = hasScope('workitems:update');

    const { data: workItem, isLoading, isError } = useWorkItem(workItemId);
    const projectId = workItem?.projectId;
    const { data: sprints = [] } = useSprints(projectId);
    const { data: epics = [] } = useEpicsByProject(projectId);

    const { update, isLoading: isSaving } = useUpdateWorkItem({
        onSuccess: (item: WorkItemDto) => {
            queryClient.setQueryData(['workitem', workItemId], item);
            queryClient.invalidateQueries({ queryKey: ['workitem', workItemId] });
            if (item.projectId) {
                queryClient.invalidateQueries({ queryKey: ['backlog-items', item.projectId] });
                queryClient.invalidateQueries({ queryKey: ['sprints', item.projectId] });
            }
        },
    });

    const handleBack = () => router.push('/backlog');

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
        if (!workItem) return;

        const dto: UpdateWorkItemRequestDto = {
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
            concurrencyVersion: workItem.concurrencyVersion,
        };

        await update(workItem.id, dto);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <SkeletonCard className="mb-6" />
                <SkeletonCard className="mb-6" />
                <SkeletonCard />
            </div>
        );
    }

    if (isError || !workItem) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <Link
                    href="/backlog"
                    className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors w-fit"
                    aria-label="Back to backlog"
                >
                    <div className="p-1 rounded-md bg-transparent group-hover:bg-primary/10 transition-colors">
                        <ArrowLeft size={16} />
                    </div>
                    Return to Backlog
                </Link>
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                    <AlertTriangle size={24} className="shrink-0" />
                    <div>
                        <h3 className="font-bold">Work item not found</h3>
                        <p className="text-sm">It may have been deleted, or the id is not valid.</p>
                    </div>
                </div>
            </div>
        );
    }

    const typeLabel = WORK_ITEM_TYPE_LABELS[workItem.type as WorkItemType] || 'Work Item';
    const statusLabel = WORK_ITEM_STATUS_LABELS[workItem.statusId as WorkItemStatus] || workItem.statusName;
    const priorityLabel =
        workItem.priority === 1 ? 'Low' : workItem.priority === 2 ? 'Medium' : workItem.priority === 3 ? 'High' : 'Critical';

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Link
                href="/backlog"
                className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors w-fit"
                aria-label="Back to backlog"
            >
                <div className="p-1 rounded-md bg-transparent group-hover:bg-primary/10 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                Return to Backlog
            </Link>

            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {typeLabel}
                    </span>
                    <span
                        className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${STATUS_BADGES[workItem.statusId] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                    >
                        {statusLabel}
                    </span>
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${getEpicPriorityColor(workItem.priority)}`}>
                        {priorityLabel}
                    </span>
                    {typeof workItem.storyPoints === 'number' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-accent text-muted-foreground">
                            {workItem.storyPoints} pts
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground font-mono">WI-{workItem.id}</span>
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight break-words">{workItem.title}</h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-sm text-muted-foreground">
                    <span>{workItem.projectName || `Project #${workItem.projectId}`}</span>
                    <span aria-hidden="true">·</span>
                    <span>{workItem.sprintName || 'Backlog / No sprint'}</span>
                    {workItem.parentTitle && (
                        <>
                            <span aria-hidden="true">·</span>
                            <span>{workItem.parentTitle}</span>
                        </>
                    )}
                </div>
            </header>

            {/* Body */}
            <section className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
                {!canUpdate && (
                    <p className="text-sm text-muted-foreground mb-6 border border-border rounded-lg px-4 py-3 bg-accent/30">
                        You have read-only access to this work item.
                    </p>
                )}

                {canUpdate ? (
                    <WorkItemForm
                        key={workItem.id}
                        embedded
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
                        isSprintReadOnly={false}
                        isLoading={isSaving}
                        showTypeSelector={false}
                        autoFocus={false}
                        defaultType={workItem.type as WorkItemType}
                        onSubmit={handleSubmit}
                        onCancel={handleBack}
                        submitLabel="Save Changes"
                    />
                ) : (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Description</h2>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                                {workItem.description || <span className="italic text-muted-foreground">No description provided.</span>}
                            </p>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">
                                Acceptance Criteria
                            </h2>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                                {workItem.acceptanceCriteria || (
                                    <span className="italic text-muted-foreground">No acceptance criteria defined.</span>
                                )}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
