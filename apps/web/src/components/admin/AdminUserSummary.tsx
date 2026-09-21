import { AdminUser, SUPERADMIN_ROLE } from '../../types/admin';
import { formatDate } from '../../utils/formatDate';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { getAvatarData } from '../../utils/getAvatarData';
import { Avatar, Badge, Card } from '../ui';

type AdminUserSummaryProps = {
  user: AdminUser;
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-text-tertiary text-xs">{label}</p>
      <p className="text-text-primary text-sm font-medium">{value}</p>
    </div>
  );
}

export function AdminUserSummary({ user }: AdminUserSummaryProps) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3 p-1">
          <Avatar {...getAvatarData(user)} size="lg" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-text-primary truncate font-medium">
                {user.fullName ?? user.email}
              </p>

              {user.role === SUPERADMIN_ROLE && (
                <Badge variant="warning" size="sm">
                  Superadmin
                </Badge>
              )}
            </div>
            <p className="text-text-secondary truncate text-sm">{user.email}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-2 gap-4 p-1 sm:grid-cols-4">
          <Stat label="Joined" value={formatDate(user.createdAt)} />
          <Stat
            label="Last seen"
            value={
              user.lastSeenAt
                ? formatRelativeTime(user.lastSeenAt)
                : 'Never signed in'
            }
          />
          <Stat label="Currency" value={user.currency} />
          <Stat
            label="Onboarding"
            value={user.onboardingCompletedAt ? 'Complete' : 'Incomplete'}
          />
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-2 gap-4 p-1 sm:grid-cols-3">
          <Stat label="Reports" value={user.counts.reports} />
          <Stat label="Transactions" value={user.counts.transactions} />
          <Stat label="Subscriptions" value={user.counts.subscriptions} />
          <Stat label="Contracts" value={user.counts.contracts} />
          <Stat
            label="Net worth snapshots"
            value={user.counts.netWorthSnapshots}
          />
          <Stat
            label="Reports shared with them"
            value={user.counts.sharedReports}
          />
        </div>
      </Card>
    </div>
  );
}
