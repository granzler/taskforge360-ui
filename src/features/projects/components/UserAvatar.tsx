'use client';

import { User as UserIcon } from 'lucide-react';
import { UserSearchResult } from '@/domain/entities/User';
import { useProjectUsers } from '../hooks/useProjectUsers';

export type UserAvatarSize = 'xs' | 'sm' | 'md';

const AVATAR_SIZE_CLASSES: Record<UserAvatarSize, string> = {
    xs: 'h-5 w-5 text-[9px]',
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-[11px]',
};

const ICON_SIZES: Record<UserAvatarSize, number> = { xs: 10, sm: 12, md: 14 };

/** Initials shown inside the avatar circle: first letter of the first and last word. */
export function getUserInitials(user: UserSearchResult): string {
    const source = (user.displayName || user.username || '').trim();
    if (!source) return '?';

    const words = source.split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();

    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

interface UserAvatarProps {
    /** Already resolved user (e.g. the assignee currently held by a form). */
    user?: UserSearchResult | null;
    /** Keycloak id stored in `assignedTo`; resolved against the project members. */
    userId?: string | null;
    /** Project whose team is used to resolve `userId`. */
    projectId?: number;
    size?: UserAvatarSize;
    className?: string;
}

/**
 * Assignee avatar: a circle with the user's initials whose tooltip reveals the
 * full name and email on hover or keyboard focus. Work items only carry the
 * Keycloak id, so when only `userId` is known the member is looked up in the
 * project team (never the raw GUID is rendered).
 */
export default function UserAvatar({
    user,
    userId,
    projectId,
    size = 'sm',
    className = '',
}: UserAvatarProps) {
    const needsLookup = !user && !!userId && !!projectId;
    const { data: projectUsers } = useProjectUsers(needsLookup ? projectId : undefined);
    const resolvedUser = user ?? (userId ? projectUsers?.find(member => member.id === userId) : undefined);

    const circleClasses = `relative inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 font-bold text-primary ${AVATAR_SIZE_CLASSES[size]} ${className}`;

    if (!resolvedUser) {
        const hasAssignee = !!userId;
        return (
            <span
                className={`${circleClasses} text-muted-foreground`}
                role="img"
                aria-label={hasAssignee ? 'Assigned user' : 'Unassigned'}
                title={hasAssignee ? 'Assigned user' : 'Unassigned'}
            >
                <UserIcon size={ICON_SIZES[size]} aria-hidden="true" />
            </span>
        );
    }

    const name = resolvedUser.displayName || resolvedUser.username;
    const email = resolvedUser.email;

    return (
        <span className="group/avatar relative inline-flex">
            <span
                className={circleClasses}
                role="img"
                aria-label={`Assigned to ${name}`}
                tabIndex={0}
            >
                {getUserInitials(resolvedUser)}
            </span>
            <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium leading-tight text-white shadow-lg group-hover/avatar:block group-focus-within/avatar:block dark:bg-slate-100 dark:text-slate-900"
            >
                <span className="block">{name}</span>
                {email && <span className="block font-normal opacity-80">{email}</span>}
            </span>
        </span>
    );
}
