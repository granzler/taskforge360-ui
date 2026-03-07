import React from 'react';
import { Priority, Status } from '@/features/backlog/types';
import { CheckCircle2, CircleDashed, AlertCircle } from 'lucide-react';

export const getPriorityColor = (priority: Priority) => {
    switch (priority) {
        case 'Critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
        case 'High': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
        case 'Medium': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Low': return 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
        default: return 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
    }
};

export const getStatusIcon = (status: Status) => {
    switch (status) {
        case 'Done': return <CheckCircle2 size={16} className="text-green-500" />;
        case 'In Progress': return <CircleDashed size={16} className="text-blue-500 animate-spin-slow" />;
        case 'Review': return <AlertCircle size={16} className="text-orange-500" />;
        default: return <CircleDashed size={16} className="text-slate-400" />;
    }
};
