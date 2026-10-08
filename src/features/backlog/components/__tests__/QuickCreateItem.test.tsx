import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickCreateItem from '../QuickCreateItem';
import { CreateWorkItemRequestDto } from '@/domain/entities/WorkItem';

vi.mock('@/infrastructure/services/workItemService', () => ({
  workItemService: {
    create: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { workItemService } from '@/infrastructure/services/workItemService';

const mockService = workItemService as ReturnType<typeof vi.mocked<typeof workItemService>>;

const minimalDto = (title: string, extra: Partial<CreateWorkItemRequestDto> = {}): CreateWorkItemRequestDto => ({
  type: 1, // Story
  title,
  projectId: 1,
  priority: 2,
  statusId: 6, // Backlog
  concurrencyVersion: 1,
  ...extra,
});

describe('QuickCreateItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a work item with only the title on Enter', async () => {
    mockService.create.mockResolvedValue({
      success: true,
      data: { id: 10, type: 1, title: 'New story', statusId: 6, statusName: 'Backlog', priority: 2, projectId: 1, concurrencyVersion: 1 },
    });

    render(<QuickCreateItem projectId={1} sprintId={5} label="Sprint 1" />);

    const input = screen.getByRole('textbox', { name: 'Work item title in Sprint 1' });
    fireEvent.change(input, { target: { value: 'New story' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(mockService.create).toHaveBeenCalledTimes(1));

    expect(mockService.create).toHaveBeenCalledWith(minimalDto('New story', { sprintId: 5 }));
  });

  it('creates an unassigned backlog item when no sprint is given', async () => {
    mockService.create.mockResolvedValue({
      success: true,
      data: { id: 11, type: 1, title: 'Backlog story', statusId: 6, statusName: 'Backlog', priority: 2, projectId: 1, concurrencyVersion: 1 },
    });

    render(<QuickCreateItem projectId={1} />);

    const input = screen.getByRole('textbox', { name: 'Work item title' });
    fireEvent.change(input, { target: { value: 'Backlog story' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(mockService.create).toHaveBeenCalledTimes(1));

    expect(mockService.create).toHaveBeenCalledWith(minimalDto('Backlog story', { sprintId: undefined }));
  });

  it('keeps the input focused and cleared after a successful creation', async () => {
    mockService.create.mockResolvedValue({
      success: true,
      data: { id: 12, type: 1, title: 'Another', statusId: 6, statusName: 'Backlog', priority: 2, projectId: 1, concurrencyVersion: 1 },
    });

    const onCreated = vi.fn();
    render(<QuickCreateItem projectId={1} onCreated={onCreated} />);

    const input = screen.getByRole('textbox', { name: 'Work item title' });
    fireEvent.change(input, { target: { value: 'Another' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
  });

  it('keeps the typed title when creation fails', async () => {
    mockService.create.mockResolvedValue({
      success: false,
      errors: [{ code: 'VALIDATION_ERROR', message: 'Title required', type: 'Validation' }],
    });

    render(<QuickCreateItem projectId={1} />);

    const input = screen.getByRole('textbox', { name: 'Work item title' });
    fireEvent.change(input, { target: { value: 'Broken one' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(mockService.create).toHaveBeenCalledTimes(1));

    expect(input).toHaveValue('Broken one');
  });

  it('clears the input on Escape without creating anything', () => {
    render(<QuickCreateItem projectId={1} />);

    const input = screen.getByRole('textbox', { name: 'Work item title' });
    fireEvent.change(input, { target: { value: 'Discard me' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(input).toHaveValue('');
    expect(mockService.create).not.toHaveBeenCalled();
  });

  it('does not create when the title is empty', () => {
    render(<QuickCreateItem projectId={1} />);

    const input = screen.getByRole('textbox', { name: 'Work item title' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockService.create).not.toHaveBeenCalled();
  });

  it('exposes the full-form trigger used to open the inline panel', () => {
    const onAdvanced = vi.fn();
    render(<QuickCreateItem projectId={1} onAdvanced={onAdvanced} triggerKey="sprint-3" advancedActive />);

    const trigger = screen.getByRole('button', { name: /Full form/ });
    expect(trigger).toHaveAttribute('data-create-trigger', 'sprint-3');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    expect(onAdvanced).toHaveBeenCalledTimes(1);
  });
});
