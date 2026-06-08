'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GlobalLabelDto } from '@/domain/entities/GlobalLabel';
import { globalLabelService } from '@/infrastructure/services/globalLabelService';
import { Plus, Edit, Search, Trash2, Tag } from 'lucide-react';
import { SkeletonList } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';
import { usePermission } from '@/features/auth/hooks/usePermission';

export default function AdminLabelsPage() {
    const [labels, setLabels] = useState<GlobalLabelDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
    const { hasRole, hasScope } = usePermission();

    const canCreate = hasRole('system-admin') || hasRole('product-owner') || hasRole('scrum-master') || hasScope('labels:create');
    const canDelete = hasRole('system-admin') || hasRole('product-owner') || hasRole('scrum-master') || hasScope('labels:delete');
    const canUpdate = hasRole('system-admin') || hasRole('product-owner') || hasRole('scrum-master') || hasScope('labels:update');

    useEffect(() => {
        fetchLabels();
    }, []);

    const fetchLabels = async () => {
        try {
            const result = await globalLabelService.getAll();
            if (notifyResult(result)) {
                setLabels(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch labels (exception):', err);
            toast.error('Failed to load labels.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedLabels.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedLabels.length} label(s)?`)) return;

        try {
            const results = await Promise.all(selectedLabels.map(id => globalLabelService.delete(id)));
            const hasErrors = results.some(r => !r.success);
            
            if (hasErrors) {
                toast.error('Failed to delete some labels.');
            } else {
                toast.success(`Successfully deleted ${selectedLabels.length} label(s).`);
            }
            
            await fetchLabels();
            setSelectedLabels([]);
        } catch (err) {
            console.error('Failed to delete labels:', err);
            toast.error('Failed to delete labels.');
        }
    };

    const filteredLabels = labels.filter(label =>
        label.tagName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        label.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelect = (id: number) => {
        setSelectedLabels(prev => 
            prev.includes(id) 
                ? prev.filter(l => l !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedLabels.length === filteredLabels.length) {
            setSelectedLabels([]);
        } else {
            setSelectedLabels(filteredLabels.map(l => l.id));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10">
                        <Tag size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Global Labels</h1>
                        <p className="text-slate-500 mt-1 font-medium">Manage labels for user stories across all projects.</p>
                    </div>
                </div>
                {canCreate && (
                    <Link
                        href="/admin/labels/create"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
                    >
                        <Plus size={18} />
                        Create Label
                    </Link>
                )}
            </div>

            <div className="bg-card border border-border/60 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search labels..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm pl-10 pr-4 py-2.5 font-medium"
                        />
                    </div>
                    {selectedLabels.length > 0 && canDelete && (
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all"
                        >
                            <Trash2 size={16} />
                            Delete ({selectedLabels.length})
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <SkeletonList rows={5} />
                ) : filteredLabels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Tag size={48} className="mb-4 opacity-30" />
                        <p className="font-medium">No labels found.</p>
                        <p className="text-sm mt-1">Create your first label to get started.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-accent/20 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {canDelete && (
                                    <th className="px-4 py-3 w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedLabels.length === filteredLabels.length && filteredLabels.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300"
                                        />
                                    </th>
                                )}
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Tag Name</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredLabels.map((label) => (
                                <tr key={label.id} className="hover:bg-accent/20 transition-colors">
                                    {canDelete && (
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedLabels.includes(label.id)}
                                                onChange={() => toggleSelect(label.id)}
                                                className="rounded border-slate-300"
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-sm font-mono text-slate-500">{label.id}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                            {label.tagName}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 max-w-md truncate">{label.description || '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        {canUpdate && (
                                            <Link
                                                href={`/admin/labels/${label.id}/edit`}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}