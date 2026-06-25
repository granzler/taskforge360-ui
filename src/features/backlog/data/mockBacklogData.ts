// Mock tasks for development/testing.
// In production, tasks are fetched from workItemService.getTasksByParent(parentId).
export const mockWorkItemTasks = [
    {
        id: 1,
        title: 'Create Login UI',
        description: 'Design and implement the login form.',
        priority: 'High',
        status: 'In Progress',
        parentId: 1,
        concurrencyVersion: 1,
    },
    {
        id: 2,
        title: 'Setup Auth Service',
        description: 'Connect login form to backend API.',
        priority: 'High',
        status: 'To Do',
        parentId: 1,
        concurrencyVersion: 1,
    },
];
