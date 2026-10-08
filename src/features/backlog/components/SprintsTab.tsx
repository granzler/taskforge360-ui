'use client';

import { useState, memo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    useDroppable,
    useDraggable,
} from '@dnd-kit/core';
import { ChevronDown, ChevronRight, MoreVertical, Trash2, Loader2, GripVertical } from 'lucide-react';
import { SubTask, Epic } from '@/domain/entities/Project';
import { WorkItemDto } from '@/domain/entities/WorkItem';
import { UpdateWorkItemRequestDto } from '@/domain/entities/WorkItem';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { Sprint } from '@/domain/entities/Sprint';
import { workItemService } from '@/infrastructure/services/workItemService';
import { sprintService } from '@/infrastructure/services/sprintService';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';
import WorkItemCard, { type WorkItemCardProps } from './WorkItemCard';
import QuickCreateItem from './QuickCreateItem';
import CreateWorkItemPanel, { type CreateWorkItemTarget, focusCreateTrigger } from './CreateWorkItemPanel';

type EpicItem = Epic | EpicResponseDto;

interface SprintWithStories extends Sprint {
    workItems: WorkItemDto[];
    totalStoryPoints: number;
}

interface SprintsTabProps {
    projectId: number;
    projectName: string;
    sprints: Sprint[];
    workItems: WorkItemDto[];                       // renamed from userStories
    tasks: SubTask[];                                // kept for backward compat
    epics: EpicItem[];
    onSprintDeleted: (sprintId: number) => void;
    onWorkItemCreated: (workItemId: number) => void;  // renamed from onStoryCreated
    onWorkItemUpdated?: (workItem: WorkItemDto) => void; // renamed from onStoryUpdated
    canDeleteSprint?: boolean;
    canCreateStory?: boolean;
    canUpdateStory?: boolean;
    /** Shared single-open inline create form state (owned by the backlog page). */
    creatingIn: CreateWorkItemTarget | null;
    setCreatingIn: React.Dispatch<React.SetStateAction<CreateWorkItemTarget | null>>;
}

function DraggableWorkItem({ workItem, ...rest }: { workItem: WorkItemDto } & Pick<WorkItemCardProps, 'isExpanded' | 'onToggle' | 'tasks' | 'epic' | 'canUpdateStory'>) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `workitem-${workItem.id}`,
        data: { workItem },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.4 : 1,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <button
                {...listeners}
                {...attributes}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-primary cursor-grab active:cursor-grabbing z-10"
                tabIndex={-1}
            >
                <GripVertical size={14} />
            </button>
            <div className="pl-0">
                <WorkItemCard workItem={workItem} {...rest} />
            </div>
        </div>
    );
}

function DroppableZone({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`transition-colors ${isOver ? 'bg-primary/5 border-primary/30' : ''} ${className || ''}`}
        >
            {children}
        </div>
    );
}

const SprintsTab = memo(function SprintsTab({
    projectId,
    projectName,
    sprints,
    workItems,
    tasks,
    epics,
    onSprintDeleted,
    onWorkItemCreated,
    onWorkItemUpdated,
    canDeleteSprint = false,
    canCreateStory = false,
    canUpdateStory = false,
    creatingIn,
    setCreatingIn,
}: SprintsTabProps) {
    const [expandedSprints, setExpandedSprints] = useState<number[]>([1, 2]);
    const [expandedWorkItems, setExpandedWorkItems] = useState<number[]>([]);
    const [activeDragWorkItem, setActiveDragWorkItem] = useState<WorkItemDto | null>(null);

    const [menuOpenSprintId, setMenuOpenSprintId] = useState<number | null>(null);
    const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const toggleSprint = (id: number) => {
        setExpandedSprints(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleWorkItem = (id: number) => {
        setExpandedWorkItems(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const closeCreatePanel = (triggerKey: string) => {
        setCreatingIn(null);
        focusCreateTrigger(triggerKey);
    };

    /** Quick creation keeps any open full form untouched. */
    const handleQuickCreated = (workItem: WorkItemDto) => {
        onWorkItemCreated(workItem.id);
    };

    const workItemsBySprint: SprintWithStories[] = sprints.map(sprint => {
        const sprintItems = workItems.filter(wi => wi.sprintId === sprint.id);
        const totalStoryPoints = sprintItems.reduce((sum, wi) => sum + (wi.storyPoints || 0), 0);
        return {
            ...sprint,
            workItems: sprintItems,
            totalStoryPoints
        };
    });

    const unassignedWorkItems = workItems.filter(wi => !wi.sprintId);
    const unassignedStoryPoints = unassignedWorkItems.reduce((sum, wi) => sum + (wi.storyPoints || 0), 0);

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

    const handleDragStart = (event: DragStartEvent) => {
        const workItem = event.active.data.current?.workItem as WorkItemDto;
        if (workItem) setActiveDragWorkItem(workItem);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveDragWorkItem(null);
        const { active, over } = event;
        if (!over || !active) return;

        const workItem = active.data.current?.workItem as WorkItemDto;
        if (!workItem) return;

        const targetId = over.id as string;
        let newSprintId: number | undefined;

        if (targetId === 'backlog-zone') {
            newSprintId = undefined;
        } else if (targetId.startsWith('sprint-')) {
            newSprintId = parseInt(targetId.replace('sprint-', ''), 10);
        } else {
            return;
        }

        if (newSprintId === workItem.sprintId) return;

        try {
            const dto: UpdateWorkItemRequestDto = {
                title: workItem.title,
                description: workItem.description,
                statusId: workItem.statusId,
                priority: workItem.priority,
                projectId: workItem.projectId,
                storyPoints: workItem.storyPoints,
                acceptanceCriteria: workItem.acceptanceCriteria,
                sprintId: newSprintId,
                assignedTo: workItem.assignedTo,
                labelIds: workItem.labels?.map(l => l.id),
                concurrencyVersion: workItem.concurrencyVersion,
            };

            const result = await workItemService.update(workItem.id, dto);

            if (notifyResult(result, { success: `Item moved to ${newSprintId ? sprints.find(s => s.id === newSprintId)?.name || 'sprint' : 'backlog'}!` })) {
                onWorkItemUpdated?.(result.data);
            }
        } catch (err) {
            console.error('Failed to move work item:', err);
            toast.error('Failed to move work item.');
        }
    };

    const handleDeleteSprint = async () => {
        if (!sprintToDelete) return;

        setIsDeleting(true);
        try {
            const result = await sprintService.delete(sprintToDelete.id);
            if (notifyResult(result, { success: `Sprint "${sprintToDelete.name}" deleted successfully.` })) {
                onSprintDeleted(sprintToDelete.id);
                setSprintToDelete(null);
            }
        } catch (err) {
            console.error('Failed to delete sprint:', err);
            toast.error('An unexpected error occurred while deleting the sprint.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-6">
                {workItemsBySprint.map(sprint => (
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
                                    <p className="text-[10px] text-muted-foreground">{sprint.workItems.length} items</p>
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
                            <DroppableZone id={`sprint-${sprint.id}`} className="p-4 border-t border-border bg-background/20 rounded-b-xl min-h-[100px]">
                                {sprint.workItems.length > 0 ? (
                                    sprint.workItems.map((workItem, idx) => (
                                        <DraggableWorkItem
                                            key={`${workItem.id}-${idx}`}
                                            workItem={workItem}
                                            isExpanded={expandedWorkItems.includes(workItem.id)}
                                            onToggle={toggleWorkItem}
                                            tasks={[]}  // Tasks loaded separately or via parent context
                                            epic={epics.find(e => e.id === workItem.parentId)}
                                            canUpdateStory={canUpdateStory}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500 border-2 border-dashed border-border rounded-lg text-sm">
                                        No work items in this sprint. Drag here to add.
                                    </div>
                                )}
                                {canCreateStory && (
                                    <div className="mt-4 space-y-3">
                                        <QuickCreateItem
                                            projectId={projectId}
                                            sprintId={sprint.id}
                                            label={sprint.name}
                                            onCreated={handleQuickCreated}
                                            onAdvanced={() => setCreatingIn({ scope: 'sprint', id: sprint.id })}
                                            advancedActive={creatingIn?.scope === 'sprint' && creatingIn.id === sprint.id}
                                            triggerKey={`sprint-${sprint.id}`}
                                        />
                                        {creatingIn?.scope === 'sprint' && creatingIn.id === sprint.id && (
                                            <CreateWorkItemPanel
                                                projectId={projectId}
                                                sprints={sprints}
                                                epics={epics.filter((e): e is EpicResponseDto => 'title' in e)}
                                                sprintId={sprint.id}
                                                subtitle={`${sprint.name} · ${projectName}`}
                                                onClose={() => closeCreatePanel(`sprint-${sprint.id}`)}
                                                onCreated={(workItem) => {
                                                    setCreatingIn(null);
                                                    focusCreateTrigger(`sprint-${sprint.id}`);
                                                    onWorkItemCreated(workItem.id);
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                            </DroppableZone>
                        )}
                    </div>
                ))}

                {/* Backlog / Unassigned Work Items */}
                <div className="relative pt-4">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-background px-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Backlog / Unassigned
                            {unassignedWorkItems.length > 0 && (
                                <span className="ml-2 text-muted-foreground font-normal">
                                    ({unassignedStoryPoints} pts)
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                <DroppableZone id="backlog-zone" className="p-4 rounded-xl border border-border bg-background shadow-sm min-h-[100px]">
                    {unassignedWorkItems.length > 0 ? (
                        unassignedWorkItems.map((workItem, idx) => (
                            <DraggableWorkItem
                                key={`unassigned-${workItem.id}-${idx}`}
                                workItem={workItem}
                                isExpanded={expandedWorkItems.includes(workItem.id)}
                                onToggle={toggleWorkItem}
                                tasks={[]}
                                epic={epics.find(e => e.id === workItem.parentId)}
                                canUpdateStory={canUpdateStory}
                            />
                        ))
                    ) : (
                        <div className="text-center py-6 text-slate-500 text-sm italic">
                            No unassigned items in backlog.
                        </div>
                    )}

                    {canCreateStory && (
                        <div className="mt-4 space-y-3">
                            <QuickCreateItem
                                projectId={projectId}
                                label="the backlog"
                                onCreated={handleQuickCreated}
                                onAdvanced={() => setCreatingIn({ scope: 'backlog' })}
                                advancedActive={creatingIn?.scope === 'backlog'}
                                triggerKey="backlog"
                            />
                            {creatingIn?.scope === 'backlog' && (
                                <CreateWorkItemPanel
                                    projectId={projectId}
                                    sprints={sprints}
                                    epics={epics.filter((e): e is EpicResponseDto => 'title' in e)}
                                    subtitle={projectName}
                                    onClose={() => closeCreatePanel('backlog')}
                                    onCreated={(workItem) => {
                                        setCreatingIn(null);
                                        focusCreateTrigger('backlog');
                                        onWorkItemCreated(workItem.id);
                                    }}
                                />
                            )}
                        </div>
                    )}
                </DroppableZone>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeDragWorkItem ? (
                    <div className="p-3 bg-background border border-primary/30 rounded-xl shadow-xl opacity-90">
                        <p className="font-bold text-sm">{activeDragWorkItem.title}</p>
                    </div>
                ) : null}
            </DragOverlay>

            {/* Delete Confirmation Modal */}
            {sprintToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="w-full max-w-sm bg-background border border-border rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/20">
                                <Trash2 size={24} />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">Delete Sprint?</h2>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Are you sure you want to delete the sprint <strong>&quot;{sprintToDelete.name}&quot;</strong>? This action cannot be undone. Associated work items will be moved to the backlog.
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
        </DndContext>
    );
});

export default SprintsTab;
