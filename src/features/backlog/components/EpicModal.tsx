'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { epicService, CreateEpicDto, UpdateEpicDto } from '@/infrastructure/services/epicService';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { EPIC_STATUS_OPTIONS, getWorkItemPriorityLabel } from '@/domain/types';
import { toast } from 'react-hot-toast';

interface EpicModalProps {
    mode: 'create' | 'edit';
    epic?: EpicResponseDto;
    projectId: number;
    projectName: string;
    onClose: () => void;
    onCreated: (epic: EpicResponseDto) => void;
    onUpdated: (epic: EpicResponseDto) => void;
}

const PRIORITY_OPTIONS = [
    { value: 1, label: 'Low' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'High' },
    { value: 4, label: 'Critical' },
];

export default function EpicModal({ mode, epic, projectId, projectName, onClose, onCreated, onUpdated }: EpicModalProps) {
    const isEdit = mode === 'edit';

    const getInitialPriority = () => {
        if (epic?.priority) {
            const p = typeof epic.priority === 'string' ? epic.priority : getWorkItemPriorityLabel(epic.priority);
            const found = PRIORITY_OPTIONS.find(opt => opt.label === p);
            return found ? found.value : 2;
        }
        return 2;
    };

    const [title, setTitle] = useState(epic?.title || '');
    const [description, setDescription] = useState(epic?.description || '');
    const [acceptanceCriteria, setAcceptanceCriteria] = useState(epic?.acceptanceCriteria || '');
    const [priority, setPriority] = useState(getInitialPriority());
    const [statusId, setStatusId] = useState(epic?.statusId || 1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const isValid = title.trim().length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        setIsSubmitting(true);

        try {
            if (isEdit && epic) {
                const dto: UpdateEpicDto = {
                    id: epic.id,
                    title: title.trim(),
                    description: description.trim(),
                    acceptanceCriteria: acceptanceCriteria.trim(),
                    priority,
                    statusId,
                    projectId: epic.projectId,
                    concurrencyVersion: epic.concurrencyVersion,
                };

                const result = await epicService.update(epic.id, dto);
                if (result.success) {
                    onUpdated(result.data);
                } else {
                    console.error('Failed to update epic:', result.errors);
                    toast.error(result.errors.map(e => e.message).join(', ') || 'Could not update the epic.');
                }
            } else {
                const dto: CreateEpicDto = {
                    title: title.trim(),
                    description: description.trim(),
                    acceptanceCriteria: acceptanceCriteria.trim(),
                    priority,
                    statusId,
                    projectId,
                };

                const result = await epicService.create(dto);
                if (result.success) {
                    onCreated(result.data);
                } else {
                    console.error('Failed to create epic:', result.errors);
                    toast.error(result.errors.map(e => e.message).join(', ') || 'Could not create the epic.');
                }
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
            console.error('Epic operation failed (exception):', err);
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
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
                            <h2 className="text-base font-bold">{isEdit ? 'Edit Epic' : 'Create New Epic'}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{projectName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="epic-title" className="block text-sm font-medium">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="epic-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. User Authentication System"
                                autoFocus
                                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="epic-description" className="block text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                id="epic-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the epic's purpose and scope..."
                                rows={3}
                                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="epic-acceptance" className="block text-sm font-medium">
                                Acceptance Criteria
                            </label>
                            <textarea
                                id="epic-acceptance"
                                value={acceptanceCriteria}
                                onChange={(e) => setAcceptanceCriteria(e.target.value)}
                                placeholder="Define what needs to be accomplished..."
                                rows={3}
                                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="epic-priority" className="block text-sm font-medium">
                                    Priority
                                </label>
                                <select
                                    id="epic-priority"
                                    value={priority}
                                    onChange={(e) => setPriority(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                                >
                                    {PRIORITY_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="epic-status" className="block text-sm font-medium">
                                    Status
                                </label>
                                <select
                                    id="epic-status"
                                    value={statusId}
                                    onChange={(e) => setStatusId(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                                >
                                    {EPIC_STATUS_OPTIONS.map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {!isEdit && statusId === 1 && (
                            <p className="text-xs text-muted-foreground">
                                Status can be changed after creation.
                            </p>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        {isEdit ? 'Saving…' : 'Creating…'}
                                    </>
                                ) : (
                                    isEdit ? 'Save Changes' : 'Create Epic'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
