'use client';

import { ChevronDown, ChevronRight, Target, User, Plus } from 'lucide-react';
import { Epic, SubTask } from '@/domain/entities/Project';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { UserStoryDto } from '@/domain/entities/UserStory';
import { getEpicPriorityColor, getStatusIcon, getPriorityColor } from '@/lib/utils/colors';
import { USER_STORY_STATUS_LABELS, UserStoryStatus, Status } from '@/domain/types';

interface UserStoryItemProps {
    story: UserStoryDto;
    isExpanded: boolean;
    onToggle: (id: number) => void;
    subtasks: SubTask[];
    epic?: Epic | EpicResponseDto;
}

export default function UserStoryItem({ story, isExpanded, onToggle, subtasks, epic }: UserStoryItemProps) {
    return (
        <div className="mb-2 group">
            <div
                className={`flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/5 transition-all cursor-pointer ${isExpanded ? 'ring-1 ring-primary/20' : ''}`}
                onClick={() => onToggle(story.id)}
            >
                <div className="flex items-center gap-3 flex-1">
                    <div className="text-slate-400 group-hover:text-primary transition-colors">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                    {getStatusIcon(USER_STORY_STATUS_LABELS[story.statusId as UserStoryStatus] as Status || 'To Do')}
                    <span className="font-medium text-sm">{story.title}</span>
                    {epic && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                            {epic.title}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getEpicPriorityColor(story.priority)}`}>
                        {story.priority === 1 ? 'Low' : story.priority === 2 ? 'Medium' : story.priority === 3 ? 'High' : 'Critical'}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Target size={12} />
                        <span>{story.storyPoints} pts</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-border">
                        {story.assigneeId ? 'JD' : <User size={14} className="text-slate-400" />}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="ml-10 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {subtasks.length > 0 ? (
                        subtasks.map(st => (
                            <div key={st.id} className="flex items-center justify-between p-2 rounded-md bg-accent/20 border border-border/30 text-xs">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(st.status)}
                                    <span>{st.title}</span>
                                </div>
                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${getPriorityColor(st.priority)} opacity-80`}>
                                    {st.priority}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-[10px] text-slate-500 italic py-1">No subtasks defined.</div>
                    )}
                    <button className="flex items-center gap-1.5 text-[10px] font-medium text-primary hover:underline mt-1 pl-1">
                        <Plus size={10} /> Add Subtask
                    </button>
                </div>
            )}
        </div>
    );
}
