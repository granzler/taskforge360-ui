import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserAvatar, { getUserInitials } from '../UserAvatar';
import { UserSearchResult } from '@/domain/entities/User';

const projectUsers = vi.hoisted<UserSearchResult[]>(() => [
    { id: 'u-1', username: 'jsmith', displayName: 'Jane Smith', email: 'jane@example.com' },
]);

vi.mock('../../hooks/useProjectUsers', () => ({
    useProjectUsers: () => ({ data: projectUsers, isLoading: false }),
}));

describe('getUserInitials', () => {
    it('uses the first and last word of the display name', () => {
        expect(getUserInitials({ id: '1', username: 'jsmith', displayName: 'Jane Mary Smith', email: '' })).toBe('JS');
    });

    it('falls back to the username when there is no display name', () => {
        expect(getUserInitials({ id: '1', username: 'andres', displayName: '', email: '' })).toBe('A');
    });
});

describe('UserAvatar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('resolves a Keycloak id against the project team and shows initials', () => {
        render(<UserAvatar userId="u-1" projectId={1} />);

        const avatar = screen.getByRole('img', { name: 'Assigned to Jane Smith' });
        expect(avatar).toHaveTextContent('JS');
        expect(screen.queryByText('u-1')).not.toBeInTheDocument();
    });

    it('reveals the name and email in the tooltip', () => {
        render(<UserAvatar userId="u-1" projectId={1} />);

        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveTextContent('Jane Smith');
        expect(tooltip).toHaveTextContent('jane@example.com');
    });

    it('renders an already resolved user without querying the project', () => {
        render(<UserAvatar user={projectUsers[0]} />);

        expect(screen.getByRole('img', { name: 'Assigned to Jane Smith' })).toHaveTextContent('JS');
    });

    it('shows an unassigned placeholder when there is no assignee', () => {
        render(<UserAvatar />);

        expect(screen.getByRole('img', { name: 'Unassigned' })).toBeInTheDocument();
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('never renders the raw id when the user is not a project member', () => {
        render(<UserAvatar userId="2156d1a9-d1aa-45e6-a104-7c20f9f11a00" projectId={1} />);

        expect(screen.getByRole('img', { name: 'Assigned user' })).toBeInTheDocument();
        expect(screen.queryByText('2156d1a9-d1aa-45e6-a104-7c20f9f11a00')).not.toBeInTheDocument();
    });
});
