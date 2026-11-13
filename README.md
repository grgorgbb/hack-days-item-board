# Hack Days · Item Board

An optional starting point for whatever you want to build. A small website, a Cloudflare Worker, and a D1 database. Save, edit and delete items. No AI is prebuilt: add your own feature.

## Deploy your own board

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/quinndines/hack-days-cloudflare-starter)

1. Click **Deploy to Cloudflare** and sign in or create a Cloudflare account.
2. Connect your GitHub account. Cloudflare copies this repository into your account.
3. Choose names for your repository, Worker and D1 database. Keep the deploy command as `npm run deploy`.
4. Deploy, then open the resulting `.workers.dev` link. Your board starts empty.

Cloudflare creates and connects your own database; the deploy command creates its tables. No API key or manual database-ID copying is needed. Your posts are separate from the MLH demo and everyone else's board.

To build on it, clone the repository Cloudflare created into your editor or coding agent of choice. Follow the local steps below. Pushing changes to its connected production branch triggers another deployment.

## Start locally

Install Node.js 22 or newer, then open this folder in your editor:

```sh
npm ci
npm run db:local
npm run dev
```

Open http://localhost:8787. This uses Cloudflare’s local D1 engine and does not require a Cloudflare login. Data persists in `.wrangler/` across restarts. The public template starts empty.

## Put it on Cloudflare

```sh
npx wrangler login
npm run setup:cloudflare
npm run deploy
```

The setup command creates a D1 database and writes its binding to `wrangler.json`. If that database name already exists, select a new name in the config or use the existing database’s ID from your dashboard. Local and deployed databases are separate: your local notes are not uploaded by deployment. Add your sample notes again on the deployed site.

## Make it yours

- `public/index.html`: headings, form and board.
- `public/style.css`: visual design.
- `public/app.js`: browser interactions and API requests.
- `src/index.js`: Worker routes and explicit database queries.
- `migrations/0001_items.sql`: one small table.
- `wrangler.json`: the connection to Cloudflare.

Change the item fields, turn cards into a tracker, add a new view, or connect Workers AI. This foundation does not fetch external sports or weather data for you.

## Before sharing an app widely

This is a small shared demonstration board, with no user accounts. Anyone who has the deployed URL can read and change its items. Use sample notes; add authentication and appropriate usage controls for your project before storing private data or operating a public service. The list shows the newest 100 items.

## Check your changes

```sh
npm run check
npm test
npx wrangler deploy --dry-run
```

Tests exercise CRUD with the local D1 engine. Runtime/test dependencies are pinned in the lockfile. You can use any editor or coding assistant; Copilot is optional.

## Official references

- [Workers](https://developers.cloudflare.com/workers/)
- [D1](https://developers.cloudflare.com/d1/get-started/)
- [Workers AI bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/)
- [Deploy buttons](https://developers.cloudflare.com/workers/platform/deploy-buttons/)

## Theme assets

The minimal theme follows [mlh.com](https://www.mlh.com/): Roboto Mono, navy and a small yellow accent. The official MLH logo is from [MLH brand assets](https://static.mlh.io/brand-assets/logo/official/mlh-logo-color.svg). MLH and Cloudflare logos remain their respective owners’ branding and are not covered by the source code’s MIT license. The Cloudflare logo was supplied for this demo. Roboto Mono is bundled under the SIL Open Font License in `public/fonts/OFL.txt`.
