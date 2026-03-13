'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project } from '@/domain/entities/Project';
import { projectService } from '@/infrastructure/services/projectService';
import { Plus, Edit, Loader2, Search, FolderOpen, LayoutGrid, Clock } from 'lucide-react';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProjects, setSelectedProjects] = useState<number[]>([]);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const data = await projectService.getAll();
            setProjects(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            setError('Failed to load projects. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedProjects.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedProjects.length} project(s)?`)) return;

        try {
            await Promise.all(selectedProjects.map(id => projectService.delete(id)));
            // Refresh list
            fetchProjects();
            setSelectedProjects([]);
        } catch (err) {
            console.error('Failed to delete projects:', err);
            alert('Failed to delete some projects. Please try again.');
        }
    };

    const toggleSelectAll = () => {
        if (selectedProjects.length === filteredProjects.length) {
            setSelectedProjects([]);
        } else {
            setSelectedProjects(filteredProjects.map(p => p.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedProjects.includes(id)) {
            setSelectedProjects(selectedProjects.filter(pid => pid !== id));
        } else {
            setSelectedProjects([...selectedProjects, id]);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <FolderOpen className="text-primary" size={28} />
                        Projects
                    </h1>
                    <p className="text-slate-500 mt-1">Manage all your team workspaces, sprints, and settings.</p>
                </div>

                <div className="flex items-center gap-3">
                    {selectedProjects.length > 0 && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-bold shadow-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                        >
                            Delete {selectedProjects.length > 1 ? `(${selectedProjects.length})` : ''}
                        </button>
                    )}
                    <Link
                        href="/projects/create"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Create Project
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                    <Loader2 size={18} />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Toolbar: Search and Select All */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-card border border-border/50 p-2 sm:p-3 rounded-2xl shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-accent/30 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm font-medium"
                    />
                </div>

                {filteredProjects.length > 0 && (
                    <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/40 rounded-xl transition-colors select-none text-sm font-bold text-slate-500 mr-2 border border-transparent hover:border-border/50">
                        <input
                            type="checkbox"
                            checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        Select All
                    </label>
                )}
            </div>

            {/* Content Area */}
            {projects.length === 0 && !error ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-border rounded-3xl bg-card/30">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                        <LayoutGrid size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No projects yet</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">Get started by creating your first project workspace to organize sprints, epics, and user stories.</p>
                    <Link
                        href="/projects/create"
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        Create Your First Project
                    </Link>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-16 border border-border border-dashed rounded-3xl bg-card/30">
                    <p className="text-lg font-bold text-slate-400">No projects match your search.</p>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="mt-4 text-sm font-medium text-primary hover:underline"
                    >
                        Clear search filter
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className={`group relative flex flex-col rounded-3xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${selectedProjects.includes(project.id)
                                    ? 'border-primary ring-1 ring-primary/20 shadow-md bg-primary/5'
                                    : 'border-border/60 shadow-sm hover:border-primary/50'
                                }`}
                        >
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                        <FolderOpen size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedProjects.includes(project.id)}
                                            onChange={() => toggleSelect(project.id)}
                                            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer shadow-sm transition-transform hover:scale-110"
                                        />
                                    </div>
                                </div>

                                <Link href={`/projects/${project.id}`} className="mb-2 block">
                                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                                </Link>

                                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 leading-relaxed">
                                    {project.description || 'No description provided for this project.'}
                                </p>

                                <div className="mt-auto pt-5 border-t border-border/50 flex items-center justify-between text-xs font-bold text-slate-400">
                                    <div className="flex items-center gap-1.5 bg-accent/50 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300">
                                        <Clock size={14} className="text-primary" />
                                        <span>{project.sprintDurationDays} Day Sprints</span>
                                    </div>
                                    <Link
                                        href={`/projects/${project.id}/edit`}
                                        className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                        title="Edit Project"
                                    >
                                        <Edit size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
