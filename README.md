# Placement Portal Monitoring Bot — Simple (cron + retry) version

Logs into the placement portal on a schedule, scrapes new listings, dedupes
against Supabase, and emails a notification for anything genuinely new.

This is the **no-Redis, no-BullMQ** version of the project: one process,
`node-cron` for scheduling, and a manual retry-with-backoff helper for
transient failures (login timeouts, network blips). No queue, no worker
process, no Redis dependency at all.

## Why this version instead of the BullMQ one

- Simpler to deploy — one process, one service, no separate Redis instance
  to provision or debug.
- No distributed workers, no durable job history in Redis, no crash-recovery
  via job re-queuing — for a single-portal polling bot running as one
  process, that tradeoff is usually fine.
- If you later need multiple workers, retry visibility, or job persistence
  across restarts, that's the signal to move back to the BullMQ + Redis
  architecture instead.

## Setup

```bash
npm install
cp .env.example .env
# fill in real values in .env
npm start
```

`npm start` runs one cycle immediately, then re-runs on the schedule set by
`CRON_SCHEDULE` in `.env` (default: every 10 minutes, cron syntax).

## Files

- `src/config.js` — loads and organizes all env vars into one config object
- `src/scraper.js` — login (cookie-jar based) + dashboard scraping (Cheerio)
- `src/fingerprint.js` — SHA-256 hash of stable fields, used for dedup
- `src/db.js` — Supabase read (`isDuplicate`) + write (`saveListing`)
- `src/notify.js` — Gmail SMTP email via Nodemailer
- `src/retry.js` — generic retry-with-backoff wrapper used around login/scrape
- `src/index.js` — entrypoint: schedules `runCycle()` via node-cron, runs once
  immediately on boot

## Supabase table

You'll need a `listings` table with at least: `title`, `company`, `deadline`,
`raw`, `fingerprint` (unique constraint recommended), `created_at`.

## Adapting to your real portal

The selectors in `scraper.js` (`$('table tr')`, the login success check) are
placeholders — inspect your actual portal's HTML (DevTools → Network/Elements)
and adjust them to match the real markup, the same way the BullMQ version's
selectors were derived from real inspection rather than guesses.

## Deployment note

Unlike the BullMQ version, this is a **single process** — one Railway service
(or equivalent) running `npm start` is enough. No second worker service, no
Redis add-on needed.
