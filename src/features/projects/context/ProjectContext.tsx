'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
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
    const [projects, setProjects] = useState<UserProject[]>([]);
    const [selectedProject, setSelectedProjectState] = useState<UserProject | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const isInitializedRef = useRef(false);

    const loadProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await projectService.getMyProjects();
            if (result.success) {
                setProjects(result.data);

                if (!isInitializedRef.current) {
                    const savedProjectId = localStorage.getItem(STORAGE_KEY);
                    if (savedProjectId) {
                        const savedProject = result.data.find(p => p.id === parseInt(savedProjectId, 10));
                        if (savedProject) {
                            setSelectedProjectState(savedProject);
                        }
                    }
                    isInitializedRef.current = true;
                }
            } else {
                 console.error('Failed to load user projects:', result.errors);
                 setProjects([]);
            }
        } catch (err) {
            console.error('Failed to load user projects (exception):', err);
            setProjects([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSetSelectedProject = (project: UserProject | null) => {
        setSelectedProjectState(project);
        if (project) {
            localStorage.setItem(STORAGE_KEY, project.id.toString());
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    useEffect(() => {
        if (status !== 'authenticated') return;
        loadProjects();
    }, [status, loadProjects]);

    return (
        <ProjectContext.Provider value={{ projects, selectedProject, setSelectedProject: handleSetSelectedProject, isLoading, refreshProjects: loadProjects }}>
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
