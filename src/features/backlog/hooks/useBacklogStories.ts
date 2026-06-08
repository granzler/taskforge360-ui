import { useQuery } from '@tanstack/react-query';
import { UserStoryDto } from '@/domain/entities/UserStory';
import { userStoryService } from '@/infrastructure/services/userStoryService';

export function useBacklogStories(projectId: number | undefined, sprintIds: number[]) {
    return useQuery<UserStoryDto[]>({
        queryKey: ['backlog-stories', projectId, ...sprintIds],
        queryFn: async () => {
            const allStories: UserStoryDto[] = [];

            const backlogResult = await userStoryService.getBacklog(projectId!);
            if (backlogResult.success) {
                allStories.push(...backlogResult.data);
            }

            const sprintResults = await Promise.all(
                sprintIds.map(id => userStoryService.getBySprint(id))
            );
            for (const result of sprintResults) {
                if (result.success) {
                    allStories.push(...result.data);
                }
            }

            return allStories;
        },
        enabled: !!projectId,
    });
}
