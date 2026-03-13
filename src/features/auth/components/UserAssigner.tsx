'use client';

import { useState, useEffect, useRef } from 'react';
import { UserSearchResult } from '@/domain/entities/User';
import { projectService } from '@/infrastructure/services/projectService';
import { Search, X, UserPlus, User as UserIcon, Loader2 } from 'lucide-react';

interface UserAssignerProps {
    assignedUsers: UserSearchResult[];
    onAssign: (user: UserSearchResult) => void;
    onRemove: (userId: string) => void;
}

export default function UserAssigner({ assignedUsers, onAssign, onRemove, hideAssignedList = false }: UserAssignerProps & { hideAssignedList?: boolean }) {
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
                // Determine if we are searching by term or query - relying on service implementation
                const users = await projectService.searchUsers(searchTerm);
                // Filter out already assigned users
                const availableUsers = users.filter(
                    u => !assignedUsers.some(assigned => assigned.id === u.id)
                );
                setResults(availableUsers);
                setShowResults(true);
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm, assignedUsers]);

    // Close results when clicking outside
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
        setSearchTerm(''); // Clear search after selection
        setShowResults(false);
    };

    return (
        <div className="space-y-4" ref={wrapperRef}>
            {!hideAssignedList && (
                <label className="block text-sm font-medium mb-1">
                    Assign Team Members
                </label>
            )}

            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => { if (results.length > 0) setShowResults(true); }}
                        placeholder="Search users by name or email (min 3 chars)..."
                        className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && results.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border opacity-95 backdrop-blur-sm shadow-md rounded-md max-h-60 overflow-auto">
                        <ul className="py-1">
                            {results.map((user) => (
                                <li key={user.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectUser(user)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                                    >
                                        <div className="bg-primary/10 p-1 rounded-full">
                                            <UserIcon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.displayName || user.username}</span>
                                            <span className="text-xs text-muted-foreground">@{user.username} • {user.email}</span>
                                        </div>
                                        <UserPlus className="ml-auto h-4 w-4 opacity-50" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {showResults && searchTerm.length >= 3 && results.length === 0 && !isSearching && (
                    <div className="absolute z-10 w-full mt-1 bg-popover/95 border shadow-sm rounded-md p-4 text-center text-sm text-muted-foreground">
                        No users found.
                    </div>
                )}
            </div>

            {/* Assigned Users List */}
            {!hideAssignedList && assignedUsers.length > 0 && (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {assignedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-2 bg-secondary/50 border border-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm animate-in fade-in zoom-in duration-200"
                            >
                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-primary">
                                        {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="font-medium">{user.displayName || user.username}</span>
                                <button
                                    type="button"
                                    onClick={() => onRemove(user.id)}
                                    className="p-0.5 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors ml-1"
                                    aria-label={`Remove ${user.username}`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
