'use client';

import { Plus, Layers, Pencil, Mountain } from 'lucide-react';
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
}

export default function EpicsTab({ epics, userStories, onCreateEpic, onEditEpic }: EpicsTabProps) {
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedEpics.map(epic => {
                const stories = userStories.filter(s => s.epicId === epic.id);
                const doneStories = stories.filter(s => s.statusId === UserStoryStatus.Done || s.statusName?.toLowerCase() === 'done');
                const progress = stories.length > 0 ? (doneStories.length / stories.length) * 100 : 0;

                return (
                    <div key={epic.id} className="rounded-xl border border-border bg-card shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow border-t-4 border-t-primary">
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
                                    <span className="text-xs font-medium">{stories.length} User Stories</span>
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
                            <button className="w-full mt-3 text-[10px] font-bold text-primary hover:underline flex items-center justify-center gap-1">
                                <Plus size={12} /> Link Story
                            </button>
                        </div>
                    </div>
                );
            })}

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
