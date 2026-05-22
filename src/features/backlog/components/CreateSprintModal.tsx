'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Loader2 } from 'lucide-react';
import { sprintService, CreateSprintDto } from '@/infrastructure/services/sprintService';
import { Sprint } from '@/domain/entities/Sprint';
import { toast } from 'react-hot-toast';

interface CreateSprintModalProps {
    projectId: number;
    projectName: string;
    sprintDurationDays: number;
    onClose: () => void;
    onCreated: (sprint: Sprint) => void;
}

export default function CreateSprintModal({ projectId, projectName, sprintDurationDays, onClose, onCreated }: CreateSprintModalProps) {
    const today = new Date().toISOString().split('T')[0];

    const computeEndDate = (start: string) => {
        const d = new Date(start);
        d.setDate(d.getDate() + sprintDurationDays);
        return d.toISOString().split('T')[0];
    };

    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(() => computeEndDate(today));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStartDateChange = (value: string) => {
        setStartDate(value);
        setEndDate(computeEndDate(value));
    };

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const isValid = name.trim().length > 0 && startDate && endDate && endDate >= startDate;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        setIsSubmitting(true);

        const dto: CreateSprintDto = {
            name: name.trim(),
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            projectId,
        };

        try {
            const result = await sprintService.create(dto);
            if (result.success) {
                onCreated(result.data);
            } else {
                console.error('Failed to create sprint:', result.errors);
                toast.error(result.errors.map(e => e.message).join(', ') || 'Could not create the sprint.');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Could not create the sprint. Please try again.';
            console.error('Failed to create sprint (exception):', err);
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto w-full max-w-md bg-background rounded-xl shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <div>
                            <h2 className="text-base font-bold">Plan New Sprint</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{projectName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                        {/* Sprint Name */}
                        <div className="space-y-1.5">
                            <label htmlFor="sprint-name" className="block text-sm font-medium">
                                Sprint Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="sprint-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Sprint 1"
                                autoFocus
                                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="sprint-start" className="block text-sm font-medium">
                                    <span className="flex items-center gap-1.5"><Calendar size={13} /> Start Date</span>
                                </label>
                                <input
                                    id="sprint-start"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium">
                                    <span className="flex items-center gap-1.5"><Calendar size={13} /> End Date</span>
                                </label>
                                <input
                                    id="sprint-end"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                                    title={`Suggested based on start date + ${sprintDurationDays} days (project setting)`}
                                />
                            </div>
                        </div>

                        {/* Duration info */}
                        <p className="text-xs text-muted-foreground">
                            Default duration: <strong>{sprintDurationDays} days</strong> (project setting). You can manually adjust the end date. Status will be <strong>Planned</strong>.
                        </p>

                        {/* Actions */}
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
                                        Creating…
                                    </>
                                ) : (
                                    'Create Sprint'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
