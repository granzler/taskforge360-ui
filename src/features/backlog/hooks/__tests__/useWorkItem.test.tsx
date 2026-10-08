import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useWorkItem } from '../useWorkItem';
import { WorkItemDto } from '@/domain/entities/WorkItem';

vi.mock('@/infrastructure/services/workItemService', () => ({
  workItemService: {
    getById: vi.fn(),
  },
}));

import { workItemService } from '@/infrastructure/services/workItemService';

const mockService = workItemService as ReturnType<typeof vi.mocked<typeof workItemService>>;

const mockItem: WorkItemDto = {
  id: 7,
  type: 1, // Story
  title: 'As a user I want to log in',
  statusId: 6,
  statusName: 'Backlog',
  priority: 2,
  projectId: 1,
  concurrencyVersion: 3,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('useWorkItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches a work item by id', async () => {
    mockService.getById.mockResolvedValue({ success: true, data: mockItem });

    const { result } = renderHook(() => useWorkItem(7), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockService.getById).toHaveBeenCalledWith(7);
    expect(result.current.data).toEqual(mockItem);
  });

  it('exposes the error message when the service fails', async () => {
    mockService.getById.mockResolvedValue({
      success: false,
      errors: [{ code: 'NOT_FOUND', message: 'Work item not found', type: 'Error' }],
    });

    const { result } = renderHook(() => useWorkItem(99), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('Work item not found');
  });

  it('does not fetch when no id is provided', () => {
    renderHook(() => useWorkItem(undefined), { wrapper: createWrapper() });

    expect(mockService.getById).not.toHaveBeenCalled();
  });
});
