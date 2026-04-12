import { describe, it, expect, beforeEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api from '@/infrastructure/api/axios';
import { userStoryService } from '@/infrastructure/services/userStoryService';
import { CreateUserstoryRequestDto } from '@/domain/entities/UserStory';

// Mock next-auth/react to prevent fetch errors during tests
vi.mock('next-auth/react', () => ({
  getSession: vi.fn().mockResolvedValue({ accessToken: 'fake-token' }),
  signOut: vi.fn(),
}));

describe('userStoryService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  it('should create a user story successfully', async () => {
    const createRequest: CreateUserstoryRequestDto = {
      title: 'Test User Story',
      description: 'Test Description',
      projectId: 1,
      epicId: 1,
      sprintId: 1,
      priority: 'High' as any,
      status: 'Todo' as any
    };

    const responseData = {
      isSuccess: true,
      value: {
        id: 1,
        ...createRequest
      }
    };

    mock.onPost('/api/userstories').reply(200, responseData);

    const result = await userStoryService.create(createRequest);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.id).toBe(1);
    expect(result.value?.title).toBe('Test User Story');
  });
});
