---
name: release
description: Prepare a release — decide the version bump from Conventional Commits, draft the user-facing "What's New" entry, and bump every package.json in lockstep. Use when the user wants to cut a release, prepare a version, or mentions "/release". Never tags or commits.
---

Prepare a release for My Wallet. You drive the version bump and the user-facing
release notes; the user always owns the final commit and tag.

This skill is **read-and-draft-then-write**. It never runs `git commit`, `git tag`,
or `git push`. It writes file changes and then hands the user the commands to run.

## Steps

### 1. Find the commit range

- Get the latest tag: `git describe --tags --abbrev=0` (e.g. `v0.6.0`).
- List the commits since then: `git log <tag>..HEAD --no-merges --pretty=format:'%s'`.
- If there are no commits since the last tag, stop and tell the user there is
  nothing to release.

### 2. Decide the bump type (Conventional Commits)

Scan the commit subjects:

- Any `feat!:` / `fix!:` / a `BREAKING CHANGE` footer → **major**.
- Otherwise any `feat:` → **minor**.
- Otherwise (only `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `perf:`, `style:`) → **patch**.

Compute the next version from the current `version` in the root `package.json`.

### 3. Draft the "What's New" entry

The entry is **user-facing copy**, not raw commit text. Translate.

- `feat:` commits → `highlights`. Rewrite each as a benefit the user feels
  ("Track your service contracts and never miss a renewal"), not the mechanics
  ("add contracts data layer and components"). Merge commits that are facets of
  one feature into a single highlight. Drop internal-only feats.
- Notable `fix:` commits → `improvements` (optional). Only surface fixes a user
  would actually notice. Skip them entirely if none qualify.
- The entry must **never be empty**: a pure-patch release should still produce at
  least one `improvements` line so the modal matches the displayed version.
- `date` is today's date in ISO format (`YYYY-MM-DD`).
- `version` matches the new version number (no `v` prefix).

### 4. Present the draft for review

Show the proposed version, bump type, and the full drafted entry **in chat**.
Let the user edit tone and wording. Do **not** write any files yet. Iterate until
they approve.

### 5. On approval, write the changes

- Prepend the approved entry to the `whatsNew` array (newest first) in
  `apps/web/src/content/whatsNew.ts`.
- Bump the `version` field in **all three** package.json files in lockstep to the
  new version: `package.json`, `apps/web/package.json`, `apps/server/package.json`.

### 6. Hand off — do not commit

Print the commands for the user to run themselves, e.g.:

```bash
git add -A
git commit -m "chore: release v<new-version>"
git tag v<new-version>
```

Remind them the tag is what a future `/release` run reads as the previous release
boundary, so the commit + tag should land before the next release is prepared.

## Notes

- The version shown in the app is injected by Vite from `apps/web/package.json`
  (see `vite.config.ts` → `__APP_VERSION__`). Keeping the three package.json
  versions identical is the repo convention — bump them together, always.
- The runtime "What's New" modal renders only `whatsNew[0]`; older entries are
  retained history.
