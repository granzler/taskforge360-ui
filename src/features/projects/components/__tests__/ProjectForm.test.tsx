import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectForm from '../ProjectForm';
import type { Project } from '@/domain/entities/Project';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/infrastructure/services/projectService', () => ({
  projectService: {
    searchUsers: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
}));

const project: Project = {
  id: 7,
  name: 'Apollo',
  description: 'Moon mission',
  sprintDurationDays: 21,
  concurrencyVersion: 3,
  sprints: [],
  workItems: [],
  projectUsers: [
    {
      id: 1,
      userId: 'u-1',
      userName: 'aperez',
      displayName: 'Ana Pérez',
      email: 'ana@example.com',
    },
  ],
};

describe('ProjectForm', () => {
  it('populates the form and team from initialData on the first render', () => {
    render(<ProjectForm initialData={project} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Project Name')).toHaveValue('Apollo');
    expect(screen.getByLabelText('Description')).toHaveValue('Moon mission');
    expect(screen.getByLabelText(/Sprint Duration/)).toHaveValue(21);
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
  });

  it('starts with the defaults when creating a project', () => {
    render(<ProjectForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Project Name')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByLabelText(/Sprint Duration/)).toHaveValue(14);
    expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument();
  });
});
