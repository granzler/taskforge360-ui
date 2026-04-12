'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, FileText, AlignLeft, Hash, Flag, CheckSquare, FolderKanban } from 'lucide-react';
import { useCreateUserStory } from '../hooks/useCreateUserStory';
import { CreateUserStoryRequestDto } from '@/domain/entities/UserStory';
import { UserStoryStatus } from '@/domain/types';
import { Sprint } from '@/domain/entities/Sprint';
import { EpicResponseDto } from '@/domain/entities/Epic';

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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [storyPoints, setStoryPoints] = useState<number | ''>('');
    const [statusId, setStatusId] = useState(UserStoryStatus.Backlog);
    const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
    const [selectedSprintId, setSelectedSprintId] = useState<number | undefined>(sprintId);
    const [selectedEpicId, setSelectedEpicId] = useState<number | undefined>(epicId);

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

    const isValid = title.trim().length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        const dto: CreateUserStoryRequestDto = {
            title: title.trim(),
            description: description.trim() || undefined,
            storyPoints: storyPoints || undefined,
            statusId,
            acceptanceCriteria: acceptanceCriteria.trim() || undefined,
            sprintId: selectedSprintId,
            epicId: selectedEpicId,
            projectId,
            priority: 2, // Medium by default
        };

        await create(dto);
    };

    const isSprintReadOnly = !!sprintId;

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

                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-1.5">
                            <label htmlFor="story-title" className="block text-sm font-medium">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="story-title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="As a user, I want to..."
                                    autoFocus
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="story-description" className="block text-sm font-medium">
                                Description
                            </label>
                            <div className="relative">
                                <AlignLeft size={14} className="absolute left-3 top-3 text-muted-foreground" />
                                <textarea
                                    id="story-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the user story in detail..."
                                    rows={3}
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="story-points" className="block text-sm font-medium">
                                    <span className="flex items-center gap-1.5"><Hash size={13} /> Story Points</span>
                                </label>
                                <input
                                    id="story-points"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={storyPoints}
                                    onChange={(e) => setStoryPoints(e.target.value ? parseInt(e.target.value) : '')}
                                    placeholder="0"
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="story-status" className="block text-sm font-medium">
                                    <span className="flex items-center gap-1.5"><Flag size={13} /> Status</span>
                                </label>
                                <select
                                    id="story-status"
                                    value={statusId}
                                    onChange={(e) => setStatusId(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                                >
                                    <option value={UserStoryStatus.Backlog}>Backlog</option>
                                    <option value={UserStoryStatus.ToDo}>To Do</option>
                                    <option value={UserStoryStatus.InProgress}>In Progress</option>
                                    <option value={UserStoryStatus.ReadyForReview}>Ready for Review</option>
                                    <option value={UserStoryStatus.InReview}>In Review</option>
                                    <option value={UserStoryStatus.Done}>Done</option>
                                    <option value={UserStoryStatus.Blocked}>Blocked</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="story-sprint" className="block text-sm font-medium">
                                    <span className="flex items-center gap-1.5"><FolderKanban size={13} /> Sprint</span>
                                </label>
                                {isSprintReadOnly ? (
                                    <div className="px-3 py-2 text-sm rounded-md border border-border bg-muted/50 text-muted-foreground">
                                        {sprints.find(s => s.id === sprintId)?.name || `Sprint #${sprintId}`}
                                    </div>
                                ) : (
                                    <select
                                        id="story-sprint"
                                        value={selectedSprintId || ''}
                                        onChange={(e) => setSelectedSprintId(e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                                    >
                                        <option value="">No Sprint (Backlog)</option>
                                        {sprints.map(sprint => (
                                            <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="story-epic" className="block text-sm font-medium">
                                    <span className="flex items-center gap-1.5"><Flag size={13} /> Epic</span>
                                </label>
                                <select
                                    id="story-epic"
                                    value={selectedEpicId || ''}
                                    onChange={(e) => setSelectedEpicId(e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                                >
                                    <option value="">No Epic</option>
                                    {epics.map(epic => (
                                        <option key={epic.id} value={epic.id}>{epic.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="story-ac" className="block text-sm font-medium">
                                <span className="flex items-center gap-1.5"><CheckSquare size={13} /> Acceptance Criteria</span>
                            </label>
                            <textarea
                                id="story-ac"
                                value={acceptanceCriteria}
                                onChange={(e) => setAcceptanceCriteria(e.target.value)}
                                placeholder="Enter acceptance criteria (one per line)..."
                                rows={3}
                                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!isValid || isLoading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Creating…
                                    </>
                                ) : (
                                    'Create Story'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}