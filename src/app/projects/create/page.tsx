'use client';

import ProjectForm from '@/features/projects/components/ProjectForm';
import { projectService } from '@/services/projectService';
import { CreateProjectDto } from '@/features/projects/types';

import { ArrowLeft, FolderPlus } from 'lucide-react';
import Link from 'next/link';

export default function CreateProjectPage() {
    const handleCreate = async (data: any, users?: import('@/features/projects/types').UserSearchResult[]) => {
        // Cast to CreateProjectDto because the form passes a union type but we know handled by service
        const newProject = await projectService.create(data as CreateProjectDto);

        if (users && users.length > 0 && newProject.id) {
            await Promise.all(users.map(user =>
                projectService.assignUser(newProject.id, user.id)
            ));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link
                href="/projects"
                className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors w-fit"
            >
                <div className="p-1 rounded-md bg-transparent group-hover:bg-primary/10 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                Back to Projects
            </Link>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10 shrink-0">
                    <FolderPlus size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Create Project</h1>
                    <p className="text-slate-500 mt-1 font-medium">Define your workspace and add your team members.</p>
                </div>
            </div>

            <ProjectForm onSubmit={handleCreate} />
        </div>
    );
}
