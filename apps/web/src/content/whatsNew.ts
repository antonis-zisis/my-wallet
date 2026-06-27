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
    date: '2026-06-27',
    highlights: [
      {
        title: 'Track your service contracts',
        description:
          'Keep your real-world contracts - provider, plan, cost and renewal date - in one place, sorted by whatever expires next. The Overview surfaces anything ending within 30 days so a renewal never sneaks up on you.',
      },
      {
        title: 'Organise subscriptions by category',
        description:
          'Group your subscriptions into categories to see where your recurring spend really goes.',
      },
      {
        title: 'Real logos for your subscriptions',
        description:
          'Your subscriptions list now shows each service’s real logo, so you can scan it at a glance instead of reading every name.',
      },
      {
        title: 'Search and sort your lists',
        description:
          'Find things faster - your lists now support search and sorting wherever it helps.',
      },
      {
        title: 'Export report transactions as CSV',
        description:
          'Download any report’s transactions as a CSV to dig in elsewhere or keep your own records.',
      },
    ],
    improvements: [
      {
        title: 'Subscriptions sort by their real next renewal',
        description:
          'Your subscriptions list now orders by the actual computed next-renewal date.',
      },
      {
        title: 'Clearer subscription costs',
        description:
          'Subscription costs are presented more clearly across the app.',
      },
      {
        title: 'Correct billing cycle badge',
        description:
          'The billing cycle badge now shows the right cycle for every subscription.',
      },
    ],
  },
];
