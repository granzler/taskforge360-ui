'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { WorkItemDto } from '@/domain/entities/WorkItem';
import { WorkItemType } from '@/domain/types';
import { useEpicsByProject } from '../hooks/useEpicsByProject';
import { useWorkItem } from '../hooks/useWorkItem';

interface WorkItemBreadcrumbProps {
    workItem: WorkItemDto;
}

interface BreadcrumbItem {
    label: string;
    href?: string;
}

/**
 * Path of the current work item: Backlog → Project → Epic → Parent → WI-id.
 *
 * The DTO only carries the parent id/title, so the Epic level is resolved from
 * the project's epic list. Epics are not work items (the work item endpoint
 * rejects them), which is why the parent is only fetched once it is known to
 * be a Story/Bug/Spike — a Task's parent always is.
 */
export default function WorkItemBreadcrumb({ workItem }: WorkItemBreadcrumbProps) {
    const { data: epics = [], isLoading: isLoadingEpics, isError: isEpicsError } = useEpicsByProject(
        workItem.projectId
    );

    const parentIsEpic = !!workItem.parentId && epics.some(epic => epic.id === workItem.parentId);
    const parentIsWorkItem =
        !!workItem.parentId &&
        (workItem.type === WorkItemType.Task || (!isLoadingEpics && !isEpicsError && !parentIsEpic));

    const { data: parent } = useWorkItem(parentIsWorkItem ? workItem.parentId : undefined);

    const items: BreadcrumbItem[] = [{ label: 'Backlog', href: '/backlog' }];

    if (workItem.projectName) {
        items.push({ label: workItem.projectName });
    }

    const epicTitle = parentIsWorkItem ? parent?.parentTitle : workItem.parentTitle;
    if (epicTitle) {
        items.push({ label: epicTitle });
    }

    if (parentIsWorkItem) {
        items.push({
            label: workItem.parentTitle || `WI-${workItem.parentId}`,
            href: `/workitems/${workItem.parentId}`,
        });
    }

    items.push({ label: `WI-${workItem.id}` });

    return (
        <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                            {index === 0 && <ArrowLeft size={14} aria-hidden="true" />}
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    title={item.label}
                                    className="max-w-[14rem] truncate font-medium transition-colors hover:text-primary hover:underline underline-offset-2"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    aria-current={isLast ? 'page' : undefined}
                                    title={item.label}
                                    className={`max-w-[14rem] truncate ${isLast ? 'font-bold text-foreground' : ''}`}
                                >
                                    {item.label}
                                </span>
                            )}
                            {!isLast && (
                                <ChevronRight size={13} className="shrink-0 text-slate-400" aria-hidden="true" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
