'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { projectService } from '@/services/projectService';
import { Plus, Edit, Loader2, Calendar } from 'lucide-react';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your teams projects and sprints.
                    </p>
                </div>
                <Link
                    href="/projects/create"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                    <Plus size={16} />
                    New Project
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                </div>
            )}

            {projects.length === 0 && !error ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg border-muted-foreground/25">
                    <p className="text-lg font-medium text-muted-foreground">No projects found</p>
                    <p className="text-sm text-muted-foreground/80 mt-1">Get started by creating your first project.</p>
                    <Link
                        href="/projects/create"
                        className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
                    >
                        Create Project
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="group bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                    {project.name}
                                </h3>
                                <Link
                                    href={`/projects/${project.id}/edit`}
                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                >
                                    <Edit size={16} />
                                </Link>
                            </div>

                            <p className="text-muted-foreground text-sm line-clamp-3 mb-6 min-h-[3rem]">
                                {project.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium pt-4 border-t">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {project.sprintDurationDays} Days Sprint
                                </div>
                                {/* Add stats like active sprints or members here if available */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
