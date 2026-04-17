'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreateUserStory } from '../hooks/useCreateUserStory';
import { CreateUserStoryRequestDto } from '@/domain/entities/UserStory';
import { Sprint } from '@/domain/entities/Sprint';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { UserStoryStatus } from '@/domain/types';
import UserStoryForm from './UserStoryForm';

interface CreateUserStoryModalProps {
    projectId: number;
    projectName: string;
    sprints?: Sprint[];
    epics?: EpicResponseDto[];
    sprintId?: number;
    epicId?: number;
    onClose: () => void;
    onCreated: (storyId?: number) => void;
}

export default function CreateUserStoryModal({
    projectId,
    projectName,
    sprints = [],
    epics = [],
    sprintId,
    epicId,
    onClose,
    onCreated,
}: CreateUserStoryModalProps) {
    const { create, isLoading } = useCreateUserStory({
        onSuccess: (story) => {
            onCreated(story.id);
        },
    });

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleSubmit = async (data: {
        title: string;
        description?: string;
        storyPoints?: number;
        statusId: number;
        acceptanceCriteria?: string;
        sprintId?: number;
        epicId?: number;
        projectId: number;
        priority: number;
        assignedTo?: string;
        labelIds?: number[];
    }) => {
        const dto: CreateUserStoryRequestDto = {
            title: data.title,
            description: data.description,
            storyPoints: data.storyPoints,
            statusId: data.statusId,
            acceptanceCriteria: data.acceptanceCriteria,
            sprintId: data.sprintId,
            epicId: data.epicId,
            projectId: data.projectId,
            priority: data.priority,
            assignedTo: data.assignedTo,
            labelIds: data.labelIds,
        };

        await create(dto);
    };

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto w-full max-w-lg bg-background rounded-xl shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <div>
                            <h2 className="text-base font-bold">Create User Story</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{projectName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="px-6 py-5">
                        <UserStoryForm
                            initialData={{
                                title: '',
                                description: undefined,
                                storyPoints: undefined,
                                statusId: UserStoryStatus.Backlog,
                                acceptanceCriteria: undefined,
                                sprintId: sprintId,
                                epicId: epicId,
                            }}
                            projectId={projectId}
                            sprints={sprints}
                            epics={epics}
                            isSprintReadOnly={!!sprintId}
                            isLoading={isLoading}
                            onSubmit={handleSubmit}
                            onCancel={onClose}
                            submitLabel="Create Story"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}