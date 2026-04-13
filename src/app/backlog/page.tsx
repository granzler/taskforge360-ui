'use client';

import { useState, useEffect } from 'react';
import {
    mockSubTasks
} from '@/features/backlog/data/mockBacklogData';
import { Sprint } from '@/domain/entities/Sprint';
import { sprintService } from '@/infrastructure/services/sprintService';
import { epicService } from '@/infrastructure/services/epicService';
import { userStoryService } from '@/infrastructure/services/userStoryService';
import { UserStoryDto } from '@/domain/entities/UserStory';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { useProject } from '@/features/projects/context/ProjectContext';
import { Layers, Calendar, Plus, FolderOpen, Loader2 } from 'lucide-react';
import SprintsTab from '@/features/backlog/components/SprintsTab';
import EpicsTab from '@/features/backlog/components/EpicsTab';
import CreateSprintModal from '@/features/backlog/components/CreateSprintModal';
import CreateUserStoryModal from '@/features/backlog/components/CreateUserStoryModal';
import EpicModal from '@/features/backlog/components/EpicModal';
import { toast } from 'react-hot-toast';

export default function BacklogPage() {
    const [activeTab, setActiveTab] = useState<'sprints' | 'epics'>('sprints');
    const { selectedProject } = useProject();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateEpicModal, setShowCreateEpicModal] = useState(false);
    const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
    const [editingEpic, setEditingEpic] = useState<EpicResponseDto | null>(null);

    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [isLoadingSprints, setIsLoadingSprints] = useState(false);

    const [epics, setEpics] = useState<EpicResponseDto[]>([]);
    const [isLoadingEpics, setIsLoadingEpics] = useState(false);

    const [userStories, setUserStories] = useState<UserStoryDto[]>([]);
    const [isLoadingStories, setIsLoadingStories] = useState(false);

    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (loadError) {
            toast.error(loadError);
        }
    }, [loadError]);

    useEffect(() => {
        if (!selectedProject) {
            setSprints([]);
            setEpics([]);
            return;
        }

        setLoadError(null);

        const fetchAll = async () => {
            setIsLoadingSprints(true);
            setIsLoadingEpics(true);
            setIsLoadingStories(true);

            let sprintsResult: typeof sprints = [];
            let epicsResult: typeof epics = [];
            let allStories: UserStoryDto[] = [];
            let hasError = false;

            try {
                const result = await sprintService.getByProject(selectedProject.id);
                if (result.success) {
                    sprintsResult = result.data;
                } else {
                    toast.error(result.errors?.map(e => e.message).join(', ') || 'Failed to fetch sprints.');
                    hasError = true;
                }
            } catch (err) {
                console.error('Failed to fetch sprints:', err);
                toast.error('Failed to fetch sprints. Please try again.');
                hasError = true;
            } finally {
                setIsLoadingSprints(false);
            }

            try {
                const result = await epicService.getByProject(selectedProject.id);
                if (result.success) {
                    epicsResult = result.data;
                } else {
                    toast.error(result.errors?.map(e => e.message).join(', ') || 'Failed to fetch epics.');
                    hasError = true;
                }
            } catch (err) {
                console.error('Failed to fetch epics:', err);
                toast.error('Failed to fetch epics. Please try again.');
                hasError = true;
            } finally {
                setIsLoadingEpics(false);
            }
            
            try {
                const backlogResult = await userStoryService.getBacklog(selectedProject.id);
                if (backlogResult.success) {
                    allStories = [...backlogResult.data];
                } else {
                    toast.error(backlogResult.errors?.map(e => e.message).join(', ') || 'Failed to fetch backlog stories.');
                    hasError = true;
                }
                
                // Fetch stories for all sprints
                for (const sprint of sprintsResult) {
                    const sprintStoriesResult = await userStoryService.getBySprint(sprint.id);
                    if (sprintStoriesResult.success) {
                        allStories = [...allStories, ...sprintStoriesResult.data];
                    }
                }
            } catch (err) {
                console.error('Failed to fetch user stories:', err);
                hasError = true;
            } finally {
                setIsLoadingStories(false);
            }

            setSprints(sprintsResult);
            setEpics(epicsResult);
            setUserStories(allStories);

            if (hasError) {
                setLoadError('Some data could not be loaded. Please refresh to try again.');
            }
        };

        fetchAll();
    }, [selectedProject]);

    const handleSprintCreated = (sprint: Sprint) => {
        setSprints(prev => [...prev, sprint]);
        setShowCreateModal(false);
        toast.success(`Sprint "${sprint.name}" created!`);
    };

    const handleSprintDeleted = (sprintId: number) => {
        setSprints(prev => prev.filter(s => s.id !== sprintId));
    };

    const handleStoryCreated = async (storyId?: number) => {
        if (!storyId) return;
        try {
            const result = await userStoryService.getById(storyId);
            if (result.success && result.data) {
                setUserStories(prev => [...prev, result.data]);
                toast.success('User story created!');
            }
        } catch (err) {
            console.error('Failed to refresh story:', err);
        }
    };

    const handleEpicCreated = (epic: EpicResponseDto) => {
        setEpics(prev => [...prev, epic]);
        setShowCreateEpicModal(false);
        toast.success(`Epic "${epic.title}" created!`);
    };

    const handleEpicUpdated = (updatedEpic: EpicResponseDto) => {
        setEpics(prev => prev.map(e => e.id === updatedEpic.id ? updatedEpic : e));
        setEditingEpic(null);
        toast.success(`Epic "${updatedEpic.title}" updated!`);
    };

    const handleEditEpic = (epic: EpicResponseDto) => {
        setEditingEpic(epic);
    };

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

        if (isLoadingSprints || isLoadingEpics || isLoadingStories) {
            return (
                <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">Loading data for <strong>{selectedProject.name}</strong>…</span>
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
            />
        );
    };

    return (
        <>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
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
                        <button
                            onClick={() => setShowCreateModal(true)}
                            disabled={!selectedProject}
                            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Calendar size={16} />
                            Plan Sprint
                        </button>
                        <button
                            onClick={() => setShowCreateStoryModal(true)}
                            disabled={!selectedProject}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Plus size={18} />
                            Create Story
                        </button>
                    </div>
                </div>

                {/* Tabs */}
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

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'sprints' ? renderSprintsContent() : (
                        isLoadingEpics ? (
                            <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
                                <Loader2 size={20} className="animate-spin" />
                                <span className="text-sm">Loading epics...</span>
                            </div>
                        ) : (
                            <>
                                {loadError && <div className="mb-4 p-3 text-sm text-red-500 bg-red-100 dark:bg-red-500/20 rounded-lg">{loadError}</div>}
                                <EpicsTab
                                    epics={epics}
                                    userStories={userStories}
                                    onCreateEpic={() => setShowCreateEpicModal(true)}
                                    onEditEpic={handleEditEpic}
                                />
                            </>
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

            {/* Create Sprint Modal */}
            {showCreateModal && selectedProject && (
                <CreateSprintModal
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                    sprintDurationDays={selectedProject.sprintDurationDays}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleSprintCreated}
                />
            )}

            {/* Create Epic Modal */}
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

            {/* Edit Epic Modal */}
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

            {/* Create User Story Modal */}
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
