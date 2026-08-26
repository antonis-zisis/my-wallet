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
    version: '0.9.0',
    date: '2026-08-26',
    highlights: [
      {
        title: 'See how your spending moves, category by category',
        description:
          'A new Trends page charts what you spend per category, month by month, across every report you can see - including ones shared with you. Scan the grid of sparklines to spot what is climbing, then click any category for a full monthly breakdown. Pick a 3, 6, 9 or 12 month window.',
      },
      {
        title: 'My Wallet on your phone',
        description:
          'The whole app now works on a phone screen - a collapsible menu, transactions as readable cards instead of a squeezed table, and forms and charts that fit the viewport. You can also install it to your home screen and open it like a native app.',
      },
      {
        title: 'Reset a forgotten password',
        description:
          'Locked out? Request a reset link from the login page and set a new password without needing anyone to help.',
      },
    ],
    improvements: [
      {
        title: 'More warning before a contract expires',
        description:
          'The Overview now flags contracts ending within 90 days instead of 30, giving you time to actually do something about it.',
      },
      {
        title: 'A tidier Overview',
        description:
          'Reports with no transactions yet are hidden from the Overview, so the page shows only what you are actually tracking.',
      },
      {
        title: 'Easier navigation on long pages',
        description:
          'The navigation bar stays with you as you scroll, and a scroll-to-top button appears once you have moved down the page.',
      },
      {
        title: 'Lists no longer jump while loading',
        description:
          'The reports search and sort controls and the trends grid now hold their place as data loads, instead of shifting the page once it arrives.',
      },
    ],
  },
  {
    version: '0.8.0',
    date: '2026-07-18',
    highlights: [
      {
        title: 'Share reports with others',
        description:
          'Invite other My Wallet users to view or edit a report by email. Editors can add, edit, and delete transactions; owners keep control of who has access and can change roles or remove people at any time. Shared reports show everyone with access at a glance.',
      },
    ],
    improvements: [
      {
        title: 'Clearer report menu icons',
        description:
          'The report header menu now shows icons next to Export, Rename, and Delete so actions are easier to spot.',
      },
    ],
  },
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
