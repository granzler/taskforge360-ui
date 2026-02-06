'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import ProjectForm from '@/components/ProjectForm';
import { projectService } from '@/services/projectService';
import { Project, UpdateProjectDto } from '@/types';
import { Loader2 } from 'lucide-react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditProjectPage({ params }: PageProps) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const projectId = parseInt(id);

    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const data = await projectService.getById(projectId);
                setProject(data);
            } catch (error) {
                console.error('Failed to fetch project:', error);
                // Redirect or show error
                router.push('/projects');
            } finally {
                setIsLoading(false);
            }
        };

        if (projectId) {
            fetchProject();
        }
    }, [projectId, router]);

    const handleUpdate = async (data: any, users?: import('@/types').UserSearchResult[]) => {
        if (!projectId) return;

        // 1. Update project details
        await projectService.update(projectId, data as UpdateProjectDto);

        // 2. Handle user assignments if users are provided
        if (users && project && project.projectUsers) {
            const currentIds = project.projectUsers.map(u => u.userId);
            const newIds = users.map(u => u.id);

            // Find users to add
            const toAdd = users.filter(u => !currentIds.includes(u.id));

            // Find users to remove
            const toRemove = project.projectUsers.filter(u => !newIds.includes(u.userId));

            await Promise.all([
                ...toAdd.map(u => projectService.assignUser(projectId, u.id)),
                ...toRemove.map(u => projectService.removeUser(projectId, u.userId))
            ]);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Project</h1>
            <ProjectForm initialData={project} onSubmit={handleUpdate} />
        </div>
    );
}
