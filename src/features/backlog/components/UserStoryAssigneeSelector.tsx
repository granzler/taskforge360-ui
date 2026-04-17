'use client';

import { useState, useEffect, useRef } from 'react';
import { UserSearchResult } from '@/domain/entities/User';
import { projectService } from '@/infrastructure/services/projectService';
import { Search, X, User as UserIcon, Loader2 } from 'lucide-react';

interface UserStoryAssigneeSelectorProps {
    assignedUser?: UserSearchResult | null;
    onAssign: (user: UserSearchResult) => void;
    onRemove: () => void;
    disabled?: boolean;
}

export default function UserStoryAssigneeSelector({
    assignedUser,
    onAssign,
    onRemove,
    disabled = false,
}: UserStoryAssigneeSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const searchUsers = async () => {
            if (searchTerm.length < 3) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const result = await projectService.searchUsers(searchTerm);
                if (result.success) {
                    const availableUsers = result.data.filter(
                        u => !assignedUser || u.id !== assignedUser.id
                    );
                    setResults(availableUsers);
                    setShowResults(true);
                }
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, assignedUser]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectUser = (user: UserSearchResult) => {
        onAssign(user);
        setSearchTerm('');
        setShowResults(false);
    };

    return (
        <div ref={wrapperRef} className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Assignee
            </label>

            {assignedUser ? (
                <div className="flex items-center gap-2 bg-secondary/50 border border-secondary px-3 py-2 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                            {(assignedUser.displayName || assignedUser.username || '?').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className="text-sm font-medium flex-1">
                        {assignedUser.displayName || assignedUser.username}
                    </span>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-0.5 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                        aria-label="Remove assignee"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => { if (results.length > 0) setShowResults(true); }}
                            placeholder="Search user (min 3 chars)..."
                            disabled={disabled}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 size={14} className="animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {showResults && results.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border border-border/50 shadow-lg rounded-lg max-h-48 overflow-auto">
                            <ul className="py-1">
                                {results.map((user) => (
                                    <li key={user.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectUser(user)}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                                <UserIcon size={14} className="text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.displayName || user.username}</span>
                                                <span className="text-xs text-muted-foreground">@{user.username}</span>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}