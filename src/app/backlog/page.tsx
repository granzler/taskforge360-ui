'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    mockSubTasks
} from '@/features/backlog/data/mockBacklogData';
import { Sprint } from '@/domain/entities/Sprint';
import { UserStoryDto } from '@/domain/entities/UserStory';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { userStoryService } from '@/infrastructure/services/userStoryService';
import { useProject } from '@/features/projects/context/ProjectContext';
import { useSprints } from '@/features/backlog/hooks/useSprints';
import { useEpicsByProject } from '@/features/backlog/hooks/useEpicsByProject';
import { useBacklogStories } from '@/features/backlog/hooks/useBacklogStories';
import { Layers, Calendar, Plus, FolderOpen } from 'lucide-react';
import { SkeletonCard } from '@/components/ui';
import SprintsTab from '@/features/backlog/components/SprintsTab';
import EpicsTab from '@/features/backlog/components/EpicsTab';
import CreateSprintModal from '@/features/backlog/components/CreateSprintModal';
import CreateUserStoryModal from '@/features/backlog/components/CreateUserStoryModal';
import EpicModal from '@/features/backlog/components/EpicModal';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';
import { usePermission } from '@/features/auth/hooks/usePermission';

export default function BacklogPage() {
    const queryClient = useQueryClient();
    const { hasRole, hasScope } = usePermission();
    const [activeTab, setActiveTab] = useState<'sprints' | 'epics'>('sprints');
    const { selectedProject } = useProject();
    const projectId = selectedProject?.id;

    const canCreateSprint = hasRole('scrum-master') || hasRole('system-admin') || hasScope('sprints:create');
    const canDeleteSprint = hasRole('scrum-master') || hasRole('system-admin') || hasScope('sprints:delete');
    const canCreateStory = hasRole('developer') || hasRole('product-owner') || hasRole('system-admin') || hasScope('userstories:create');
    const canUpdateStory = hasRole('developer') || hasRole('product-owner') || hasRole('system-admin') || hasScope('userstories:update');
    const canCreateEpic = hasRole('product-owner') || hasRole('system-admin') || hasScope('epics:create');
    const canUpdateEpic = hasRole('product-owner') || hasRole('system-admin') || hasScope('epics:update');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateEpicModal, setShowCreateEpicModal] = useState(false);
    const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
    const [editingEpic, setEditingEpic] = useState<EpicResponseDto | null>(null);

    const { data: sprints = [], isLoading: isLoadingSprints } = useSprints(projectId);
    const { data: epics = [], isLoading: isLoadingEpics } = useEpicsByProject(projectId);
    const { data: userStories = [], isLoading: isLoadingStories } = useBacklogStories(
        projectId,
        sprints.map(s => s.id)
    );

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
        queryClient.invalidateQueries({ queryKey: ['epics', projectId] });
        queryClient.invalidateQueries({ queryKey: ['backlog-stories', projectId] });
    };

    const handleSprintCreated = (_sprint: Sprint) => {
        setShowCreateModal(false);
        invalidateAll();
        toast.success(`Sprint created!`);
    };

    const handleSprintDeleted = (_sprintId: number) => {
        invalidateAll();
    };

    const handleStoryCreated = (storyId?: number) => {
        if (storyId) invalidateAll();
        setShowCreateStoryModal(false);
    };

    const handleStoryUpdated = async (_updatedStory: UserStoryDto) => {
        invalidateAll();
        toast.success('User story updated!');
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

    const handleLinkStory = async (epicId: number, storyId: number): Promise<boolean> => {
        try {
            const currentStory = userStories.find(s => s.id === storyId);
            if (!currentStory) {
                toast.error('Story not found');
                return false;
            }

            const result = await userStoryService.update(storyId, {
                title: currentStory.title,
                description: currentStory.description,
                statusId: currentStory.statusId,
                priority: currentStory.priority,
                projectId: currentStory.projectId,
                storyPoints: currentStory.storyPoints,
                acceptanceCriteria: currentStory.acceptanceCriteria,
                sprintId: currentStory.sprintId,
                epicId: epicId,
                assignedTo: currentStory.assignedTo,
                labelIds: currentStory.labels?.map(l => l.id),
                concurrencyVersion: currentStory.concurrencyVersion,
            });

            if (notifyResult(result, { success: 'Story linked to epic!' })) {
                invalidateAll();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to link story:', err);
            return false;
        }
    };

    const isLoading = isLoadingSprints || isLoadingEpics || isLoadingStories;

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
                userStories={userStories}
                subtasks={mockSubTasks}
                epics={epics}
                onSprintDeleted={handleSprintDeleted}
                onStoryCreated={handleStoryCreated}
                onStoryUpdated={handleStoryUpdated}
                canDeleteSprint={canDeleteSprint}
                canCreateStory={canCreateStory}
                canUpdateStory={canUpdateStory}
            />
        );
    };

    return (
        <>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {selectedProject ? selectedProject.name : 'Project Backlog'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {selectedProject
                                ? `Sprints, epics and user stories for ${selectedProject.name}.`
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
                                onClick={() => setShowCreateStoryModal(true)}
                                disabled={!selectedProject}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Plus size={18} />
                                Create Story
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl w-fit mb-8 border border-border">
                    <button
                        onClick={() => setActiveTab('sprints')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sprints'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Calendar size={16} />
                        Sprints
                    </button>
                    <button
                        onClick={() => setActiveTab('epics')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'epics'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Layers size={16} />
                        Epics
                    </button>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'sprints' ? renderSprintsContent() : (
                        isLoadingEpics ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                        ) : (
                            <EpicsTab
                                epics={epics}
                                userStories={userStories}
                                onCreateEpic={() => setShowCreateEpicModal(true)}
                                onEditEpic={setEditingEpic}
                                onLinkStory={handleLinkStory}
                                canCreateEpic={canCreateEpic}
                                canUpdateEpic={canUpdateEpic}
                                canLinkStory={canUpdateStory}
                            />
                        )
                    )}
                </div>

                <style jsx global>{`
                    .animate-spin-slow {
                        animation: spin 3s linear infinite;
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
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

            {showCreateStoryModal && selectedProject && (
                <CreateUserStoryModal
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                    sprints={sprints}
                    epics={epics}
                    onClose={() => setShowCreateStoryModal(false)}
                    onCreated={handleStoryCreated}
                />
            )}
        </>
    );
}
