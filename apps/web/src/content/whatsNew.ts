// User-facing release notes, newest first. The "What's New" modal renders only
// the first entry (`whatsNew[0]`); the rest is retained history. Entries are
// hand-curated — drafted from `feat:`/`fix:` commits by the `/release` skill and
// then edited for tone. Keep `version` in lockstep with package.json.

export type WhatsNewItem = {
  title: string;
  description?: string;
};

export type WhatsNewRelease = {
  version: string; // matches package.json, e.g. "0.7.0"
  date: string; // ISO date, e.g. "2026-06-24"
  highlights: Array<WhatsNewItem>; // new features (from feat: commits)
  improvements?: Array<WhatsNewItem>; // notable fixes/refinements (from fix: commits)
};

export const whatsNew: Array<WhatsNewRelease> = [
  {
    version: '0.6.0',
    date: '2026-06-24',
    highlights: [
      {
        title: 'Track your service contracts',
        description:
          'Keep your real-world contracts — provider, plan, cost and renewal date — in one place, sorted by whatever expires next.',
      },
      {
        title: 'Expiring contracts on your dashboard',
        description:
          'The Overview now surfaces contracts ending within the next 30 days, so a renewal never sneaks up on you.',
      },
    ],
  },
];
