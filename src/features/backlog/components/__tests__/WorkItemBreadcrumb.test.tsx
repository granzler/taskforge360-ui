import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import WorkItemBreadcrumb from '../WorkItemBreadcrumb';
import { WorkItemDto } from '@/domain/entities/WorkItem';
import { WorkItemStatus, WorkItemType } from '@/domain/types';

const hooks = vi.hoisted(() => ({
    useEpicsByProject: vi.fn(),
    useWorkItem: vi.fn(),
}));

vi.mock('../../hooks/useEpicsByProject', () => ({
    useEpicsByProject: hooks.useEpicsByProject,
}));

vi.mock('../../hooks/useWorkItem', () => ({
    useWorkItem: hooks.useWorkItem,
}));

vi.mock('next/link', () => ({
    default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

const baseItem: WorkItemDto = {
    id: 11,
    type: WorkItemType.Task,
    title: 'Create login UI',
    statusId: WorkItemStatus.ToDo,
    statusName: 'To Do',
    priority: 2,
    projectId: 1,
    projectName: 'TaskForge360',
    parentId: 5,
    parentTitle: 'Login flow',
    concurrencyVersion: 1,
};

const epics = [{ id: 1, title: 'Epic A' }];

describe('WorkItemBreadcrumb', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        hooks.useEpicsByProject.mockReturnValue({ data: epics, isLoading: false, isError: false });
        hooks.useWorkItem.mockReturnValue({ data: undefined });
    });

    it('shows the full path of a task: Backlog / project / epic / story / WI-id', () => {
        hooks.useWorkItem.mockImplementation((id?: number) => ({
            data: id === 5 ? { ...baseItem, id: 5, type: WorkItemType.Story, parentId: 1, parentTitle: 'Epic A' } : undefined,
        }));

        render(<WorkItemBreadcrumb workItem={baseItem} />);

        expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Backlog' })).toHaveAttribute('href', '/backlog');
        expect(screen.getByText('TaskForge360')).toBeInTheDocument();
        expect(screen.getByText('Epic A')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Login flow' })).toHaveAttribute('href', '/workitems/5');
        expect(screen.getByText('WI-11')).toHaveAttribute('aria-current', 'page');
    });

    it('renders the epic of a story as text, without fetching it as a work item', () => {
        const story: WorkItemDto = {
            ...baseItem,
            id: 2,
            type: WorkItemType.Story,
            parentId: 1,
            parentTitle: 'Epic A',
        };

        render(<WorkItemBreadcrumb workItem={story} />);

        expect(screen.getByText('Epic A')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Epic A' })).not.toBeInTheDocument();
        expect(screen.getByText('WI-2')).toHaveAttribute('aria-current', 'page');
        // Epics are rejected by the work item endpoint, so they are never fetched.
        expect(hooks.useWorkItem).toHaveBeenCalledWith(undefined);
    });

    it('links a non-epic parent and shows the epic above it', () => {
        const bug: WorkItemDto = {
            ...baseItem,
            id: 3,
            type: WorkItemType.Bug,
            parentId: 2,
            parentTitle: 'Creación de subtask',
        };
        hooks.useWorkItem.mockImplementation((id?: number) => ({
            data: id === 2 ? { ...baseItem, id: 2, type: WorkItemType.Story, parentId: 1, parentTitle: 'Epic A' } : undefined,
        }));

        render(<WorkItemBreadcrumb workItem={bug} />);

        expect(screen.getByText('Epic A')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Creación de subtask' })).toHaveAttribute('href', '/workitems/2');
        expect(screen.getByText('WI-3')).toHaveAttribute('aria-current', 'page');
    });
});
