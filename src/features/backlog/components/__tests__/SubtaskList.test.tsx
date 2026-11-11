import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubtaskList from '../SubtaskList';
import { WorkItemDto, WorkItemStatusDto } from '@/domain/entities/WorkItem';
import { WorkItemType, WorkItemStatus } from '@/domain/types';

const permissionState = vi.hoisted(() => ({ scopes: [] as string[] }));

vi.mock('@/features/auth/hooks/usePermission', () => ({
  usePermission: () => ({
    hasScope: (scope: string) => permissionState.scopes.includes(scope),
  }),
}));

vi.mock('@/infrastructure/services/workItemService', () => ({
  workItemService: {
    getTasksByParent: vi.fn(),
    getStatuses: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Assignees are Keycloak ids; the avatar resolves them against the project team.
vi.mock('@/features/projects/hooks/useProjectUsers', () => ({
  useProjectUsers: () => ({
    data: [
      { id: 'user-2', username: 'jsmith', displayName: 'Jane Smith', email: 'jane@example.com' },
    ],
    isLoading: false,
  }),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Next's Link needs the app router context, so it is replaced by a plain anchor.
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock('../UserStoryAssigneeSelector', () => ({
  default: ({ onAssign }: { onAssign: (user: unknown) => void }) => (
    <button
      type="button"
      onClick={() => onAssign({ id: 'user-1', username: 'user-1', displayName: 'User One', email: '' })}
    >
      Pick assignee
    </button>
  ),
}));

import { workItemService } from '@/infrastructure/services/workItemService';

const mockService = workItemService as ReturnType<typeof vi.mocked<typeof workItemService>>;

const parent: WorkItemDto = {
  id: 5,
  type: WorkItemType.Story,
  title: 'Login flow',
  statusId: WorkItemStatus.Backlog,
  statusName: 'Backlog',
  priority: 2,
  projectId: 1,
  concurrencyVersion: 1,
};

const todoTask: WorkItemDto = {
  id: 11,
  type: WorkItemType.Task,
  title: 'Create login UI',
  statusId: WorkItemStatus.ToDo,
  statusName: 'To Do',
  priority: 2,
  projectId: 1,
  parentId: 5,
  assignedTo: 'user-2',
  concurrencyVersion: 4,
};

const doneTask: WorkItemDto = {
  id: 12,
  type: WorkItemType.Task,
  title: 'Setup auth service',
  statusId: WorkItemStatus.Done,
  statusName: 'Done',
  priority: 1,
  projectId: 1,
  parentId: 5,
  concurrencyVersion: 2,
};

const statuses: WorkItemStatusDto[] = [
  { id: WorkItemStatus.ToDo, name: 'To Do', workItemType: WorkItemType.Story, concurrencyVersion: 0 },
  { id: WorkItemStatus.InProgress, name: 'In Progress', workItemType: WorkItemType.Story, concurrencyVersion: 0 },
  { id: WorkItemStatus.Done, name: 'Done', workItemType: WorkItemType.Story, concurrencyVersion: 0 },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

const renderSubtasks = (item: WorkItemDto = parent) =>
  render(<SubtaskList parent={item} />, { wrapper: createWrapper() });

describe('SubtaskList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    permissionState.scopes = [];
    mockService.getTasksByParent.mockResolvedValue({ success: true, data: [todoTask, doneTask] });
    mockService.getStatuses.mockResolvedValue({ success: true, data: statuses });
  });

  it('lists the subtasks and shows the progress', async () => {
    renderSubtasks();

    expect(await screen.findByText('Create login UI')).toBeInTheDocument();
    expect(screen.getByText('Setup auth service')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Subtask progress' })).toHaveAttribute('aria-valuenow', '50');
    expect(mockService.getTasksByParent).toHaveBeenCalledWith(5);
  });

  it('shows the assignee as an initials avatar with name and email on hover', async () => {
    renderSubtasks();

    const avatar = await screen.findByRole('img', { name: 'Assigned to Jane Smith' });
    expect(avatar).toHaveTextContent('JS');
    expect(screen.getByRole('tooltip')).toHaveTextContent('Jane Smith');
    expect(screen.getByRole('tooltip')).toHaveTextContent('jane@example.com');
    // The raw Keycloak id must never be rendered.
    expect(screen.queryByText('user-2')).not.toBeInTheDocument();
  });

  it('shows the empty state when the parent has no subtasks', async () => {
    mockService.getTasksByParent.mockResolvedValue({ success: true, data: [] });

    renderSubtasks();

    expect(await screen.findByText('No subtasks yet.')).toBeInTheDocument();
  });

  it('renders nothing when the parent is a Task', () => {
    const { container } = renderSubtasks({ ...parent, type: WorkItemType.Task });

    expect(container).toBeEmptyDOMElement();
    expect(mockService.getTasksByParent).not.toHaveBeenCalled();
  });

  it('hides the quick create row and disables editing without permissions', async () => {
    renderSubtasks();

    await screen.findByText('Create login UI');

    expect(screen.queryByPlaceholderText('Add a subtask...')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Status for Create login UI')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Edit assignee for Create login UI' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete Create login UI' })).not.toBeInTheDocument();
  });

  it('creates a subtask from the quick create row', async () => {
    permissionState.scopes = ['workitems:create'];
    mockService.create.mockResolvedValue({
      success: true,
      data: { ...todoTask, id: 99, title: 'Write tests' },
    });

    renderSubtasks();

    const input = await screen.findByPlaceholderText('Add a subtask...');
    await userEvent.type(input, 'Write tests{Enter}');

    await waitFor(() =>
      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: WorkItemType.Task,
          title: 'Write tests',
          projectId: 1,
          parentId: 5,
          statusId: WorkItemStatus.ToDo,
        })
      )
    );
  });

  it('updates the status inline and keeps the concurrency version', async () => {
    permissionState.scopes = ['workitems:update'];
    mockService.update.mockResolvedValue({ success: true, data: { ...todoTask, statusId: WorkItemStatus.InProgress } });

    renderSubtasks();

    const select = await screen.findByLabelText('Status for Create login UI');
    fireEvent.change(select, { target: { value: String(WorkItemStatus.InProgress) } });

    await waitFor(() =>
      expect(mockService.update).toHaveBeenCalledWith(
        11,
        expect.objectContaining({
          statusId: WorkItemStatus.InProgress,
          title: 'Create login UI',
          priority: 2,
          projectId: 1,
          parentId: 5,
          concurrencyVersion: 4,
        })
      )
    );
    // Labels are not part of an inline status change.
    expect(mockService.update).not.toHaveBeenCalledWith(11, expect.objectContaining({ labelIds: expect.anything() }));
  });

  it('reassigns a subtask from the inline editor', async () => {
    permissionState.scopes = ['workitems:update'];
    mockService.update.mockResolvedValue({ success: true, data: todoTask });

    renderSubtasks();

    await userEvent.click(await screen.findByRole('button', { name: 'Edit assignee for Create login UI' }));
    await userEvent.click(screen.getByRole('button', { name: 'Pick assignee' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockService.update).toHaveBeenCalledWith(
        11,
        expect.objectContaining({ assignedTo: 'user-1' })
      )
    );
  });

  it('deletes a subtask after confirmation', async () => {
    permissionState.scopes = ['workitems:delete'];
    mockService.delete.mockResolvedValue({ success: true, data: null });

    renderSubtasks();

    await userEvent.click(await screen.findByRole('button', { name: 'Delete Create login UI' }));
    expect(screen.getByText('Delete “Create login UI”?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^Delete$/ }));

    await waitFor(() => expect(mockService.delete).toHaveBeenCalledWith(11));
  });
});
