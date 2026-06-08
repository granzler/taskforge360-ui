'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import ProjectForm from '@/features/projects/components/ProjectForm';
import { projectService } from '@/infrastructure/services/projectService';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/domain/entities/Project';
import { UserSearchResult } from '@/domain/entities/User';
import { Loader2, ArrowLeft, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';
import { useProject } from '@/features/projects/context/ProjectContext';
import { usePermission } from '@/features/auth/hooks/usePermission';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditProjectPage({ params }: PageProps) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const projectId = parseInt(id);

    const router = useRouter();
    const { refreshProjects } = useProject();
    const { hasRole, hasScope } = usePermission();
    const canUpdate = hasRole('product-owner') || hasRole('system-admin') || hasScope('projects:update');
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!canUpdate) {
            toast.error('You do not have permission to edit this project.');
            router.push('/projects');
            return;
        }

        const fetchProject = async () => {
            try {
                const result = await projectService.getById(projectId);
                if (notifyResult(result)) {
                    setProject(result.data);
                } else {
                    router.push('/projects');
                }
            } catch (error) {
                console.error('Failed to fetch project (exception):', error);
                toast.error('Failed to load project details.');
                router.push('/projects');
            } finally {
                setIsLoading(false);
            }
        };

        if (projectId) {
            fetchProject();
        }
    }, [projectId, router, canUpdate]);

    const handleUpdate = async (data: CreateProjectDto | UpdateProjectDto, users?: UserSearchResult[]) => {
        if (!projectId) return;

        // 1. Update project details
        const updateResult = await projectService.update(projectId, data as UpdateProjectDto);
        if (!notifyResult(updateResult)) {
            throw new Error(updateResult.errors.map(e => e.message).join(', ') || 'Failed to update project.');
        }

        // 2. Handle user assignments if users are provided
        if (users && project && project.projectUsers) {
            const currentIds = project.projectUsers.map(u => u.userId);
            const newIds = users.map(u => u.id);

            const toAdd = users.filter(u => !currentIds.includes(u.id));
            const toRemove = project.projectUsers.filter(u => !newIds.includes(u.userId));

            const hasChanges = toAdd.length > 0 || toRemove.length > 0;

            if (hasChanges) {
                if (toAdd.length > 0) {
                    await projectService.assignUsers(projectId, toAdd.map(u => u.id), project.concurrencyVersion);
                }
                
                await Promise.all(toRemove.map(u => projectService.removeUser(projectId, u.userId)));
                
                await refreshProjects();
            }
        }
        
        toast.success('Project updated successfully.');
        router.push(`/projects/${projectId}`);
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link
                href={`/projects/${project.id}`}
                className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors w-fit"
            >
                <div className="p-1 rounded-md bg-transparent group-hover:bg-primary/10 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                Back to Project Details
            </Link>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10 shrink-0">
                    <Edit3 size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Edit Project</h1>
                    <p className="text-slate-500 mt-1 font-medium">Update the settings and team assignments for {project.name}.</p>
                </div>
            </div>

            <ProjectForm initialData={project} onSubmit={handleUpdate} />
        </div>
    );
}
