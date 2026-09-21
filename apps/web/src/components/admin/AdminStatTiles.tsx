import { AdminInsights } from '../../types/admin';
import { Card } from '../ui';

type AdminStatTilesProps = {
  insights: AdminInsights;
};

type TileProps = {
  hint?: string;
  label: string;
  value: number;
};

function Tile({ hint, label, value }: TileProps) {
  return (
    <Card>
      <div className="p-1">
        <p className="text-text-secondary text-xs">{label}</p>
        <p className="text-text-primary mt-1 text-2xl font-semibold">{value}</p>
        {hint && <p className="text-text-tertiary mt-0.5 text-xs">{hint}</p>}
      </div>
    </Card>
  );
}

export function AdminStatTiles({ insights }: AdminStatTilesProps) {
  const share = (value: number) =>
    insights.registeredUsers === 0
      ? undefined
      : `${Math.round((value / insights.registeredUsers) * 100)}% of all users`;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile label="Registered" value={insights.registeredUsers} />
      <Tile
        hint={share(insights.activeUsers24h)}
        label="Active (24h)"
        value={insights.activeUsers24h}
      />
      <Tile
        hint={share(insights.activeUsers7d)}
        label="Active (7d)"
        value={insights.activeUsers7d}
      />
      <Tile
        hint={share(insights.activeUsers30d)}
        label="Active (30d)"
        value={insights.activeUsers30d}
      />
    </div>
  );
}
