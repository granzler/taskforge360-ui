'use client';

import React, { useState } from 'react';
import {
    mockSprints,
    mockEpics,
    mockUserStories,
    mockSubTasks
} from '@/features/backlog/data/mockBacklogData';
import { Layers, Calendar, Plus } from 'lucide-react';
import SprintsTab from '@/features/backlog/components/SprintsTab';
import EpicsTab from '@/features/backlog/components/EpicsTab';

export default function BacklogPage() {
    const [activeTab, setActiveTab] = useState<'sprints' | 'epics'>('sprints');

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Backlog</h1>
                    <p className="text-slate-500 mt-1">Manage sprints, epics and user stories for your project.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent/50 transition-colors">
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
                {activeTab === 'sprints' ? (
                    <SprintsTab
                        sprints={mockSprints}
                        userStories={mockUserStories}
                        subtasks={mockSubTasks}
                        epics={mockEpics}
                    />
                ) : (
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
    );
}
