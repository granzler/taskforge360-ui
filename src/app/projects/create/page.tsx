'use client';

import ProjectForm from '@/components/ProjectForm';
import { projectService } from '@/services/projectService';
import { CreateProjectDto } from '@/types';

export default function CreateProjectPage() {
    const handleCreate = async (data: any) => {
        // Cast to CreateProjectDto because the form passes a union type but we know handled by service
        await projectService.create(data as CreateProjectDto);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Create Project</h1>
            <ProjectForm onSubmit={handleCreate} />
        </div>
    );
}
