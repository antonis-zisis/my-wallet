import { MockLink } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const showSuccess = vi.fn();
const showError = vi.fn();
const showInfo = vi.fn();
vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({ showSuccess, showError, showInfo }),
}));

import { SHARE_REPORT } from '../../graphql/reports';
import { MockedProvider } from '../../test/apollo-test-utils';
import { makeReportMember } from '../../test/fixtures';
import { useReportSharing } from './useReportSharing';

const shareVariables = {
  input: { reportId: 'report-1', email: 'jane@example.com', role: 'VIEWER' },
};

const shareSuccessMock: MockLink.MockedResponse = {
  request: { query: SHARE_REPORT, variables: shareVariables },
  result: {
    data: {
      shareReport: {
        id: 'report-1',
        members: [
          makeReportMember(),
          makeReportMember({
            id: 'share-1',
            userId: 'supabase-user-2',
            email: 'jane@example.com',
            fullName: 'Jane Smith',
            role: 'VIEWER',
          }),
        ],
      },
    },
  },
};

const shareErrorMock: MockLink.MockedResponse = {
  request: { query: SHARE_REPORT, variables: shareVariables },
  result: {
    errors: [new GraphQLError('This report is already shared with that user')],
  },
};

const renderUseReportSharing = (mocks: Array<MockLink.MockedResponse>) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

  return renderHook(() => useReportSharing({ reportId: 'report-1' }), {
    wrapper,
  });
};

describe('useReportSharing', () => {
  beforeEach(() => {
    showSuccess.mockReset();
    showError.mockReset();
  });

  it('shows a success toast after sharing the report', async () => {
    const { result } = renderUseReportSharing([shareSuccessMock]);

    await act(async () => {
      await result.current.onShareReport('jane@example.com', 'VIEWER');
    });

    expect(showSuccess).toHaveBeenCalledWith('Report shared.');
  });

  it('shows the server message in an error toast when sharing fails', async () => {
    const { result } = renderUseReportSharing([shareErrorMock]);

    await act(async () => {
      await result.current
        .onShareReport('jane@example.com', 'VIEWER')
        .catch(() => {});
    });

    expect(showError).toHaveBeenCalledWith(
      'This report is already shared with that user'
    );
  });
});
