'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GlobalLabelDto, UpdateLabelRequestDto } from '@/domain/entities/GlobalLabel';
import { globalLabelService } from '@/infrastructure/services/globalLabelService';
import { ArrowLeft, Tag, Loader2, Save, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';
import { usePermission } from '@/features/auth/hooks/usePermission';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditLabelPage({ params }: PageProps) {
    const { id } = use(params);
    const labelId = parseInt(id);
    const router = useRouter();
    const { hasRole, hasScope } = usePermission();
    const canUpdate = hasRole('scrum-master') || hasRole('product-owner') || hasRole('system-admin') || hasScope('labels:update');
    const canDelete = hasRole('scrum-master') || hasRole('product-owner') || hasRole('system-admin') || hasScope('labels:delete');

    const [label, setLabel] = useState<GlobalLabelDto | null>(null);
    const [formData, setFormData] = useState<UpdateLabelRequestDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!labelId) {
            setError('Invalid label ID.');
            setIsLoading(false);
            return;
        }

        const fetchLabel = async () => {
            try {
                const result = await globalLabelService.getById(labelId);
                if (result.success) {
                    setLabel(result.data);
                    setFormData({
                        tagName: result.data.tagName,
                        description: result.data.description,
                        concurrencyVersion: result.data.concurrencyVersion,
                    });
                } else {
                    setError('Label not found or no longer exists.');
                }
            } catch (err) {
                console.error('Failed to fetch label:', err);
                setError('Failed to load label.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLabel();
    }, [labelId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData || !formData.tagName.trim()) {
            toast.error('Tag name is required.');
            return;
        }

        setIsSaving(true);
        try {
            const result = await globalLabelService.update(labelId, {
                tagName: formData.tagName.trim(),
                description: formData.description.trim(),
                concurrencyVersion: formData.concurrencyVersion,
            });

            if (notifyResult(result)) {
                toast.success(`Label "${result.data.tagName}" updated successfully!`);
                router.push('/admin/labels');
            }
        } catch (err) {
            console.error('Failed to update label:', err);
            toast.error('Failed to update label. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this label?')) return;

        try {
            const result = await globalLabelService.delete(labelId);
            if (notifyResult(result, { success: 'Label deleted successfully!' })) {
                router.push('/admin/labels');
            }
        } catch (err) {
            console.error('Failed to delete label:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-slate-400" />
                </div>
            </div>
        );
    }

    if (error || !label || !formData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Link
                    href="/admin/labels"
                    className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors w-fit"
                >
                    <div className="p-1 rounded-md bg-transparent group-hover:bg-primary/10 transition-colors">
                        <ArrowLeft size={16} />
                    </div>
                    Back to Labels
                </Link>
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
                        {error || 'Label not found.'}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Link
                href="/admin/labels"
                className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors w-fit"
            >
                <div className="p-1 rounded-md bg-transparent group-hover:bg-primary/10 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                Back to Labels
            </Link>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10 shrink-0">
                    <Tag size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Edit Label</h1>
                    <p className="text-slate-500 mt-1 font-medium">Update the label details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-primary/0"></div>

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <span className="font-mono bg-accent/50 px-2 py-1 rounded">ID: {label.id}</span>
                </div>

                <div>
                    <label htmlFor="tagName" className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                        Tag Name
                    </label>
                    <input
                        id="tagName"
                        type="text"
                        required
                        value={formData.tagName}
                        onChange={(e) => formData && setFormData({ ...formData, tagName: e.target.value })}
                        className="w-full bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm px-4 py-3 font-bold text-lg"
                        placeholder="e.g., Bug, Feature, Improvement..."
                    />
                </div>

                <div>
                    <label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => formData && setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm px-4 py-3 resize-y leading-relaxed"
                        placeholder="Describe when this label should be used..."
                    />
                </div>

                <div className="pt-6 mt-6 border-t border-border/50 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 relative z-10">
                    {canDelete && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-500 bg-background border border-border rounded-xl hover:bg-accent/50 hover:text-slate-700 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        {canUpdate && (
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isSaving ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                Save Changes
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}