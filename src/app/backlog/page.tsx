'use client';

import React, { useState, useEffect } from 'react';
import {
    mockEpics,
    mockUserStories,
    mockSubTasks
} from '@/features/backlog/data/mockBacklogData';
import { Sprint } from '@/features/backlog/types';
import { sprintService } from '@/services/sprintService';
import { useProject } from '@/features/projects/context/ProjectContext';
import { Layers, Calendar, Plus, FolderOpen, Loader2, AlertCircle } from 'lucide-react';
import SprintsTab from '@/features/backlog/components/SprintsTab';
import EpicsTab from '@/features/backlog/components/EpicsTab';
import CreateSprintModal from '@/features/backlog/components/CreateSprintModal';

export default function BacklogPage() {
    const [activeTab, setActiveTab] = useState<'sprints' | 'epics'>('sprints');
    const { selectedProject } = useProject();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [isLoadingSprints, setIsLoadingSprints] = useState(false);
    const [sprintsError, setSprintsError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedProject) {
            setSprints([]);
            return;
        }

        const fetchSprints = async () => {
            setIsLoadingSprints(true);
            setSprintsError(null);
            try {
                const data = await sprintService.getByProject(selectedProject.id);
                setSprints(data);
            } catch (err) {
                console.error('Failed to fetch sprints:', err);
                setSprintsError('Could not load sprints. Please try again.');
                setSprints([]);
            } finally {
                setIsLoadingSprints(false);
            }
        };

        fetchSprints();
    }, [selectedProject]);

    const handleSprintCreated = (sprint: Sprint) => {
        setSprints(prev => [...prev, sprint]);
        setShowCreateModal(false);
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

        if (isLoadingSprints) {
            return (
                <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">Loading sprints for <strong>{selectedProject.name}</strong>…</span>
                </div>
            );
        }

        if (sprintsError) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <AlertCircle size={28} className="text-destructive" />
                    <p className="text-sm text-destructive">{sprintsError}</p>
                </div>
            );
        }

        return (
            <SprintsTab
                sprints={sprints}
                userStories={mockUserStories}
                subtasks={mockSubTasks}
                epics={mockEpics}
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
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95">
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
                        <EpicsTab
                            epics={mockEpics}
                            userStories={mockUserStories}
                        />
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
        </>
    );
}
