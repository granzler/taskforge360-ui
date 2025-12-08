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

    const handleUpdate = async (data: any) => {
        if (!projectId) return;
        await projectService.update(projectId, data as UpdateProjectDto);
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
