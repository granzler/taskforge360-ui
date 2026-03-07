'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, MoreVertical } from 'lucide-react';
import { Sprint, UserStory, SubTask, Epic } from '@/features/backlog/types';
import UserStoryItem from './UserStoryItem';

interface SprintsTabProps {
    sprints: Sprint[];
    userStories: UserStory[];
    subtasks: SubTask[];
    epics: Epic[];
}

export default function SprintsTab({ sprints, userStories, subtasks, epics }: SprintsTabProps) {
    const [expandedSprints, setExpandedSprints] = useState<number[]>([1, 2]);
    const [expandedStories, setExpandedStories] = useState<number[]>([]);

    const toggleSprint = (id: number) => {
        setExpandedSprints(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleStory = (id: number) => {
        setExpandedStories(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const storiesBySprint = sprints.map(sprint => ({
        ...sprint,
        stories: userStories.filter(us => us.sprintId === sprint.id)
    }));

    const unassignedStories = userStories.filter(us => !us.sprintId);

    return (
        <div className="space-y-6">
            {storiesBySprint.map(sprint => (
                <div key={sprint.id} className="rounded-xl border border-border bg-card/50 shadow-sm overflow-hidden">
                    <div
                        className="bg-accent/30 p-4 flex items-center justify-between cursor-pointer hover:bg-accent/40 transition-colors"
                        onClick={() => toggleSprint(sprint.id)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-slate-400">
                                {expandedSprints.includes(sprint.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-base flex items-center gap-2">
                                    {sprint.name}
                                    {sprint.status === 'Active' && (
                                        <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                                    )}
                                </h3>
                                <p className="text-xs text-slate-500">{sprint.startDate} — {sprint.endDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Progress</p>
                                <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-primary w-[45%]" />
                                </div>
                            </div>
                            <button className="p-2 hover:bg-background/80 rounded-full text-slate-400 transition-colors" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div>

                    {expandedSprints.includes(sprint.id) && (
                        <div className="p-4 border-t border-border bg-background/20">
                            {sprint.stories.length > 0 ? (
                                sprint.stories.map(story => (
                                    <UserStoryItem
                                        key={story.id}
                                        story={story}
                                        isExpanded={expandedStories.includes(story.id)}
                                        onToggle={toggleStory}
                                        subtasks={subtasks.filter(st => st.userStoryId === story.id)}
                                        epic={epics.find(e => e.id === story.epicId)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-border rounded-lg text-sm">
                                    No stories in this sprint. Drag here to add.
                                </div>
                            )}
                            <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-dashed border-border rounded-lg text-xs font-medium text-slate-500 hover:bg-accent/5 hover:text-primary transition-all">
                                <Plus size={14} /> Add User Story
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {/* Backlog / Unassigned Stories */}
            <div className="relative pt-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Backlog / Unassigned</span>
                </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background shadow-sm">
                {unassignedStories.length > 0 ? (
                    unassignedStories.map(story => (
                        <UserStoryItem
                            key={story.id}
                            story={story}
                            isExpanded={expandedStories.includes(story.id)}
                            onToggle={toggleStory}
                            subtasks={subtasks.filter(st => st.userStoryId === story.id)}
                            epic={epics.find(e => e.id === story.epicId)}
                        />
                    ))
                ) : (
                    <div className="text-center py-6 text-slate-500 text-sm italic">
                        No unassigned items in backlog.
                    </div>
                )}
            </div>
        </div>
    );
}
