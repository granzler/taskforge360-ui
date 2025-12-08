'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreateProjectDto, Project, UpdateProjectDto } from '@/types';
import { Loader2, Save, X } from 'lucide-react';

interface ProjectFormProps {
    initialData?: Project;
    onSubmit: (data: CreateProjectDto | UpdateProjectDto) => Promise<void>;
    isOrdering?: boolean;
}

export default function ProjectForm({ initialData, onSubmit }: ProjectFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreateProjectDto>({
        name: '',
        description: '',
        sprintDurationDays: 14,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                sprintDurationDays: initialData.sprintDurationDays,
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (initialData) {
                await onSubmit({ ...formData, id: initialData.id });
            } else {
                await onSubmit(formData);
            }
            router.push('/projects');
            router.refresh();
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error (show toast/alert)
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-card p-6 rounded-lg border shadow-sm">
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Project Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter project name"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter project description"
                    />
                </div>

                <div>
                    <label htmlFor="sprintDuration" className="block text-sm font-medium mb-1">
                        Sprint Duration (Days)
                    </label>
                    <input
                        id="sprintDuration"
                        type="number"
                        min={1}
                        required
                        value={formData.sprintDurationDays}
                        onChange={(e) => setFormData({ ...formData, sprintDurationDays: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={16} />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Save size={16} />
                    )}
                    {initialData ? 'Update Project' : 'Create Project'}
                </button>
            </div>
        </form>
    );
}
