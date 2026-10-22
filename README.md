# Nuxters

Collects the contributions made to Nuxt on GitHub. The leaderboard and the profiles live on https://nuxt.com/nuxters, which imports the files in `public/` on every push to `main`.

## Setup

Install the dependencies with [pnpm](https://pnpm.io):

```bash
pnpm install
```

## Contributor stats

 - Run `pnpm collect:contributors` locally with `NUXT_GITHUB_TOKEN` set to a GitHub personal access token that can read public repos.
 - The script aggregates contributions across Nuxt organizations and writes one file per period to `public/`: `contributors.json` (all time), `contributors-30d.json`, `contributors-12m.json` and `contributors-<year>.json` (from 2016).
 - Archived repositories are collected too, so archiving a repository does not remove the contributions made there.
 - Merged PRs, helpful issues and helpful comments in `nuxt/nuxt` and its former homes (`nuxt/framework`, `nuxt/docs`) count double. Each record has a `core` object with that part, so the score can be explained.
 - It also writes `profiles.json`: the name, website, social accounts (Bluesky, X, LinkedIn, Mastodon…) and country of every all-time contributor who set any on their GitHub profile. If GitHub fails to return them, the previous file is kept.
 - To test locally on a few repositories without touching `public/`: `COLLECT_REPOS=nuxt/docs,nuxt/nuxters CONTRIBUTORS_OUTPUT_DIR=/tmp/nuxters pnpm collect:contributors`.
 - `.github/workflows/update-contributors.yml` refreshes the data nightly and on demand, committing changes automatically.

## nuxters.nuxt.com

The former site is a static Vercel deployment of `public/` (see `vercel.json`):

 - Pages, profiles and README cards redirect to nuxt.com/nuxters.
 - `/contributors.json`, the other period files and `/profiles.json` are still served, as some sites read them. `/api/contributors` returns `/contributors.json`.

## License

[MIT License](./LICENSE)
