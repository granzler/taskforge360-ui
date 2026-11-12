import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSubtasks } from '../useSubtasks';
import { WorkItemDto } from '@/domain/entities/WorkItem';
import { WorkItemType } from '@/domain/types';

vi.mock('@/infrastructure/services/workItemService', () => ({
  workItemService: {
    getTasksByParent: vi.fn(),
  },
}));

import { workItemService } from '@/infrastructure/services/workItemService';

const mockService = workItemService as ReturnType<typeof vi.mocked<typeof workItemService>>;

const mockTask: WorkItemDto = {
  id: 11,
  type: WorkItemType.Task,
  title: 'Create login UI',
  statusId: 7,
  statusName: 'To Do',
  priority: 2,
  projectId: 1,
  parentId: 5,
  concurrencyVersion: 1,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('useSubtasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the child tasks of a parent through the parent endpoint', async () => {
    mockService.getTasksByParent.mockResolvedValue({ success: true, data: [mockTask] });

    const { result } = renderHook(() => useSubtasks(5), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockService.getTasksByParent).toHaveBeenCalledWith(5);
    expect(result.current.data).toEqual([mockTask]);
  });

  it('exposes the error message when the service fails', async () => {
    mockService.getTasksByParent.mockResolvedValue({
      success: false,
      errors: [{ code: 'WorkItem.ParentNotFound', message: 'Parent with id 5 not found.', type: 'NotFound' }],
    });

    const { result } = renderHook(() => useSubtasks(5), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect((result.current.error as Error).message).toBe('Parent with id 5 not found.');
  });

  it('does not fetch when no parent id is provided', () => {
    renderHook(() => useSubtasks(undefined), { wrapper: createWrapper() });

    expect(mockService.getTasksByParent).not.toHaveBeenCalled();
  });

  it('does not fetch when disabled (e.g. the parent is a Task)', () => {
    renderHook(() => useSubtasks(5, { enabled: false }), { wrapper: createWrapper() });

    expect(mockService.getTasksByParent).not.toHaveBeenCalled();
  });
});
