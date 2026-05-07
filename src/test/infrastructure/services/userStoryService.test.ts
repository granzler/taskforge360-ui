import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateUserStory } from '../../../features/backlog/hooks/useCreateUserStory';
import { CreateUserStoryRequestDto, UserStoryDto } from '@/domain/entities/UserStory';

vi.mock('@/infrastructure/services/userStoryService', () => ({
  userStoryService: {
    create: vi.fn(),
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

const mockUserStoryService = userStoryService as ReturnType<typeof vi.mocked<typeof userStoryService>>;
const mockToast = toast as ReturnType<typeof vi.mocked<typeof toast>>;

describe('useCreateUserStory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create user story successfully', async () => {
    const mockStory: UserStoryDto = {
      id: 1,
      title: 'New Story',
      statusId: 1,
      statusName: 'Backlog',
      priority: 2,
      projectId: 1,
      concurrencyVersion: 1,
    };

    mockUserStoryService.create.mockResolvedValue({
      success: true,
      data: mockStory,
    });

    const { result } = renderHook(() => useCreateUserStory());

    await act(async () => {
      const success = await result.current.create({
        title: 'New Story',
        statusId: 1,
        priority: 2,
        projectId: 1,
      } as CreateUserStoryRequestDto);
      expect(success).toBe(true);
    });

    expect(mockUserStoryService.create).toHaveBeenCalledWith({
      title: 'New Story',
      statusId: 1,
      priority: 2,
      projectId: 1,
    });
    expect(mockToast.success).toHaveBeenCalledWith('User story "New Story" created!');
  });

  it('should handle create failure', async () => {
    mockUserStoryService.create.mockResolvedValue({
      success: false,
      errors: [{ code: 'VALIDATION_ERROR', message: 'Title required', type: 'Validation' }],
    });

    const { result } = renderHook(() => useCreateUserStory());

    await act(async () => {
      const success = await result.current.create({
        title: '',
        statusId: 1,
        priority: 2,
        projectId: 1,
      } as CreateUserStoryRequestDto);
      expect(success).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Title required');
  });

  it('should handle exception', async () => {
    mockUserStoryService.create.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCreateUserStory());

    await act(async () => {
      const success = await result.current.create({
        title: 'Test',
        statusId: 1,
        priority: 2,
        projectId: 1,
      } as CreateUserStoryRequestDto);
      expect(success).toBe(false);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Could not create user story. Please try again.');
  });

  it('should set loading state during create', async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockUserStoryService.create.mockReturnValue(promise as never);

    const { result } = renderHook(() => useCreateUserStory());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.create({
        title: 'Test',
        statusId: 1,
        priority: 2,
        projectId: 1,
      } as CreateUserStoryRequestDto);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({ success: true, data: { id: 1, title: 'Test', statusId: 1, priority: 2, projectId: 1, concurrencyVersion: 1 } });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should call onSuccess callback', async () => {
    const mockStory: UserStoryDto = {
      id: 1,
      title: 'Created Story',
      statusId: 2,
      statusName: 'To Do',
      priority: 3,
      projectId: 1,
      concurrencyVersion: 1,
    };

    mockUserStoryService.create.mockResolvedValue({
      success: true,
      data: mockStory,
    });

    const onSuccess = vi.fn();

    const { result } = renderHook(() => useCreateUserStory({ onSuccess }));

    await act(async () => {
      await result.current.create({
        title: 'Created Story',
        statusId: 2,
        priority: 3,
        projectId: 1,
      } as CreateUserStoryRequestDto);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockStory);
  });

  it('should call onError callback on failure', async () => {
    mockUserStoryService.create.mockResolvedValue({
      success: false,
      errors: [{ code: 'ERROR', message: 'Error', type: 'Error' }],
    });

    const onError = vi.fn();

    const { result } = renderHook(() => useCreateUserStory({ onError }));

    await act(async () => {
      await result.current.create({
        title: 'Test',
        statusId: 1,
        priority: 2,
        projectId: 1,
      } as CreateUserStoryRequestDto);
    });

    expect(onError).toHaveBeenCalledWith('Error');
  });
});