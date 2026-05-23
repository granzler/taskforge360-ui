'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { UserProject } from '@/domain/entities/Project';
import { projectService } from '@/infrastructure/services/projectService';

const STORAGE_KEY = 'taskforge360_selected_project';

interface ProjectContextType {
    projects: UserProject[];
    selectedProject: UserProject | null;
    setSelectedProject: (project: UserProject | null) => void;
    isLoading: boolean;
    refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const { status } = useSession();
    const queryClient = useQueryClient();

    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? parseInt(saved, 10) : null;
        }
        return null;
    });

    const { data: projects = [], isLoading } = useQuery<UserProject[]>({
        queryKey: ['my-projects'],
        queryFn: async () => {
            const result = await projectService.getMyProjects();
            if (!result.success) {
                throw new Error(result.errors.map(e => e.message).join(', '));
            }
            return result.data;
        },
        enabled: status === 'authenticated',
        staleTime: 60 * 1000,
    });

    const selectedProject = useMemo(() => {
        if (!selectedProjectId) return null;
        return projects.find(p => p.id === selectedProjectId) || null;
    }, [projects, selectedProjectId]);

    const handleSetSelectedProject = useCallback((project: UserProject | null) => {
        setSelectedProjectId(project?.id ?? null);
        if (project) {
            localStorage.setItem(STORAGE_KEY, project.id.toString());
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const refreshProjects = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    }, [queryClient]);

    return (
        <ProjectContext.Provider value={{ projects, selectedProject, setSelectedProject: handleSetSelectedProject, isLoading, refreshProjects }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
}
