import { MockLink } from '@apollo/client/testing';

import { GET_NET_WORTH_SNAPSHOTS } from '../../graphql/netWorth';
import {
  GET_REPORT,
  GET_REPORTS,
  GET_REPORTS_SUMMARY,
} from '../../graphql/reports';
import { GET_SUBSCRIPTIONS } from '../../graphql/subscriptions';
import { NetWorthSnapshot } from '../../types/netWorth';
import { Report } from '../../types/report';
import { Subscription } from '../../types/subscription';

export function reportsResponse(
  reports: Array<Report> = []
): MockLink.MockedResponse {
  return {
    request: { query: GET_REPORTS },
    result: {
      data: { reports: { items: reports, totalCount: reports.length } },
    },
  };
}

export function reportsSummaryResponse(
  reports: Array<Report> = []
): MockLink.MockedResponse {
  return {
    request: { query: GET_REPORTS_SUMMARY },
    result: {
      data: { reports: { items: reports, totalCount: reports.length } },
    },
  };
}

export function reportResponse(
  id: string,
  report: Partial<Report>
): MockLink.MockedResponse {
  return {
    request: { query: GET_REPORT, variables: { id } },
    result: { data: { report: { ...report, id } } },
  };
}

export function netWorthSnapshotsResponse(
  snapshots: Array<NetWorthSnapshot> = []
): MockLink.MockedResponse {
  return {
    request: { query: GET_NET_WORTH_SNAPSHOTS, variables: { page: 1 } },
    result: {
      data: {
        netWorthSnapshots: { items: snapshots, totalCount: snapshots.length },
      },
    },
  };
}

export function subscriptionsResponse(
  subscriptions: Array<Subscription> = []
): MockLink.MockedResponse {
  return {
    request: { query: GET_SUBSCRIPTIONS, variables: { page: 1, active: true } },
    result: {
      data: {
        subscriptions: {
          items: subscriptions,
          totalCount: subscriptions.length,
        },
      },
    },
  };
}

type HomeMocksOverrides = {
  reports?: Array<Report>;
  summaryReports?: Array<Report>;
  snapshots?: Array<NetWorthSnapshot>;
  subscriptions?: Array<Subscription>;
  reportDetails?: Array<{ id: string; report: Partial<Report> }>;
};

export function homeMocks(
  overrides: HomeMocksOverrides = {}
): Array<MockLink.MockedResponse> {
  return [
    reportsResponse(overrides.reports),
    reportsSummaryResponse(overrides.summaryReports),
    netWorthSnapshotsResponse(overrides.snapshots),
    subscriptionsResponse(overrides.subscriptions),
    ...(overrides.reportDetails ?? []).map(({ id, report }) =>
      reportResponse(id, report)
    ),
  ];
}
