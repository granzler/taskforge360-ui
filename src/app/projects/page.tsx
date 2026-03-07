'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project } from '@/features/projects/types';
import { projectService } from '@/services/projectService';
import { Plus, Edit, Loader2, Calendar } from 'lucide-react';

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
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your teams projects and sprints.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {selectedProjects.length > 0 && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-medium"
                        >
                            Delete ({selectedProjects.length})
                        </button>
                    )}
                    <Link
                        href="/projects/create"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                        <Plus size={16} />
                        New Project
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

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
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg border-muted-foreground/25">
                    <p className="text-lg font-medium text-muted-foreground">No projects match your search</p>
                </div>
            ) : (
                <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground font-medium">
                            <tr>
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Sprint Duration</th>
                                <th className="p-4 w-20">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredProjects.map((project) => (
                                <tr key={project.id} className="group hover:bg-muted/50 transition-colors">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedProjects.includes(project.id)}
                                            onChange={() => toggleSelect(project.id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </td>
                                    <td className="p-4 font-medium">
                                        <Link href={`/projects/${project.id}`} className="hover:underline text-foreground">
                                            {project.name}
                                        </Link>
                                    </td>
                                    <td className="p-4 text-muted-foreground max-w-md truncate">
                                        {project.description || '-'}
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            {project.sprintDurationDays} Days
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="p-2 inline-flex text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                            title="View Details"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
