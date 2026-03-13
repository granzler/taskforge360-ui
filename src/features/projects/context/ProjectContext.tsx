'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserProject } from '@/features/projects/types';
import { projectService } from '@/services/projectService';

interface ProjectContextType {
    projects: UserProject[];
    selectedProject: UserProject | null;
    setSelectedProject: (project: UserProject | null) => void;
    isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const { status } = useSession();
    const [projects, setProjects] = useState<UserProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<UserProject | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (status !== 'authenticated') return;

        const loadProjects = async () => {
            setIsLoading(true);
            try {
                const data = await projectService.getMyProjects();
                setProjects(data);
            } catch (err) {
                console.error('Failed to load user projects:', err);
                setProjects([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, [status]);

    return (
        <ProjectContext.Provider value={{ projects, selectedProject, setSelectedProject, isLoading }}>
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
