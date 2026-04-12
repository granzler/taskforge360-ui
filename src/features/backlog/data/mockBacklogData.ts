import { Epic, SubTask } from '@/domain/entities/Project';

export const mockEpics: Epic[] = [
    {
        id: 1,
        title: 'User Authentication & Profile',
        description: 'Implementation of full user life cycle including login, registration, and profile management.',
        priority: 'High',
        status: 'In Progress',
        projectId: 1,
        assigneeId: '1'
    },
    {
        id: 2,
        title: 'Backlog & Sprint Management',
        description: 'Core functionality for managing work items and sprints.',
        priority: 'Critical',
        status: 'In Progress',
        projectId: 1,
        assigneeId: '2'
    }
];


export const mockSubTasks: SubTask[] = [
    {
        id: 1,
        title: 'Create Login UI',
        description: 'Design and implement the login form.',
        priority: 'High',
        status: 'In Progress',
        userStoryId: 1
    },
    {
        id: 2,
        title: 'Setup Auth Service',
        description: 'Connect login form to backend API.',
        priority: 'High',
        status: 'To Do',
        userStoryId: 1
    }
];
