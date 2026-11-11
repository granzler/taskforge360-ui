import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useWorkItemStatuses } from '../useWorkItemStatuses';
import { WorkItemStatusDto } from '@/domain/entities/WorkItem';
import { WorkItemType, WORK_ITEM_STATUS_OPTIONS } from '@/domain/types';

vi.mock('@/infrastructure/services/workItemService', () => ({
  workItemService: {
    getStatuses: vi.fn(),
  },
}));

import { workItemService } from '@/infrastructure/services/workItemService';

const mockService = workItemService as ReturnType<typeof vi.mocked<typeof workItemService>>;

const mockStatuses: WorkItemStatusDto[] = [
  { id: 1, name: 'Backlog', workItemType: WorkItemType.Epic, concurrencyVersion: 0 },
  { id: 8, name: 'In Progress', workItemType: WorkItemType.Story, concurrencyVersion: 0 },
  { id: 15, name: 'Blocked', workItemType: WorkItemType.Story, concurrencyVersion: 0 },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('useWorkItemStatuses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the child statuses returned by the backend', async () => {
    mockService.getStatuses.mockResolvedValue({ success: true, data: mockStatuses });

    const { result } = renderHook(() => useWorkItemStatuses(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockService.getStatuses).toHaveBeenCalled();
    // Epic statuses (id 1) are excluded from child work item selects.
    expect(result.current.options).toEqual([
      { id: 8, label: 'In Progress' },
      { id: 15, label: 'Blocked' },
    ]);
  });

  it('falls back to the local options when the endpoint returns nothing', async () => {
    mockService.getStatuses.mockResolvedValue({ success: true, data: [] });

    const { result } = renderHook(() => useWorkItemStatuses(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.options).toEqual(WORK_ITEM_STATUS_OPTIONS);
  });

  it('falls back to the local options when the endpoint fails', async () => {
    mockService.getStatuses.mockResolvedValue({
      success: false,
      errors: [{ code: 'ERROR', message: 'boom', type: 'Error' }],
    });

    const { result } = renderHook(() => useWorkItemStatuses(), { wrapper: createWrapper() });

    // The hook retries once before giving up.
    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });

    expect(result.current.options).toEqual(WORK_ITEM_STATUS_OPTIONS);
  });
});
