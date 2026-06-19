import { NetWorthSnapshot } from '../../../types/netWorth';
import { abbreviateReportTitle } from '../../../utils/abbreviateReportTitle';

type TrendSnapshot = Pick<
  NetWorthSnapshot,
  | 'id'
  | 'title'
  | 'netWorth'
  | 'totalAssets'
  | 'totalLiabilities'
  | 'snapshotDate'
>;

export type TrendChartDatum = {
  snapshotDate: string;
  id: string;
  name: string;
  netWorth: number;
  title: string;
  totalAssets: number;
  totalLiabilities: number;
};

export function buildTrendChartData(
  snapshots: Array<TrendSnapshot>
): Array<TrendChartDatum> {
  return [...snapshots.slice(0, 10)].reverse().map((snapshot) => ({
    snapshotDate: snapshot.snapshotDate,
    id: snapshot.id,
    name: abbreviateReportTitle(snapshot.title),
    netWorth: snapshot.netWorth,
    title: snapshot.title,
    totalAssets: snapshot.totalAssets,
    totalLiabilities: snapshot.totalLiabilities,
  }));
}
