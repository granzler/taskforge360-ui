'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Target, User, Plus, Loader2, Check, X, Layers } from 'lucide-react';
import { Epic, SubTask } from '@/domain/entities/Project';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { WorkItemDto } from '@/domain/entities/WorkItem';
import { CreateWorkItemRequestDto } from '@/domain/entities/WorkItem';
import { workItemService } from '@/infrastructure/services/workItemService';
import { getEpicPriorityColor, getStatusIcon, getPriorityColor } from '@/lib/utils/colors';
import { WORK_ITEM_STATUS_LABELS, WorkItemStatus, Status, WorkItemType, WORK_ITEM_TYPE_LABELS } from '@/domain/types';
import { LabelBadge } from '@/features/labels/components/LabelBadge';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';

interface WorkItemCardProps {
    workItem: WorkItemDto;
    isExpanded: boolean;
    onToggle: (id: number) => void;
    tasks?: WorkItemDto[];                     // Child tasks (replaces subtasks)
    epic?: Epic | EpicResponseDto;
    canUpdateStory?: boolean;
    onTaskCreated?: (task: WorkItemDto) => void;
}

const WorkItemCard = memo(function WorkItemCard({
    workItem,
    isExpanded,
    onToggle,
    tasks = [],
    epic,
    canUpdateStory = false,
    onTaskCreated,
}: WorkItemCardProps) {
    const [showAddTask, setShowAddTask] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [isCreatingTask, setIsCreatingTask] = useState(false);

    const typeLabel = WORK_ITEM_TYPE_LABELS[workItem.type as WorkItemType] || 'Item';
    const isTask = workItem.type === WorkItemType.Task;

    const handleAddTask = async () => {
        if (!taskTitle.trim()) return;

        setIsCreatingTask(true);
        try {
            const dto: CreateWorkItemRequestDto = {
                type: WorkItemType.Task,
                title: taskTitle.trim(),
                parentId: workItem.id,
                projectId: workItem.projectId,
                priority: 2,
                statusId: WorkItemStatus.ToDo,
                concurrencyVersion: 1,
            };

            const result = await workItemService.create(dto);

            if (notifyResult(result, { success: 'Task added!' })) {
                setTaskTitle('');
                setShowAddTask(false);
                onTaskCreated?.(result.data);
            }
        } catch (err) {
            console.error('Failed to create task:', err);
            toast.error('Could not create task. Please try again.');
        } finally {
            setIsCreatingTask(false);
        }
    };

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
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-border" role="img" aria-label={workItem.assignedTo ? `Assigned to ${workItem.assignedTo}` : 'Unassigned'} title={workItem.assignedTo || 'Unassigned'}>
                        {workItem.assignedTo ? workItem.assignedTo.charAt(0).toUpperCase() : <User size={14} className="text-slate-400" />}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="ml-10 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {/* Child Tasks */}
                    {tasks.length > 0 ? (
                        tasks.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-2 rounded-md bg-accent/20 border border-border/30 text-xs">
                                <div className="flex items-center gap-2">
                                    <Layers size={10} className="text-slate-400" />
                                    <span>{t.title}</span>
                                    <span className="text-[9px] uppercase font-semibold px-1 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                        Task
                                    </span>
                                </div>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${getEpicPriorityColor(t.priority)}`}>
                                    {t.priority === 1 ? 'Low' : t.priority === 2 ? 'Medium' : t.priority === 3 ? 'High' : 'Critical'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-[10px] text-slate-500 italic py-1">No tasks defined.</div>
                    )}

                    {/* Inline Add Task */}
                    {showAddTask ? (
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="text"
                                value={taskTitle}
                                onChange={e => setTaskTitle(e.target.value)}
                                placeholder="Enter task title..."
                                className="flex-1 px-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                                autoFocus
                                onKeyDown={e => {
                                    if (isCreatingTask) return;
                                    if (e.key === 'Enter') handleAddTask();
                                    if (e.key === 'Escape') {
                                        setShowAddTask(false);
                                        setTaskTitle('');
                                    }
                                }}
                                disabled={isCreatingTask}
                            />
                            <button
                                onClick={handleAddTask}
                                disabled={isCreatingTask || !taskTitle.trim()}
                                className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-40"
                            >
                                {isCreatingTask ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddTask(false);
                                    setTaskTitle('');
                                }}
                                disabled={isCreatingTask}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-accent rounded-lg transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        !isTask && canUpdateStory && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddTask(true);
                                }}
                                className="flex items-center gap-1.5 text-[10px] font-medium text-primary hover:underline mt-1 pl-1"
                            >
                                <Plus size={10} /> Add Task
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
});

export type { WorkItemCardProps };
export default WorkItemCard;
