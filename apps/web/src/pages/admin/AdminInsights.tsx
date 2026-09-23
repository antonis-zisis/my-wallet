import { AdminOnboardingFunnel } from '../../components/admin/AdminOnboardingFunnel';
import { AdminStatTiles } from '../../components/admin/AdminStatTiles';
import { SignupsChart } from '../../components/charts/SignupsChart';
import { Button, Card, PageLayout, Skeleton } from '../../components/ui';
import { useAdminInsightsData } from '../../hooks/admin/useAdminInsightsData';

export function AdminInsights() {
  const { error, insights, loading, onRefresh } = useAdminInsightsData();

  return (
    <PageLayout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-text-primary text-2xl font-semibold">Insights</h1>
          <p className="text-text-secondary mt-1 text-sm">
            How people are actually using the app. Infrastructure metrics live
            in Cloud Run and Supabase.
          </p>
        </div>

        <Button
          className="shrink-0"
          variant="secondary"
          isLoading={loading}
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </div>

      {loading && !insights && (
        <div className="space-y-3" data-testid="admin-insights-skeleton">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {error && !insights && (
        <p className="text-center text-red-500">Failed to load insights.</p>
      )}

      {insights && (
        <div className="space-y-4">
          <AdminStatTiles insights={insights} />

          <AdminOnboardingFunnel funnel={insights.onboardingFunnel} />

          <Card>
            <div className="p-1">
              <h2 className="text-text-primary text-sm font-semibold">
                Signups per week
              </h2>
              <p className="text-text-secondary mt-0.5 mb-4 text-xs">
                Last 12 weeks.
              </p>

              {insights.signupsByWeek.length === 0 ? (
                <p className="text-text-secondary py-8 text-center text-sm">
                  No signups in this window.
                </p>
              ) : (
                <SignupsChart buckets={insights.signupsByWeek} />
              )}
            </div>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
