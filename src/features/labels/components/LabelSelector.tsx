'use client';

import { useState, useEffect } from 'react';
import { globalLabelService, GlobalLabelDto } from '@/infrastructure/services/globalLabelService';
import { X, Loader2, Plus } from 'lucide-react';

interface LabelSelectorProps {
    selectedLabelIds: number[];
    onChange: (labelIds: number[]) => void;
    disabled?: boolean;
}

export function LabelSelector({ selectedLabelIds, onChange, disabled = false }: LabelSelectorProps) {
    const [labels, setLabels] = useState<GlobalLabelDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchLabels = async () => {
            try {
                const result = await globalLabelService.getAll();
                if (result.success) {
                    setLabels(result.data);
                }
            } catch (err) {
                console.error('Failed to fetch labels:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLabels();
    }, []);

    const selectedLabels = labels.filter(l => selectedLabelIds.includes(l.id));
    const availableLabels = labels.filter(l => !selectedLabelIds.includes(l.id));

    const handleSelect = (labelId: number) => {
        onChange([...selectedLabelIds, labelId]);
    };

    const handleRemove = (labelId: number) => {
        onChange(selectedLabelIds.filter(id => id !== labelId));
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 py-2">
                <Loader2 size={16} className="animate-spin text-slate-400" />
                <span className="text-sm text-slate-400">Loading labels...</span>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                Labels
            </label>

            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-accent/20 border border-border/50 rounded-xl">
                {selectedLabels.map(label => (
                    <span
                        key={label.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary"
                    >
                        {label.tagName}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => handleRemove(label.id)}
                                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </span>
                ))}
                {selectedLabels.length === 0 && !disabled && (
                    <span className="text-sm text-slate-400 py-1">No labels selected</span>
                )}
            </div>

            {!disabled && availableLabels.length > 0 && (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        <Plus size={14} />
                        Add Label
                    </button>

                    {isOpen && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-background border border-border/50 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                            {availableLabels.map(label => (
                                <button
                                    key={label.id}
                                    type="button"
                                    onClick={() => {
                                        handleSelect(label.id);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors flex items-center justify-between"
                                >
                                    <span className="font-medium">{label.tagName}</span>
                                    {label.description && (
                                        <span className="text-xs text-slate-400 truncate ml-2">
                                            {label.description}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}