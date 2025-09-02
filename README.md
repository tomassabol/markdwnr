# markdwnr

Convert any website into LLM‑friendly Markdown.

Inspired by [into.md](https://into.md/).

## Features

- Clean Markdown from any public webpage
- Smart article extraction via Mozilla Readability, with safe fallbacks
- Returns raw `text/markdown` on success; returns an HTML error page on failure
- Simple UX: paste a URL on the homepage or put the encoded URL right in the path
- Accessible UI built with **shadcn/ui** and styled with **Tailwind CSS**
- Server‑side fetching and conversion with `jsdom` + `@mozilla/readability` + `turndown`

## Quickstart

Prerequisites: Node 20+.

Install and run dev server:

```bash
npm i
npm run dev
# or: bun install && bun dev
```

Open http://localhost:3000

## Usage

Two ways to convert:

1. Homepage form

- Paste a valid URL and click Convert. You will be redirected to the Markdown response.

2. Direct path (no UI)

- Put the percent‑encoded URL directly in the path and request it.

Examples:

```bash
# Encoded in the path
open "http://localhost:3000/https%3A%2F%2Fzod.dev%2Fv4%2Fchangelog"

# Curl the markdown
curl -s "http://localhost:3000/https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FJavaScript" -H 'Accept: text/markdown'
```

The route tolerates common mistakes:

- Plain URLs without encoding, like `/https://example.com`
- Single‑slash typos like `https:/example.com`
- Bare domains like `/example.com` (normalized to `https://example.com`)

## How it works

- `app/[...target]/route.ts` receives the request for `/<encoded-or-raw-url>`
  - Decodes and normalizes the URL
  - Fetches the HTML (with a browser‑like User‑Agent)
  - Uses `@mozilla/readability` to isolate article content when possible, then converts to Markdown with `turndown`
  - On success: returns `text/markdown`
  - On error: returns a small HTML page with an explanation

UI:

- `app/page.tsx` (server component) renders a hero and usage
- `components/url-form.tsx` (client component) handles validation, autofocus, and redirect

## Configuration

No configuration is required for local development.

Deployment (Vercel):

- Set your domain normally. The app does not require custom env vars.
- Optional: set `VERCEL_URL` (provided automatically on Vercel) for generating example links in docs/UI if you choose to enable them.

## Tech stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui
- jsdom, @mozilla/readability, turndown

## Notes & limitations

- Sites behind logins, paywalls, or heavy bot protections may fail to fetch/convert
- Respect target site Terms of Service and robots policies when scraping
- Conversion output quality varies based on source HTML
- This app does not persist content server‑side; responses are generated per request

## Acknowledgements

- Inspiration: [into.md](https://into.md/)
- Article extraction: [@mozilla/readability](https://github.com/mozilla/readability)
- HTML → Markdown: [turndown](https://github.com/mixmark-io/turndown)
- UI: [shadcn/ui](https://ui.shadcn.com/)

## License

MIT © 2025
