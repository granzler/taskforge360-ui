'use client';

import { useRouter } from 'next/navigation';
import { CreateLabelRequestDto } from '@/domain/entities/GlobalLabel';
import { globalLabelService } from '@/infrastructure/services/globalLabelService';
import { ArrowLeft, Tag, Loader2, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CreateLabelPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreateLabelRequestDto>({
        tagName: '',
        description: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.tagName.trim()) {
            toast.error('Tag name is required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await globalLabelService.create({
                tagName: formData.tagName.trim(),
                description: formData.description.trim(),
            });

            if (result.success) {
                toast.success(`Label "${result.data.tagName}" created successfully!`);
                router.push('/admin/labels');
            } else {
                const errorMessage = result.errors.map(e => e.message).join(', ');
                toast.error(errorMessage || 'Failed to create label.');
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error('Failed to create label:', err);
            toast.error('Failed to create label. Please try again.');
            setIsSubmitting(false);
        }
    };

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
                    <h1 className="text-3xl font-extrabold tracking-tight">Create Label</h1>
                    <p className="text-slate-500 mt-1 font-medium">Add a new global label for user stories.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-primary/0"></div>

                <div>
                    <label htmlFor="tagName" className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                        Tag Name
                    </label>
                    <input
                        id="tagName"
                        type="text"
                        required
                        value={formData.tagName}
                        onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm px-4 py-3 resize-y leading-relaxed"
                        placeholder="Describe when this label should be used..."
                    />
                </div>

                <div className="pt-6 mt-6 border-t border-border/50 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 relative z-10">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-500 bg-background border border-border rounded-xl hover:bg-accent/50 hover:text-slate-700 dark:hover:text-slate-200 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
                    >
                        <X size={16} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
                    >
                        {isSubmitting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        Create Label
                    </button>
                </div>
            </form>
        </div>
    );
}