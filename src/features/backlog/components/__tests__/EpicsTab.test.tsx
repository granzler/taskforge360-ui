import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EpicsTab from '../EpicsTab';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { UserStoryDto } from '@/domain/entities/UserStory';

const mockEpic: EpicResponseDto = {
  id: 1,
  title: 'Test Epic',
  description: 'Test Description',
  acceptanceCriteria: 'Test criteria',
  projectId: 1,
  priority: 1,
  statusId: 1,
  statusName: 'In Progress',
  userStories: [],
  concurrencyVersion: 1,
};

const mockLinkedStory: UserStoryDto = {
  id: 1,
  title: 'Linked Story',
  statusId: 14,
  statusName: 'Done',
  priority: 2,
  projectId: 1,
  storyPoints: 5,
  epicId: 1,
  concurrencyVersion: 1,
};

const mockUnlinkedStory: UserStoryDto = {
  id: 2,
  title: 'Unlinked Story',
  statusId: 7,
  statusName: 'To Do',
  priority: 2,
  projectId: 1,
  storyPoints: 3,
  concurrencyVersion: 1,
};

describe('EpicsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render epic title and description', () => {
    render(
      <EpicsTab
        epics={[mockEpic]}
        userStories={[]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
      />
    );

    expect(screen.getByText('Test Epic')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render empty state when no epics', () => {
    render(
      <EpicsTab
        epics={[]}
        userStories={[]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
        canCreateEpic={true}
      />
    );

    expect(screen.getByText('No epics yet')).toBeInTheDocument();
    expect(screen.getByText('Create Epic')).toBeInTheDocument();
  });

  it('should show linked stories', () => {
    render(
      <EpicsTab
        epics={[mockEpic]}
        userStories={[mockLinkedStory]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
      />
    );

    expect(screen.getByText('Linked Story')).toBeInTheDocument();
    expect(screen.getByText(/1 User Stories/)).toBeInTheDocument();
  });

  it('should show no stories linked message when empty', () => {
    render(
      <EpicsTab
        epics={[mockEpic]}
        userStories={[]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
      />
    );

    expect(screen.getByText('No stories linked to this epic.')).toBeInTheDocument();
  });

  it('should calculate progress based on story points', () => {
    const inProgressStory: UserStoryDto = {
      ...mockLinkedStory,
      id: 2,
      statusId: 8,
      statusName: 'In Progress',
      storyPoints: 5,
    };

    render(
      <EpicsTab
        epics={[mockEpic]}
        userStories={[mockLinkedStory, inProgressStory]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
      />
    );

    expect(screen.getByText(/\d+%/)).toBeInTheDocument();
  });

  it('should show story points in the count', () => {
    render(
      <EpicsTab
        epics={[mockEpic]}
        userStories={[mockLinkedStory]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
      />
    );

    expect(screen.getByText(/5 pts/)).toBeInTheDocument();
  });

  it('should show Link Story button when onLinkStory is provided and there are unlinked stories', () => {
    render(
      <EpicsTab
        epics={[mockEpic]}
        userStories={[mockUnlinkedStory]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
        onLinkStory={vi.fn()}
        canLinkStory={true}
      />
    );

    expect(screen.getAllByText('Link Story').length).toBeGreaterThan(0);
  });

  it('should show no stories available when all stories are linked', () => {
    render(
      <EpicsTab
        epics={[mockEpic]}
        userStories={[mockLinkedStory]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
        onLinkStory={vi.fn()}
      />
    );

    expect(screen.getAllByText('No stories available').length).toBeGreaterThan(0);
  });
});