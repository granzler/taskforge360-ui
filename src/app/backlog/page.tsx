'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sprint } from '@/domain/entities/Sprint';
import { WorkItemDto } from '@/domain/entities/WorkItem';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { workItemService } from '@/infrastructure/services/workItemService';
import { useProject } from '@/features/projects/context/ProjectContext';
import { useSprints } from '@/features/backlog/hooks/useSprints';
import { useEpicsByProject } from '@/features/backlog/hooks/useEpicsByProject';
import { useBacklogItems } from '@/features/backlog/hooks/useBacklogItems';
import { Layers, Calendar, Plus, FolderOpen } from 'lucide-react';
import { SkeletonCard } from '@/components/ui';
import SprintsTab from '@/features/backlog/components/SprintsTab';
import EpicsTab from '@/features/backlog/components/EpicsTab';
import CreateSprintModal from '@/features/backlog/components/CreateSprintModal';
import CreateWorkItemPanel, { type CreateWorkItemTarget, focusCreateTrigger } from '@/features/backlog/components/CreateWorkItemPanel';
import EpicModal from '@/features/backlog/components/EpicModal';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';
import { usePermission } from '@/features/auth/hooks/usePermission';

export default function BacklogPage() {
    const queryClient = useQueryClient();
    const { hasScope } = usePermission();
    const [activeTab, setActiveTab] = useState<'sprints' | 'epics'>('sprints');
    const { selectedProject } = useProject();
    const projectId = selectedProject?.id;

    const canCreateSprint = hasScope('sprints:create');
    const canDeleteSprint = hasScope('sprints:delete');
    const canCreateStory = hasScope('workitems:create');
    const canUpdateStory = hasScope('workitems:update');
    const canCreateEpic = hasScope('epics:create');
    const canUpdateEpic = hasScope('epics:update');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateEpicModal, setShowCreateEpicModal] = useState(false);
    const [creatingIn, setCreatingIn] = useState<CreateWorkItemTarget | null>(null);
    const [editingEpic, setEditingEpic] = useState<EpicResponseDto | null>(null);

    const { data: sprints = [], isLoading: isLoadingSprints } = useSprints(projectId);
    const { data: epics = [], isLoading: isLoadingEpics } = useEpicsByProject(projectId);
    const { data: workItems = [], isLoading: isLoadingWorkItems } = useBacklogItems(
        projectId,
        sprints.map(s => s.id),
        'story'       // Fetch stories by default; could be configurable
    );

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
        queryClient.invalidateQueries({ queryKey: ['epics', projectId] });
        queryClient.invalidateQueries({ queryKey: ['backlog-items', projectId] });
    };

    const handleSprintCreated = (_sprint: Sprint) => {
        setShowCreateModal(false);
        invalidateAll();
        toast.success(`Sprint created!`);
    };

    const handleSprintDeleted = (_sprintId: number) => {
        invalidateAll();
    };

    const handleWorkItemCreated = (workItemId?: number) => {
        if (workItemId) invalidateAll();
    };

    const handleQuickCreated = (_workItem: WorkItemDto) => {
        invalidateAll();
    };

    const closeTopCreatePanel = () => {
        setCreatingIn(null);
        focusCreateTrigger('top');
    };

    const handleWorkItemUpdated = async (_updatedWorkItem: WorkItemDto) => {
        invalidateAll();
        toast.success('Work item updated!');
    };

    const handleEpicCreated = (_epic: EpicResponseDto) => {
        setShowCreateEpicModal(false);
        invalidateAll();
        toast.success('Epic created!');
    };

    const handleEpicUpdated = (_updatedEpic: EpicResponseDto) => {
        setEditingEpic(null);
        invalidateAll();
        toast.success('Epic updated!');
    };

    const handleLinkStory = async (epicId: number, workItemId: number): Promise<boolean> => {
        try {
            const currentItem = workItems.find(s => s.id === workItemId);
            if (!currentItem) {
                toast.error('Work item not found');
                return false;
            }

            const result = await workItemService.update(workItemId, {
                title: currentItem.title,
                description: currentItem.description,
                statusId: currentItem.statusId,
                priority: currentItem.priority,
                projectId: currentItem.projectId,
                storyPoints: currentItem.storyPoints,
                acceptanceCriteria: currentItem.acceptanceCriteria,
                sprintId: currentItem.sprintId,
                parentId: epicId,
                assignedTo: currentItem.assignedTo,
                labelIds: currentItem.labels?.map(l => l.id),
                concurrencyVersion: currentItem.concurrencyVersion,
            });

            if (notifyResult(result, { success: 'Item linked to epic!' })) {
                invalidateAll();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to link work item:', err);
            return false;
        }
    };

    const isLoading = isLoadingSprints || isLoadingEpics || isLoadingWorkItems;

    const renderSprintsContent = () => {
        if (!selectedProject) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="p-4 rounded-full bg-accent/50">
                        <FolderOpen size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">No project selected</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Select a project from the top menu to view its sprints.
                    </p>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            );
        }

        return (
            <SprintsTab
                projectId={selectedProject.id}
                projectName={selectedProject.name}
                sprints={sprints}
                workItems={workItems}
                tasks={[]}
                epics={epics}
                onSprintDeleted={handleSprintDeleted}
                onWorkItemCreated={handleWorkItemCreated}
                onWorkItemUpdated={handleWorkItemUpdated}
                canDeleteSprint={canDeleteSprint}
                canCreateStory={canCreateStory}
                canUpdateStory={canUpdateStory}
                creatingIn={creatingIn}
                setCreatingIn={setCreatingIn}
            />
        );
    };

    return (
        <>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {selectedProject ? selectedProject.name : 'Project Backlog'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {selectedProject
                                ? `Sprints, epics and work items for ${selectedProject.name}.`
                                : 'Select a project from the top menu to get started.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {canCreateSprint && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                disabled={!selectedProject}
                                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Calendar size={16} />
                                Plan Sprint
                            </button>
                        )}
                        {canCreateStory && (
                            <button
                                data-create-trigger="top"
                                onClick={() => setCreatingIn(prev => (prev?.scope === 'top' ? null : { scope: 'top' }))}
                                disabled={!selectedProject}
                                aria-expanded={creatingIn?.scope === 'top'}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Plus size={18} />
                                Create Item
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl w-fit mb-8 border border-border" role="tablist" aria-label="Backlog views">
                    <button
                        onClick={() => setActiveTab('sprints')}
                        role="tab"
                        aria-selected={activeTab === 'sprints'}
                        aria-controls="tabpanel-sprints"
                        id="tab-sprints"
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-primary/50 focus-visible:outline-offset-2 ${activeTab === 'sprints'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Calendar size={16} />
                        Sprints
                    </button>
                    <button
                        onClick={() => setActiveTab('epics')}
                        role="tab"
                        aria-selected={activeTab === 'epics'}
                        aria-controls="tabpanel-epics"
                        id="tab-epics"
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-primary/50 focus-visible:outline-offset-2 ${activeTab === 'epics'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Layers size={16} />
                        Epics
                    </button>
                </div>

                <div className="min-h-[400px]"
                    role="tabpanel"
                    id={activeTab === 'sprints' ? 'tabpanel-sprints' : 'tabpanel-epics'}
                    aria-labelledby={activeTab === 'sprints' ? 'tab-sprints' : 'tab-epics'}
                >
                    {creatingIn?.scope === 'top' && selectedProject && (
                        <div className="mb-6">
                            <CreateWorkItemPanel
                                projectId={selectedProject.id}
                                sprints={sprints}
                                epics={epics}
                                subtitle={selectedProject.name}
                                onClose={closeTopCreatePanel}
                                onCreated={() => {
                                    invalidateAll();
                                    setCreatingIn(null);
                                    focusCreateTrigger('top');
                                }}
                            />
                        </div>
                    )}

                    {activeTab === 'sprints' ? renderSprintsContent() : (
                        isLoadingEpics ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                        ) : (
                            <EpicsTab
                                projectId={selectedProject?.id ?? 0}
                                epics={epics}
                                workItems={workItems}
                                sprints={sprints}
                                onCreateEpic={() => setShowCreateEpicModal(true)}
                                onEditEpic={setEditingEpic}
                                onLinkStory={handleLinkStory}
                                onWorkItemCreated={handleQuickCreated}
                                canCreateEpic={canCreateEpic}
                                canUpdateEpic={canUpdateEpic}
                                canLinkStory={canUpdateStory}
                                canCreateStory={canCreateStory}
                                creatingIn={creatingIn}
                                setCreatingIn={setCreatingIn}
                            />
                        )
                    )}
                </div>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 10px;
                    }
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #334155;
                    }
                `}</style>
            </div>

            {showCreateModal && selectedProject && (
                <CreateSprintModal
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                    sprintDurationDays={selectedProject.sprintDurationDays}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleSprintCreated}
                />
            )}

            {showCreateEpicModal && selectedProject && (
                <EpicModal
                    mode="create"
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                    onClose={() => setShowCreateEpicModal(false)}
                    onCreated={handleEpicCreated}
                    onUpdated={() => {}}
                />
            )}

            {editingEpic && (
                <EpicModal
                    mode="edit"
                    epic={editingEpic}
                    projectId={editingEpic.projectId}
                    projectName={selectedProject?.name || ''}
                    onClose={() => setEditingEpic(null)}
                    onCreated={() => {}}
                    onUpdated={handleEpicUpdated}
                />
            )}
        </>
    );
}
