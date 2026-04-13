import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserStoryForm from '../UserStoryForm';
import { UserStoryStatus } from '@/domain/types';

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('UserStoryForm', () => {
  const defaultProps = {
    projectId: 1,
    projectName: 'Test Project',
    isLoading: false,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    submitLabel: 'Submit',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with all fields', () => {
    render(<UserStoryForm {...defaultProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/story points/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sprint/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/epic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/acceptance criteria/i)).toBeInTheDocument();
  });

  it('should pre-fill form with initial data', () => {
    const initialData = {
      title: 'Initial Title',
      description: 'Initial Description',
      storyPoints: 5,
      statusId: UserStoryStatus.InProgress,
      acceptanceCriteria: 'AC 1',
      sprintId: 1,
      epicId: 2,
    };

    render(<UserStoryForm {...defaultProps} initialData={initialData} />);

    expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('AC 1')).toBeInTheDocument();
  });

  it('should validate title is required', async () => {
    render(<UserStoryForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit when title is filled', async () => {
    render(<UserStoryForm {...defaultProps} />);

    const titleInput = screen.getByLabelText(/title/i);
    await userEvent.type(titleInput, 'New Story');

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).not.toBeDisabled();
  });

  it('should call onSubmit with form data', async () => {
    const onSubmit = vi.fn();

    render(<UserStoryForm {...defaultProps} onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    await userEvent.type(titleInput, 'New Story');

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Story',
        projectId: 1,
        priority: 2,
      })
    );
  });

  it('should call onCancel when cancel clicked', async () => {
    const onCancel = vi.fn();

    render(<UserStoryForm {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<UserStoryForm {...defaultProps} isLoading={true} submitLabel="Saving..." />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  it('should show read-only sprint when isSprintReadOnly', () => {
    const sprints = [{ id: 1, name: 'Sprint 1', status: { name: 'Active' } }] as never[];
    render(
      <UserStoryForm
        {...defaultProps}
        isSprintReadOnly={true}
        initialData={{ title: 'Test', statusId: 1, sprintId: 1 }}
        sprints={sprints}
      />
    );

    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
  });
});