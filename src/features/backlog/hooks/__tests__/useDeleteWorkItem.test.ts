import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeleteWorkItem } from '../useDeleteWorkItem';

vi.mock('@/infrastructure/services/workItemService', () => ({
  workItemService: {
    delete: vi.fn(),
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

const mockService = workItemService as ReturnType<typeof vi.mocked<typeof workItemService>>;
const mockToast = toast as ReturnType<typeof vi.mocked<typeof toast>>;

describe('useDeleteWorkItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a work item and notifies success', async () => {
    mockService.delete.mockResolvedValue({ success: true, data: null });

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useDeleteWorkItem({ onSuccess }));

    await act(async () => {
      const success = await result.current.remove(4, 'Old task');
      expect(success).toBe(true);
    });

    expect(mockService.delete).toHaveBeenCalledWith(4);
    expect(mockToast.success).toHaveBeenCalledWith('"Old task" deleted.');
    expect(onSuccess).toHaveBeenCalledWith(4);
  });

  it('surfaces the backend error message on failure', async () => {
    mockService.delete.mockResolvedValue({
      success: false,
      errors: [
        {
          code: 'WorkItem.HasDependencies',
          message: 'Cannot delete Task because it has associated child work items.',
          type: 'Conflict',
        },
      ],
    });

    const onError = vi.fn();
    const { result } = renderHook(() => useDeleteWorkItem({ onError }));

    await act(async () => {
      const success = await result.current.remove(4, 'Parent task');
      expect(success).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith(
      'Cannot delete Task because it has associated child work items.'
    );
    expect(result.current.error).toBe(
      'Cannot delete Task because it has associated child work items.'
    );
    expect(onError).toHaveBeenCalledWith(
      'Cannot delete Task because it has associated child work items.'
    );
  });

  it('handles exceptions', async () => {
    mockService.delete.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDeleteWorkItem());

    await act(async () => {
      const success = await result.current.remove(4, 'Task');
      expect(success).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Network error');
  });

  it('tracks the loading state', async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockService.delete.mockReturnValue(promise as never);

    const { result } = renderHook(() => useDeleteWorkItem());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.remove(4, 'Task');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({ success: true, data: null });
    });

    expect(result.current.isLoading).toBe(false);
  });
});
