import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateWorkItem } from '../useCreateWorkItem';
import { CreateWorkItemRequestDto, WorkItemDto } from '@/domain/entities/WorkItem';

vi.mock('@/infrastructure/services/workItemService', () => ({
  workItemService: {
    create: vi.fn(),
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

describe('useCreateWorkItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create work item successfully', async () => {
    const mockItem: WorkItemDto = {
      id: 1,
      type: 1, // Story
      title: 'New Story',
      statusId: 1,
      statusName: 'Backlog',
      priority: 2,
      projectId: 1,
      concurrencyVersion: 1,
    };

    mockService.create.mockResolvedValue({
      success: true,
      data: mockItem,
    });

    const { result } = renderHook(() => useCreateWorkItem());

    await act(async () => {
      const success = await result.current.create({
        type: 1,
        title: 'New Story',
        statusId: 1,
        priority: 2,
        projectId: 1,
        concurrencyVersion: 1,
      } as CreateWorkItemRequestDto);
      expect(success).toBe(true);
    });

    expect(mockService.create).toHaveBeenCalledWith({
      type: 1,
      title: 'New Story',
      statusId: 1,
      priority: 2,
      projectId: 1,
      concurrencyVersion: 1,
    });
    expect(mockToast.success).toHaveBeenCalledWith('Story "New Story" created!');
  });

  it('should handle create failure', async () => {
    mockService.create.mockResolvedValue({
      success: false,
      errors: [{ code: 'VALIDATION_ERROR', message: 'Title required', type: 'Validation' }],
    });

    const { result } = renderHook(() => useCreateWorkItem());

    await act(async () => {
      const success = await result.current.create({
        type: 1,
        title: '',
        statusId: 1,
        priority: 2,
        projectId: 1,
        concurrencyVersion: 1,
      } as CreateWorkItemRequestDto);
      expect(success).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Title required');
  });

  it('should handle exception', async () => {
    mockService.create.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCreateWorkItem());

    await act(async () => {
      const success = await result.current.create({
        type: 1,
        title: 'Test',
        statusId: 1,
        priority: 2,
        projectId: 1,
        concurrencyVersion: 1,
      } as CreateWorkItemRequestDto);
      expect(success).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Network error');
  });

  it('should set loading state during create', async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockService.create.mockReturnValue(promise as never);

    const { result } = renderHook(() => useCreateWorkItem());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.create({
        type: 1,
        title: 'Test',
        statusId: 1,
        priority: 2,
        projectId: 1,
        concurrencyVersion: 1,
      } as CreateWorkItemRequestDto);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({ success: true, data: { id: 1, type: 1, title: 'Test', statusId: 1, priority: 2, projectId: 1, concurrencyVersion: 1 } });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should call onSuccess callback', async () => {
    const mockItem: WorkItemDto = {
      id: 1,
      type: 1,
      title: 'Created Item',
      statusId: 2,
      statusName: 'To Do',
      priority: 3,
      projectId: 1,
      concurrencyVersion: 1,
    };

    mockService.create.mockResolvedValue({
      success: true,
      data: mockItem,
    });

    const onSuccess = vi.fn();

    const { result } = renderHook(() => useCreateWorkItem({ onSuccess }));

    await act(async () => {
      await result.current.create({
        type: 1,
        title: 'Created Item',
        statusId: 2,
        priority: 3,
        projectId: 1,
        concurrencyVersion: 1,
      } as CreateWorkItemRequestDto);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockItem);
  });

  it('should call onError callback on failure', async () => {
    mockService.create.mockResolvedValue({
      success: false,
      errors: [{ code: 'ERROR', message: 'Error', type: 'Error' }],
    });

    const onError = vi.fn();

    const { result } = renderHook(() => useCreateWorkItem({ onError }));

    await act(async () => {
      await result.current.create({
        type: 1,
        title: 'Test',
        statusId: 1,
        priority: 2,
        projectId: 1,
        concurrencyVersion: 1,
      } as CreateWorkItemRequestDto);
    });

    expect(onError).toHaveBeenCalledWith('Error');
  });
});
