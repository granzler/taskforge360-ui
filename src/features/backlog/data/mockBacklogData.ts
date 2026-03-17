import { Epic, UserStory, SubTask } from '@/domain/entities/Project';

export const mockEpics: Epic[] = [
    {
        id: 1,
        title: 'User Authentication & Profile',
        description: 'Implementation of full user life cycle including login, registration, and profile management.',
        priority: 'High',
        status: 'In Progress',
        projectId: 1,
        createdAt: '2026-02-20',
        updatedAt: '2026-03-01',
        createdBy: 'Admin',
        assigneeId: '1'
    },
    {
        id: 2,
        title: 'Backlog & Sprint Management',
        description: 'Core functionality for managing work items and sprints.',
        priority: 'Critical',
        status: 'In Progress',
        projectId: 1,
        createdAt: '2026-02-25',
        updatedAt: '2026-03-05',
        createdBy: 'Admin',
        assigneeId: '2'
    }
];

export const mockUserStories: UserStory[] = [
    {
        id: 1,
        title: 'As a user, I want to login with my credentials',
        description: 'Security login with email and password.',
        priority: 'High',
        status: 'In Progress',
        epicId: 1,
        createdAt: '2026-03-01',
        updatedAt: '2026-03-02',
        createdBy: 'Admin',
        sprintId: 2,
        storyPoints: 5,
        acceptanceCriteria: '1. Valid credentials grant access. 2. Invalid credentials show error.'
    },
    {
        id: 2,
        title: 'As a PO, I want to create new Epics',
        description: 'Ability to define high-level features.',
        priority: 'Medium',
        status: 'To Do',
        epicId: 2,
        createdAt: '2026-03-02',
        updatedAt: '2026-03-02',
        createdBy: 'Admin',
        sprintId: 2,
        storyPoints: 3,
        acceptanceCriteria: '1. Save button works. 2. All fields are entryable.'
    },
    {
        id: 3,
        title: 'Unassigned Story 1',
        description: 'This story is not assigned to any sprint yet.',
        priority: 'Low',
        status: 'To Do',
        epicId: 1,
        createdAt: '2026-03-03',
        updatedAt: '2026-03-03',
        createdBy: 'Admin',
        storyPoints: 2,
        acceptanceCriteria: 'Testing unassigned logic.'
    }
];

export const mockSubTasks: SubTask[] = [
    {
        id: 1,
        title: 'Create Login UI',
        description: 'Design and implement the login form.',
        priority: 'High',
        status: 'In Progress',
        userStoryId: 1,
        createdAt: '2026-03-01',
        updatedAt: '2026-03-02',
        createdBy: 'Admin'
    },
    {
        id: 2,
        title: 'Setup Auth Service',
        description: 'Connect login form to backend API.',
        priority: 'High',
        status: 'To Do',
        userStoryId: 1,
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01',
        createdBy: 'Admin'
    }
];
