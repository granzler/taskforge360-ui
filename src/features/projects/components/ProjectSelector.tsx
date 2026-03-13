'use client';

import { useState } from 'react';
import { FolderOpen, ChevronDown, Check, Loader2, FolderX } from 'lucide-react';
import { useProject } from '@/features/projects/context/ProjectContext';

export default function ProjectSelector() {
    const { projects, selectedProject, setSelectedProject, isLoading } = useProject();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (project: typeof projects[0]) => {
        setSelectedProject(project);
        setIsOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/40 animate-pulse">
                <Loader2 size={14} className="animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground hidden lg:block w-24 h-4 bg-muted rounded" />
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border
                    ${selectedProject
                        ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                        : 'bg-accent/40 text-foreground/70 border-border/50 hover:bg-accent hover:text-foreground'
                    }`}
            >
                <FolderOpen size={15} />
                <span className="hidden lg:block max-w-[140px] truncate">
                    {selectedProject ? selectedProject.name : 'Select Project'}
                </span>
                <ChevronDown
                    size={13}
                    className={`transition-transform text-muted-foreground ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute left-0 mt-2 w-60 bg-white dark:bg-slate-950 rounded-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                My Projects
                            </p>
                        </div>

                        {projects.length === 0 ? (
                            <div className="flex flex-col items-center gap-1.5 py-6 px-4 text-center">
                                <FolderX size={20} className="text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">No projects assigned</p>
                            </div>
                        ) : (
                            <ul className="py-1 max-h-64 overflow-y-auto">
                                {projects.map((project) => {
                                    const isSelected = selectedProject?.id === project.id;
                                    return (
                                        <li key={project.id}>
                                            <button
                                                onClick={() => handleSelect(project)}
                                                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
                                                    ${isSelected
                                                        ? 'bg-primary/10 text-primary font-medium'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <span className="truncate">{project.name}</span>
                                                {isSelected && (
                                                    <Check size={14} className="ml-2 shrink-0 text-primary" />
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {selectedProject && (
                            <div className="border-t border-gray-100 dark:border-slate-800 py-1">
                                <button
                                    onClick={() => { setSelectedProject(null); setIsOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-xs text-muted-foreground hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Clear selection
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
