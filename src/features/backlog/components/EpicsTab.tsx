'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Layers, Pencil, Mountain, ChevronDown, Loader2 } from 'lucide-react';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { UserStoryDto } from '@/domain/entities/UserStory';
import { getEpicPriorityColor, getStatusIcon } from '@/lib/utils/colors';
import { Status, getWorkItemPriorityLabel, EpicStatus, EPIC_STATUS_LABELS, USER_STORY_STATUS_LABELS, UserStoryStatus } from '@/domain/types';
import { EmptyState } from '@/components/ui';

interface EpicsTabProps {
    epics: EpicResponseDto[];
    userStories: UserStoryDto[];
    onCreateEpic: () => void;
    onEditEpic: (epic: EpicResponseDto) => void;
    onLinkStory?: (epicId: number, storyId: number) => Promise<boolean>;
}

function EpicCard({ 
    epic, 
    stories, 
    onEditEpic, 
    onLinkStory,
    unlinkedStories 
}: { 
    epic: EpicResponseDto; 
    stories: UserStoryDto[];
    onEditEpic: (epic: EpicResponseDto) => void;
    onLinkStory?: (epicId: number, storyId: number) => Promise<boolean>;
    unlinkedStories: UserStoryDto[];
}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [linkingStoryId, setLinkingStoryId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const totalStoryPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const doneStoryPoints = stories
        .filter(s => s.statusId === UserStoryStatus.Done || s.statusName?.toLowerCase() === 'done')
        .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const progress = totalStoryPoints > 0 ? (doneStoryPoints / totalStoryPoints) * 100 : 0;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLinkStory = async (storyId: number) => {
        if (!onLinkStory) return;
        setLinkingStoryId(storyId);
        const success = await onLinkStory(epic.id, storyId);
        if (success) {
            setShowDropdown(false);
        }
        setLinkingStoryId(null);
    };

    return (
        <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow border-t-4 border-t-primary">
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getEpicPriorityColor(epic.priority)}`}>
                            {getWorkItemPriorityLabel(epic.priority)}
                        </div>
                        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {EPIC_STATUS_LABELS[epic.statusId as EpicStatus] || epic.statusName}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEditEpic(epic)}
                            className="p-1 rounded-md text-slate-400 hover:bg-accent hover:text-foreground transition-colors"
                            title="Edit Epic"
                        >
                            <Pencil size={14} />
                        </button>
                    </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{epic.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                    {epic.description}
                </p>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Epic Progress</span>
                        <span className="text-slate-500 font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Layers size={14} className="text-slate-400" />
                        <span className="text-xs font-medium">{stories.length} User Stories ({totalStoryPoints} pts)</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-border bg-accent/10 p-4">
                <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-3">Associated Stories</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {stories.map(s => (
                        <div key={s.id} className="flex items-center gap-2 p-2 rounded-md bg-background border border-border/50 text-xs">
                            {getStatusIcon((USER_STORY_STATUS_LABELS[s.statusId as UserStoryStatus] || s.statusName || 'To Do') as Status)}
                            <span className="truncate flex-1">{s.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{s.storyPoints || 0}pt</span>
                        </div>
                    ))}
                    {stories.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">No stories linked to this epic.</p>
                    )}
                </div>
                <div className="mt-3 relative" ref={dropdownRef}>
                    {onLinkStory && unlinkedStories.length > 0 ? (
                        <>
                            <button 
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="w-full text-[10px] font-bold text-primary hover:underline flex items-center justify-center gap-1"
                            >
                                <Plus size={12} /> Link Story
                                <ChevronDown size={10} />
                            </button>
                            {showDropdown && (
                                <div className="absolute bottom-full left-0 right-0 mb-1 bg-background border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                                    {unlinkedStories.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleLinkStory(s.id)}
                                            disabled={linkingStoryId === s.id}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-accent flex items-center gap-2 border-b border-border/50 last:border-0"
                                        >
                                            {linkingStoryId === s.id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                getStatusIcon((USER_STORY_STATUS_LABELS[s.statusId as UserStoryStatus] || s.statusName || 'To Do') as Status)
                                            )}
                                            <span className="truncate flex-1">{s.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Plus size={12} /> No stories available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EpicsTab({ epics, userStories, onCreateEpic, onEditEpic, onLinkStory }: EpicsTabProps) {
    if (epics.length === 0) {
        return (
            <EmptyState
                icon={<Mountain size={32} />}
                title="No epics yet"
                description="Create your first epic to organize your user stories into larger goals."
                action={
                    <button
                        onClick={onCreateEpic}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all"
                    >
                        <Plus size={16} />
                        Create Epic
                    </button>
                }
            />
        );
    }

    const sortedEpics = [...epics].sort((a, b) => {
        const priorityA = Number(a.priority) || 2;
        const priorityB = Number(b.priority) || 2;
        if (priorityB !== priorityA) return priorityB - priorityA;

        const statusOrder: Record<number, number> = {
            [EpicStatus.InProgress]: 0,
            [EpicStatus.ReadyForReview]: 1,
            [EpicStatus.Done]: 2,
            [EpicStatus.Backlog]: 3,
            [EpicStatus.Cancelled]: 4,
        };
        return (statusOrder[a.statusId] ?? 5) - (statusOrder[b.statusId] ?? 5);
    });

    const unlinkedStories = userStories.filter(s => !s.epicId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedEpics.map(epic => (
                <EpicCard
                    key={epic.id}
                    epic={epic}
                    stories={userStories.filter(s => s.epicId === epic.id)}
                    onEditEpic={onEditEpic}
                    onLinkStory={onLinkStory}
                    unlinkedStories={unlinkedStories}
                />
            ))}

            <button
                onClick={onCreateEpic}
                className="rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center p-8 text-slate-400 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
            >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                    <Plus size={24} />
                </div>
                <span className="font-bold text-sm">Create New Epic</span>
                <p className="text-[10px] mt-1">Define a high-level goal</p>
            </button>
        </div>
    );
}
