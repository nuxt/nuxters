[![Nuxters](./public/social-card.jpg)](https://nuxters.nuxt.com)

# Nuxters

Discover the number of contributions you made to Nuxt and get the Nuxter badge on [Nuxt Discord server](https://chat.nuxt.dev).

https://nuxters.nuxt.com

## Setup

Install the dependencies with [pnpm](https://pnpm.js.org/en/):

```bash
pnpm install
```

Next, copy the `.env.example` to `.env` and fill the env variables.

## Development

Start the development server on http://localhost:3000:

```bash
pnpm dev
```

## Contributor stats

 - Run `pnpm collect:contributors` locally with `NUXT_GITHUB_TOKEN` set to a GitHub personal access token that can read public repos.
 - The script aggregates contributions across Nuxt organizations and writes the results to `public/contributors.json`.
- `.github/workflows/update-contributors.yml` refreshes the data nightly and on demand, committing changes automatically.

### License

[MIT License](./LICENSE)
