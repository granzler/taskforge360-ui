import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpdateWorkItem } from '../useUpdateWorkItem';

vi.mock('@/infrastructure/services/workItemService', () => ({
  workItemService: {
    update: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { workItemService } from '@/infrastructure/services/workItemService';
import { toast } from 'react-hot-toast';
import { UpdateWorkItemRequestDto } from '@/domain/entities/WorkItem';

const mockService = workItemService as ReturnType<typeof vi.mocked<typeof workItemService>>;
const mockToast = toast as ReturnType<typeof vi.mocked<typeof toast>>;

describe('useUpdateWorkItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update work item successfully', async () => {
    const mockItem = {
      id: 1,
      type: 1,
      title: 'Updated Item',
      statusId: 2,
      statusName: 'To Do',
      priority: 2,
      projectId: 1,
      concurrencyVersion: 1,
    };

    mockService.update.mockResolvedValue({
      success: true,
      data: mockItem,
    });

    const { result } = renderHook(() => useUpdateWorkItem());

    await act(async () => {
      const success = await result.current.update(1, {
        title: 'Updated Item',
        statusId: 2,
        priority: 2,
        projectId: 1,
        concurrencyVersion: 1,
      } as UpdateWorkItemRequestDto);
      expect(success).toBe(true);
    });

    expect(mockService.update).toHaveBeenCalledWith(1, {
      title: 'Updated Item',
      statusId: 2,
      priority: 2,
      projectId: 1,
      concurrencyVersion: 1,
    });
    expect(mockToast.success).toHaveBeenCalledWith('"Updated Item" updated!');
  });

  it('should handle update failure', async () => {
    mockService.update.mockResolvedValue({
      success: false,
      errors: [{ code: 'VALIDATION_ERROR', message: 'Validation error', type: 'Validation' }],
    });

    const { result } = renderHook(() => useUpdateWorkItem());

    await act(async () => {
      const success = await result.current.update(1, {
        title: 'Failed Update',
        statusId: 2,
        priority: 2,
        projectId: 1,
      } as UpdateWorkItemRequestDto);
      expect(success).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Validation error');
  });

  it('should handle exception', async () => {
    mockService.update.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUpdateWorkItem());

    await act(async () => {
      const success = await result.current.update(1, {
        title: 'Test',
        statusId: 2,
        priority: 2,
        projectId: 1,
      } as UpdateWorkItemRequestDto);
      expect(success).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Network error');
  });

  it('should set loading state during update', async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockService.update.mockReturnValue(promise as never);

    const { result } = renderHook(() => useUpdateWorkItem());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.update(1, {
        title: 'Test',
        statusId: 2,
        priority: 2,
        projectId: 1,
      } as UpdateWorkItemRequestDto);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({ success: true, data: { id: 1, type: 1, title: 'Test', statusId: 2, priority: 2, projectId: 1 } });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should call onSuccess callback', async () => {
    const mockItem = {
      id: 1,
      type: 1,
      title: 'Success Item',
      statusId: 3,
      statusName: 'In Progress',
      priority: 3,
      projectId: 1,
      concurrencyVersion: 1,
    };

    mockService.update.mockResolvedValue({
      success: true,
      data: mockItem,
    });

    const onSuccess = vi.fn();

    const { result } = renderHook(() => useUpdateWorkItem({ onSuccess }));

    await act(async () => {
      await result.current.update(1, {
        title: 'Success Item',
        statusId: 3,
        priority: 3,
        projectId: 1,
        concurrencyVersion: 1,
      } as UpdateWorkItemRequestDto);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockItem);
  });

  it('should call onError callback on failure', async () => {
    mockService.update.mockResolvedValue({
      success: false,
      errors: [{ code: 'ERROR', message: 'Error', type: 'Error' }],
    });

    const onError = vi.fn();

    const { result } = renderHook(() => useUpdateWorkItem({ onError }));

    await act(async () => {
      await result.current.update(1, {
        title: 'Test',
        statusId: 2,
        priority: 2,
        projectId: 1,
      } as UpdateWorkItemRequestDto);
    });

    expect(onError).toHaveBeenCalledWith('Error');
  });
});
