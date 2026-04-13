'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useUpdateUserStory } from '../hooks/useUpdateUserStory';
import { UserStoryDto, UpdateUserStoryRequestDto } from '@/domain/entities/UserStory';
import { Sprint } from '@/domain/entities/Sprint';
import { EpicResponseDto } from '@/domain/entities/Epic';
import UserStoryForm from './UserStoryForm';

interface EditUserStoryModalProps {
    story: UserStoryDto;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: (story: UserStoryDto) => void;
    sprints?: Sprint[];
    epics?: EpicResponseDto[];
}

export default function EditUserStoryModal({
    story,
    isOpen,
    onClose,
    onUpdated,
    sprints = [],
    epics = [],
}: EditUserStoryModalProps) {
    const { update, isLoading } = useUpdateUserStory({
        onSuccess: (updatedStory) => {
            onUpdated(updatedStory);
            onClose();
        },
    });

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

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
    }) => {
        const dto: UpdateUserStoryRequestDto = {
            title: data.title,
            description: data.description,
            storyPoints: data.storyPoints,
            statusId: data.statusId,
            acceptanceCriteria: data.acceptanceCriteria,
            sprintId: data.sprintId,
            epicId: data.epicId,
            projectId: data.projectId,
            priority: data.priority,
        };

        await update(story.id, dto);
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
                            <h2 className="text-base font-bold">Edit User Story</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{story.title}</p>
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
                                title: story.title,
                                description: story.description,
                                storyPoints: story.storyPoints,
                                statusId: story.statusId,
                                acceptanceCriteria: story.acceptanceCriteria,
                                sprintId: story.sprintId,
                                epicId: story.epicId,
                            }}
                            projectId={story.projectId}
                            sprints={sprints}
                            epics={epics}
                            isSprintReadOnly={!!story.sprintId}
                            isLoading={isLoading}
                            onSubmit={handleSubmit}
                            onCancel={onClose}
                            submitLabel="Save Changes"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}