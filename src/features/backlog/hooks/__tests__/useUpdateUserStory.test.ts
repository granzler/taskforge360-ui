import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpdateUserStory } from '../useUpdateUserStory';

vi.mock('@/infrastructure/services/userStoryService', () => ({
  userStoryService: {
    update: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { userStoryService } from '@/infrastructure/services/userStoryService';
import { toast } from 'react-hot-toast';
import { UpdateUserStoryRequestDto } from '@/domain/entities/UserStory';

const mockUserStoryService = userStoryService as ReturnType<typeof vi.mocked<typeof userStoryService>>;
const mockToast = toast as ReturnType<typeof vi.mocked<typeof toast>>;

describe('useUpdateUserStory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user story successfully', async () => {
    const mockStory = {
      id: 1,
      title: 'Updated Story',
      statusId: 2,
      statusName: 'To Do',
      priority: 2,
      projectId: 1,
      concurrencyVersion: 1,
    };

    mockUserStoryService.update.mockResolvedValue({
      success: true,
      data: mockStory,
    });

    const { result } = renderHook(() => useUpdateUserStory());

    await act(async () => {
      const success = await result.current.update(1, {
        title: 'Updated Story',
        statusId: 2,
        priority: 2,
        projectId: 1,
        concurrencyVersion: 1,
      } as UpdateUserStoryRequestDto);
      expect(success).toBe(true);
    });

    expect(mockUserStoryService.update).toHaveBeenCalledWith(1, {
      title: 'Updated Story',
      statusId: 2,
      priority: 2,
      projectId: 1,
      concurrencyVersion: 1,
    });
    expect(mockToast.success).toHaveBeenCalledWith('User story "Updated Story" updated!');
  });

  it('should handle update failure', async () => {
    mockUserStoryService.update.mockResolvedValue({
      success: false,
      errors: [{ code: 'VALIDATION_ERROR', message: 'Validation error', type: 'Validation' }],
    });

    const { result } = renderHook(() => useUpdateUserStory());

    await act(async () => {
      const success = await result.current.update(1, {
        title: 'Failed Update',
        statusId: 2,
        priority: 2,
        projectId: 1,
      } as UpdateUserStoryRequestDto);
      expect(success).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Validation error');
  });

  it('should handle exception', async () => {
    mockUserStoryService.update.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUpdateUserStory());

    await act(async () => {
      const success = await result.current.update(1, {
        title: 'Test',
        statusId: 2,
        priority: 2,
        projectId: 1,
      } as UpdateUserStoryRequestDto);
      expect(success).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Network error');
  });

  it('should set loading state during update', async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockUserStoryService.update.mockReturnValue(promise as never);

    const { result } = renderHook(() => useUpdateUserStory());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.update(1, {
        title: 'Test',
        statusId: 2,
        priority: 2,
        projectId: 1,
      } as UpdateUserStoryRequestDto);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({ success: true, data: { id: 1, title: 'Test', statusId: 2, priority: 2, projectId: 1 } });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should call onSuccess callback', async () => {
    const mockStory = {
      id: 1,
      title: 'Success Story',
      statusId: 3,
      statusName: 'In Progress',
      priority: 3,
      projectId: 1,
      concurrencyVersion: 1,
    };

    mockUserStoryService.update.mockResolvedValue({
      success: true,
      data: mockStory,
    });

    const onSuccess = vi.fn();

    const { result } = renderHook(() => useUpdateUserStory({ onSuccess }));

    await act(async () => {
      await result.current.update(1, {
        title: 'Success Story',
        statusId: 3,
        priority: 3,
        projectId: 1,
        concurrencyVersion: 1,
      } as UpdateUserStoryRequestDto);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockStory);
  });

  it('should call onError callback on failure', async () => {
    mockUserStoryService.update.mockResolvedValue({
      success: false,
      errors: [{ code: 'ERROR', message: 'Error', type: 'Error' }],
    });

    const onError = vi.fn();

    const { result } = renderHook(() => useUpdateUserStory({ onError }));

    await act(async () => {
      await result.current.update(1, {
        title: 'Test',
        statusId: 2,
        priority: 2,
        projectId: 1,
      } as UpdateUserStoryRequestDto);
    });

    expect(onError).toHaveBeenCalledWith('Error');
  });
});