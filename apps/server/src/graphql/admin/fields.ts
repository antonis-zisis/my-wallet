type AdminUserParent = {
  _count: {
    contracts: number;
    netWorthSnapshots: number;
    reportShares: number;
    reports: number;
    subscriptions: number;
  };
  sharedOwnedReportCount?: number;
  transactionCount?: number;
};

export const adminUserFieldResolvers = {
  counts: (parent: AdminUserParent) => ({
    contracts: parent._count.contracts,
    netWorthSnapshots: parent._count.netWorthSnapshots,
    reports: parent._count.reports,
    sharedOwnedReports: parent.sharedOwnedReportCount ?? 0,
    sharedReports: parent._count.reportShares,
    subscriptions: parent._count.subscriptions,
    transactions: parent.transactionCount ?? 0,
  }),
};
