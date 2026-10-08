'use client';

import { useRef, useState } from 'react';
import { Check, ChevronRight, Loader2, Plus } from 'lucide-react';
import { CreateWorkItemRequestDto, WorkItemDto } from '@/domain/entities/WorkItem';
import { WorkItemStatus, WorkItemType } from '@/domain/types';
import { useCreateWorkItem } from '../hooks/useCreateWorkItem';

interface QuickCreateItemProps {
    projectId: number;
    /** When set, the new work item is created inside this sprint. */
    sprintId?: number;
    /** When set, the new work item is linked to this epic/parent. */
    parentId?: number;
    /** Human readable context used for placeholders and aria-labels (e.g. "Sprint 1"). */
    label?: string;
    onCreated?: (workItem: WorkItemDto) => void;
    /** Renders the "Full form" trigger that opens the complete inline form. */
    onAdvanced?: () => void;
    /** Marks the advanced trigger as expanded while its panel is open. */
    advancedActive?: boolean;
    /** `data-create-trigger` value used to restore focus when the panel closes. */
    triggerKey?: string;
}

/**
 * Single-line, Jira-style quick creation: type a title, press Enter and the
 * input stays focused so several work items can be added in a row.
 */
export default function QuickCreateItem({
    projectId,
    sprintId,
    parentId,
    label,
    onCreated,
    onAdvanced,
    advancedActive = false,
    triggerKey,
}: QuickCreateItemProps) {
    const [title, setTitle] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const creatingRef = useRef(false);
    const { create, isLoading } = useCreateWorkItem({
        onSuccess: (workItem) => {
            setTitle('');
            onCreated?.(workItem);
            inputRef.current?.focus();
        },
    });

    const canSubmit = title.trim().length > 0 && !isLoading;

    const handleCreate = async () => {
        if (!canSubmit || creatingRef.current) return;

        const dto: CreateWorkItemRequestDto = {
            type: WorkItemType.Story,
            title: title.trim(),
            projectId,
            priority: 2,
            statusId: WorkItemStatus.Backlog,
            concurrencyVersion: 1,
            sprintId,
            parentId,
        };

        creatingRef.current = true;
        try {
            const created = await create(dto);
            if (!created) {
                inputRef.current?.focus();
            }
        } finally {
            creatingRef.current = false;
        }
    };

    const context = label ? ` in ${label}` : '';

    return (
        <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
                <Plus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={`Add a work item${context}...`}
                    aria-label={`Work item title${context}`}
                    className="w-full pl-9 pr-3 py-3 text-sm rounded-lg border border-dashed border-border bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:border-solid transition-all"
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreate();
                        }
                        if (e.key === 'Escape') {
                            e.stopPropagation();
                            setTitle('');
                        }
                    }}
                />
            </div>

            <button
                type="button"
                onClick={handleCreate}
                disabled={!canSubmit}
                aria-label={`Create work item${context}`}
                className="shrink-0 flex items-center gap-1.5 px-3 py-3.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Add
            </button>

            {onAdvanced && (
                <button
                    type="button"
                    onClick={onAdvanced}
                    data-create-trigger={triggerKey}
                    aria-expanded={advancedActive}
                    className="shrink-0 flex items-center gap-0.5 px-2 py-3.5 text-xs font-medium text-slate-500 hover:text-primary rounded-lg hover:bg-accent/50 transition-colors"
                >
                    Full form <ChevronRight size={14} />
                </button>
            )}
        </div>
    );
}
