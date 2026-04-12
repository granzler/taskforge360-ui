import { describe, it, expect, beforeEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api from '@/infrastructure/api/axios';
import { userStoryService } from '@/infrastructure/services/userStoryService';
import { CreateUserStoryRequestDto, UserStoryDto } from '@/domain/entities/UserStory';

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
    const createRequest: CreateUserStoryRequestDto = {
      title: 'Test User Story',
      description: 'Test Description',
      projectId: 1,
      epicId: 1,
      sprintId: 1,
      priority: 1,
      statusId: 1
    };

    const responseDto: UserStoryDto = {
      id: 1,
      title: 'Test User Story',
      description: 'Test Description',
      projectId: 1,
      epicId: 1,
      sprintId: 1,
      priority: 1,
      statusId: 1,
      statusName: 'To Do'
    };

    const responseData = {
      success: true,
      data: responseDto
    };

    mock.onPost('/api/userstories').reply(200, responseData);

    const result = await userStoryService.create(createRequest);

    expect(result.success).toBe(true);
    if (result.success && 'data' in result) {
      expect(result.data.id).toBe(1);
      expect(result.data.title).toBe('Test User Story');
    }
  });
});
