// user-facing release notes, newest first. The "What's New" modal renders only the first entry (`whatsNew[0]`); the rest is retained history

export type WhatsNewItem = {
  title: string;
  description?: string;
};

export type WhatsNewRelease = {
  version: string;
  date: string;
  highlights: Array<WhatsNewItem>;
  improvements?: Array<WhatsNewItem>;
};

export const whatsNew: Array<WhatsNewRelease> = [
  {
    version: '0.7.0',
    date: '2026-06-25',
    highlights: [
      {
        title: 'Track your service contracts',
        description:
          'Keep your real-world contracts — provider, plan, cost and renewal date — in one place, sorted by whatever expires next. The Overview surfaces anything ending within 30 days so a renewal never sneaks up on you.',
      },
      {
        title: 'Organise subscriptions by category',
        description:
          'Group your subscriptions into categories to see where your recurring spend really goes.',
      },
      {
        title: 'Export report transactions as CSV',
        description:
          'Download any report’s transactions as a CSV to dig in elsewhere or keep your own records.',
      },
      {
        title: 'See what’s new and which version you’re on',
        description:
          'A “What’s New” release-notes view, plus the app version on your Profile, so you always know what changed.',
      },
    ],
    improvements: [
      {
        title: 'Subscriptions sort by their real next renewal',
        description:
          'Your subscriptions list now orders by the actual computed next-renewal date.',
      },
    ],
  },
];
