import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { makeReportMember } from '../../test/fixtures';
import { ReportRole } from '../../types/report';
import { ShareReportModal } from './ShareReportModal';

const owner = makeReportMember();
const editor = makeReportMember({
  id: 'share-1',
  userId: 'supabase-user-2',
  email: 'jane@example.com',
  fullName: 'Jane Smith',
  role: 'EDITOR',
});

const makeProps = (
  overrides: Partial<{
    currentUserId: string;
    myRole: ReportRole;
  }> = {}
) => ({
  currentUserId: 'supabase-user-1',
  isLeaving: false,
  isOpen: true,
  isSharing: false,
  members: [owner, editor],
  myRole: 'OWNER' as ReportRole,
  onClose: vi.fn(),
  onLeaveReport: vi.fn(),
  onShareReport: vi.fn().mockResolvedValue(undefined),
  onUnshareMember: vi.fn(),
  onUpdateMemberRole: vi.fn(),
  ...overrides,
});

describe('ShareReportModal', () => {
  it('renders nothing when closed', () => {
    render(<ShareReportModal {...makeProps()} isOpen={false} />);

    expect(screen.queryByText('Members')).not.toBeInTheDocument();
  });

  describe('when the viewer is the owner', () => {
    it('lists every member and marks the current user', () => {
      render(<ShareReportModal {...makeProps()} />);

      expect(screen.getByText('John Doe (You)')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('shares the report with the entered email and role', async () => {
      const props = makeProps();
      render(<ShareReportModal {...props} />);

      await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
      await userEvent.selectOptions(screen.getByLabelText('Role'), 'Can edit');
      await userEvent.click(screen.getByRole('button', { name: 'Share' }));

      expect(props.onShareReport).toHaveBeenCalledWith(
        'new@example.com',
        'EDITOR'
      );
    });

    it('removes a member', async () => {
      const props = makeProps();
      render(<ShareReportModal {...props} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove Jane Smith' })
      );

      expect(props.onUnshareMember).toHaveBeenCalledWith('share-1');
    });
  });

  describe('when the viewer is a shared member', () => {
    it('shows a read-only member list without the share form', () => {
      render(
        <ShareReportModal
          {...makeProps({ currentUserId: 'supabase-user-2', myRole: 'EDITOR' })}
        />
      );

      expect(screen.getByText('Owner')).toBeInTheDocument();
      expect(screen.getByText('Can edit')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Share' })
      ).not.toBeInTheDocument();
    });

    it('leaves the report', async () => {
      const props = makeProps({
        currentUserId: 'supabase-user-2',
        myRole: 'EDITOR',
      });
      render(<ShareReportModal {...props} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'Leave Report' })
      );

      expect(props.onLeaveReport).toHaveBeenCalled();
    });
  });
});
