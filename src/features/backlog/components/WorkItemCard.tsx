'use client';

import { memo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Target } from 'lucide-react';
import { Epic } from '@/domain/entities/Project';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { WorkItemDto } from '@/domain/entities/WorkItem';
import { getEpicPriorityColor, getStatusIcon } from '@/lib/utils/colors';
import { WORK_ITEM_STATUS_LABELS, Status, WorkItemStatus, WorkItemType, WORK_ITEM_TYPE_LABELS } from '@/domain/types';
import { LabelBadge } from '@/features/labels/components/LabelBadge';
import UserAvatar from '@/features/projects/components/UserAvatar';
import SubtaskList from './SubtaskList';

interface WorkItemCardProps {
    workItem: WorkItemDto;
    isExpanded: boolean;
    onToggle: (id: number) => void;
    epic?: Epic | EpicResponseDto;
}

const WorkItemCard = memo(function WorkItemCard({
    workItem,
    isExpanded,
    onToggle,
    epic,
}: WorkItemCardProps) {
    const typeLabel = WORK_ITEM_TYPE_LABELS[workItem.type as WorkItemType] || 'Item';
    const isTask = workItem.type === WorkItemType.Task;

    return (
        <div className="mb-2 group">
            <div
                className={`flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/5 transition-all cursor-pointer ${isExpanded ? 'ring-1 ring-primary/20' : ''}`}
                onClick={() => onToggle(workItem.id)}
            >
                <div className="flex items-center gap-3 flex-1">
                    <div className="text-slate-400 group-hover:text-primary transition-colors">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                    {getStatusIcon((WORK_ITEM_STATUS_LABELS[workItem.statusId as WorkItemStatus] || 'To Do') as Status)}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <Link
                            href={`/workitems/${workItem.id}`}
                            title={workItem.title}
                            onClick={e => e.stopPropagation()}
                            className="font-medium text-sm truncate hover:text-primary hover:underline underline-offset-2 transition-colors"
                        >
                            {workItem.title}
                        </Link>
                        <div className="flex flex-wrap gap-1 items-center">
                            {!isTask && (
                                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                    {typeLabel}
                                </span>
                            )}
                            {workItem.labels && workItem.labels.length > 0 && (
                                <>
                                    {workItem.labels.slice(0, 3).map(label => (
                                        <LabelBadge key={label.id} tagName={label.tagName} className="text-[10px]" />
                                    ))}
                                    {workItem.labels.length > 3 && (
                                        <span className="text-[10px] text-slate-400">+{workItem.labels.length - 3}</span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    {epic && (
                        <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 shrink-0">
                            {epic.title}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getEpicPriorityColor(workItem.priority)}`}>
                        {workItem.priority === 1 ? 'Low' : workItem.priority === 2 ? 'Medium' : workItem.priority === 3 ? 'High' : 'Critical'}
                    </span>
                    {!isTask && (
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <Target size={12} />
                            <span>{workItem.storyPoints} pts</span>
                        </div>
                    )}
                    <UserAvatar
                        userId={workItem.assignedTo}
                        projectId={workItem.projectId}
                        size="md"
                    />
                </div>
            </div>

            {isExpanded && !isTask && (
                <div className="ml-10 mt-2 animate-in slide-in-from-top-2 duration-200">
                    <SubtaskList parent={workItem} />
                </div>
            )}
        </div>
    );
});

export type { WorkItemCardProps };
export default WorkItemCard;
