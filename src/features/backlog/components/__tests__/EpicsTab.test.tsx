import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EpicsTab from '../EpicsTab';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { WorkItemDto } from '@/domain/entities/WorkItem';
import type { CreateWorkItemTarget } from '../CreateWorkItemPanel';

/** New inline-creation props, defaults keep the existing behaviour unchanged. */
const epicsTabDefaults = {
  projectId: 1,
  sprints: [],
  onWorkItemCreated: vi.fn(),
  creatingIn: null as CreateWorkItemTarget | null,
  setCreatingIn: vi.fn(),
};

const mockEpic: EpicResponseDto = {
  id: 1,
  title: 'Test Epic',
  description: 'Test Description',
  acceptanceCriteria: 'Test criteria',
  projectId: 1,
  priority: 1,
  statusId: 1,
  statusName: 'In Progress',
  children: [],
  concurrencyVersion: 1,
};

const mockLinkedItem: WorkItemDto = {
  id: 1,
  type: 1, // Story
  title: 'Linked Item',
  statusId: 14,
  statusName: 'Done',
  priority: 2,
  projectId: 1,
  storyPoints: 5,
  parentId: 1,
  concurrencyVersion: 1,
};

const mockUnlinkedItem: WorkItemDto = {
  id: 2,
  type: 1, // Story
  title: 'Unlinked Item',
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
        {...epicsTabDefaults}
        epics={[mockEpic]}
        workItems={[]}
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
        {...epicsTabDefaults}
        epics={[]}
        workItems={[]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
        canCreateEpic={true}
      />
    );

    expect(screen.getByText('No epics yet')).toBeInTheDocument();
    expect(screen.getByText('Create Epic')).toBeInTheDocument();
  });

  it('should show linked items', () => {
    render(
      <EpicsTab
        {...epicsTabDefaults}
        epics={[mockEpic]}
        workItems={[mockLinkedItem]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
      />
    );

    expect(screen.getByText('Linked Item')).toBeInTheDocument();
    expect(screen.getByText(/1 items/)).toBeInTheDocument();
  });

  it('should show no items linked message when empty', () => {
    render(
      <EpicsTab
        {...epicsTabDefaults}
        epics={[mockEpic]}
        workItems={[]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
      />
    );

    expect(screen.getByText('No items linked to this epic.')).toBeInTheDocument();
  });

  it('should calculate progress based on story points', () => {
    const inProgressItem: WorkItemDto = {
      ...mockLinkedItem,
      id: 2,
      statusId: 8,
      statusName: 'In Progress',
      storyPoints: 5,
    };

    render(
      <EpicsTab
        {...epicsTabDefaults}
        epics={[mockEpic]}
        workItems={[mockLinkedItem, inProgressItem]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
      />
    );

    expect(screen.getByText(/\d+%/)).toBeInTheDocument();
  });

  it('should show story points in the count', () => {
    render(
      <EpicsTab
        {...epicsTabDefaults}
        epics={[mockEpic]}
        workItems={[mockLinkedItem]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
      />
    );

    expect(screen.getByText(/5 pts/)).toBeInTheDocument();
  });

  it('should show Link Item button when onLinkStory is provided and there are unlinked items', () => {
    render(
      <EpicsTab
        {...epicsTabDefaults}
        epics={[mockEpic]}
        workItems={[mockUnlinkedItem]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
        onLinkStory={vi.fn()}
        canLinkStory={true}
      />
    );

    expect(screen.getAllByText('Link Item').length).toBeGreaterThan(0);
  });

  it('should show no items available when all items are linked', () => {
    render(
      <EpicsTab
        {...epicsTabDefaults}
        epics={[mockEpic]}
        workItems={[mockLinkedItem]}
        onCreateEpic={vi.fn()}
        onEditEpic={vi.fn()}
        onLinkStory={vi.fn()}
      />
    );

    expect(screen.getAllByText('No items available').length).toBeGreaterThan(0);
  });
});
